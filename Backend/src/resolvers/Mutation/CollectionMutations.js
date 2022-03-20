const { AuthenticationError } = require('apollo-server-express');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   collectionGroupFields,
   smallThingCardFields,
   fullPersonalLinkFields,
   fullCollectionFields
} = require('../../utils/CardInterfaces');
const { getRandomString } = require('../../utils/TextHandling');
const { simpleAddLink } = require('./LinkArchiveMutations');
const { publishMeUpdate } = require('./MemberMutations');

const getFriends = friendsArray => friendsArray.map(friendObj => friendObj.id);

const getFriendsOfFriends = friendsArray => {
   let friendsOfFriends = [];
   friendsArray.forEach(friendObj => {
      const newFriendsOfFriends = friendObj.friends.map(
         friendOfFriendObj => friendOfFriendObj.id
      );
      friendsOfFriends = friendsOfFriends.concat(newFriendsOfFriends);
   });
   return friendsOfFriends;
};

async function checkCollectionPermissions(id, type, action, ctx) {
   // First let's just make sure it doesn't matter how they've cased their type input
   let properlyCasedType;
   if (type.toLowerCase() === 'collection') {
      properlyCasedType = 'collection';
   } else if (type.toLowerCase() === 'collectiongroup') {
      properlyCasedType = 'collectionGroup';
   } else if (type.toLowerCase() === 'note') {
      properlyCasedType = 'note';
   }

   // Also let's do that for the action
   const lowerCasedAction = action.toLowerCase();

   // Then let's figure out which fields we're going to need
   let fields;
   if (properlyCasedType === 'collection') {
      fields = `{privacy author {id} editors {id} viewers {id}}`;
   } else if (properlyCasedType === 'collectionGroup') {
      fields = `{inCollection {privacy author {id} editors {id} viewers {id}}}`;
   } else if (properlyCasedType === 'note') {
      fields = `{onCollectionGroup {inCollection {privacy author {id} editors {id} viewers {id}}}}`;
   }

   // And get the data for the item we're checking
   const dataObj = await ctx.db.query[properlyCasedType](
      {
         where: {
            id
         }
      },
      fields
   );

   if (dataObj == null) {
      throw new Error('No collection found for that ID');
   }

   // Next we need to extract the privacy setting, as well as the allowed viewers, editors, and author from our data
   let privacy;
   let viewers;
   let editors;
   let author;
   if (type === 'collection') {
      ({ privacy, viewers, editors, author } = dataObj);
   } else if (type === 'collectionGroup') {
      ({ privacy, viewers, editors, author } = dataObj.inCollection);
   } else if (type === 'note') {
      ({
         privacy,
         viewers,
         editors,
         author
      } = dataObj.onCollectionGroup.inCollection);
   }

   const viewerIDs = viewers.map(viewerObj => viewerObj.id);
   const editorIDs = editors.map(editorObj => editorObj.id);
   const authorID = author.id;
   const currentMemberID = ctx.req.memberId;

   // Authors can always view and edit their own collections, so let's get that out of the way first
   if (authorID === currentMemberID) return true;

   // If they're trying to edit something, they have to be specifically listed as an editor and the privacy doesn't matter. So we can handle those cases easily too.
   if (lowerCasedAction === 'edit') {
      if (editorIDs.includes(currentMemberID)) return true;
      return false;
   }

   // If it's public, that's easy, they can view it.
   if (privacy === 'Public') return true;

   // If it's private, we don't need to do the member query because all we need is the viewers from the original dataObj. And if the member is in the viewers list, we don't need to do the query either. So let's get those possibilities out of the way before we do that query
   if (viewerIDs.includes(currentMemberID)) return true;
   if (privacy === 'Private') {
      return false;
   }

   // If it's not public or private, then we're going to need to get the member's friends and friends of friends to determine if they can see it
   const memberObj = await ctx.db.query.member(
      {
         where: {
            id: currentMemberID
         }
      },
      `{friends {id friends {id}}}`
   );

   const friends = getFriends(memberObj.friends);
   const friendsOfFriends = getFriendsOfFriends(memberObj.friends);

   if (privacy === 'Friends') {
      if (friends.includes(currentMemberID)) return true;
      return false;
   }

   if (privacy === 'FriendsOfFriends') {
      if (friendsOfFriends.includes(currentMemberID)) return true;
      return false;
   }

   throw new Error(
      'Something has gone wrong with your authorization. Please try again.'
   );
}
exports.checkCollectionPermissions = checkCollectionPermissions;

async function publishCollectionUpdate(collectionID, ctx) {
   const collectionData = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{${fullCollectionFields}}`
   );

   ctx.pubsub.publish('collection', {
      collection: {
         node: collectionData
      }
   });

   // We're also going to use this opportunity to update the lastActiveCollection of the current member
   ctx.db.mutation.updateMember({
      where: {
         id: ctx.req.memberId
      },
      data: {
         lastActiveCollection: {
            connect: {
               id: collectionID
            }
         }
      }
   });
}

async function findParentCollectionAndPublishUpdate(dataObj, ctx) {
   if (dataObj.__typename === 'CollectionGroup') {
      if (dataObj.inCollection != null && dataObj.inCollection.id != null) {
         publishCollectionUpdate(dataObj.inCollection.id, ctx);
      } else {
         const collectionGroupObj = await ctx.db.query.collectionGroup(
            {
               where: {
                  id: dataObj.id
               }
            },
            `{inCollection {id}}`
         );
         publishCollectionUpdate(collectionGroupObj.inCollection.id, ctx);
      }
   } else if (dataObj.__typename === 'Note') {
      if (
         dataObj.onCollectionGroup != null &&
         dataObj.onCollectionGroup.inCollection != null &&
         dataObj.onCollectionGroup.inCollection.id != null
      ) {
         publishCollectionUpdate(
            dataObj.onCollectionGroup.inCollection.id,
            ctx
         );
      } else {
         const noteObj = await ctx.db.query.note(
            {
               where: {
                  id: dataObj.id
               }
            },
            `{onCollectionGroup {inCollection {id}}}`
         );
         publishCollectionUpdate(
            noteObj.onCollectionGroup.inCollection.id,
            ctx
         );
      }
   }
}

async function addCollection(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First we want to create a new collection. We'll need to seed it with a starting group, so let's make a new group first. We have to make it separately so we can pass its id to columnOrders.

   const newGroup = await ctx.db.mutation.createCollectionGroup(
      {
         data: {
            title: 'Untitled Group'
         }
      },
      `{id}`
   );
   const newCollection = await ctx.db.mutation
      .createCollection(
         {
            data: {
               author: {
                  connect: {
                     id: ctx.req.memberId
                  }
               },
               userGroups: {
                  connect: {
                     id: newGroup.id
                  }
               },
               columnOrders: {
                  create: {
                     order: {
                        set: [newGroup.id]
                     }
                  }
               }
            }
         },
         `{id title}`
      )
      .catch(err => {
         console.log(err);
      });

   // Then we want to set the lastActiveCollection of the current member to that collection
   const updatedMember = await ctx.db.mutation.updateMember({
      where: {
         id: ctx.req.memberId
      },
      data: {
         lastActiveCollection: {
            connect: {
               id: newCollection.id
            }
         }
      }
   });

   // Then we return the current member
   const newMe = await publishMeUpdate(ctx);
   return newMe;
}
exports.addCollection = addCollection;

async function deleteCollection(parent, { collectionID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We need to delete the provided collection and set the lastActiveCollection to the last collection in the member's collection list

   // So first we need to get the member so we can pull their collections list
   const originalMemberData = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{lastActiveCollection {id} collections {id} }`
   );
   const { lastActiveCollection, collections } = originalMemberData;

   // Only the original author of a collection can delete it, so let's make sure this is that member first
   const [thisCollection] = collections.filter(
      collection => collection.id === collectionID
   );
   if (thisCollection == null) {
      throw new AuthenticationError(
         'Only the original author of a collection can delete it, sorry.'
      );
   }

   // First let's delete any groups in the collection
   await ctx.db.mutation.deleteManyCollectionGroups({
      where: {
         inCollection: collectionID
      }
   });

   // Then we delete the collection itself. We might need to set the last active collection to something different as well.
   const filteredCollections = collections.filter(
      collection => collection.id !== collectionID
   );

   const data = {
      collections: {
         delete: {
            id: collectionID
         }
      }
   };

   if (
      filteredCollections.length > 0 &&
      lastActiveCollection.id === thisCollection.id
   ) {
      data.lastActiveCollection = {
         connect: {
            id: filteredCollections[filteredCollections.length - 1].id
         }
      };
   }

   const updatedMember = await ctx.db.mutation.updateMember({
      where: {
         id: ctx.req.memberId
      },
      data
   });

   // Then we return the current member
   const newMe = await publishMeUpdate(ctx);
   return newMe;
}
exports.deleteCollection = deleteCollection;

async function setActiveCollection(parent, { collectionID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to set the lastActiveCollection of the current member to the provided collection
   await ctx.db.mutation.updateMember({
      where: {
         id: ctx.req.memberId
      },
      data: {
         lastActiveCollection: {
            connect: {
               id: collectionID
            }
         }
      }
   });

   // Then we return the current member
   const newMe = await publishMeUpdate(ctx);
   return newMe;
}
exports.setActiveCollection = setActiveCollection;

async function renameCollection(parent, { collectionID, newTitle }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   // We just need to update the title of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection({
      where: {
         id: collectionID
      },
      data: {
         title: newTitle
      }
   });

   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.renameCollection = renameCollection;

async function addGroupToCollection(
   parent,
   { collectionID, newGroupID, columnID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   // First we need to get the old order for the provided column
   const oldColumnOrder = await ctx.db.query.columnOrder(
      {
         where: {
            id: columnID
         }
      },
      `{order}`
   );

   // Then we need to add our new group to that order if it exists, or create a new order with our groupID if it doesn't
   let newColumnOrder;
   if (oldColumnOrder != null) {
      newColumnOrder = [...oldColumnOrder.order, newGroupID];
   } else {
      newColumnOrder = [newGroupID];
   }

   // We just need to create a new user group for the provided collection and upsert the new column order
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            userGroups: {
               create: {
                  id: newGroupID
               }
            },
            columnOrders: {
               upsert: {
                  where: {
                     id: columnID
                  },
                  update: {
                     order: {
                        set: newColumnOrder
                     }
                  },
                  create: {
                     id: columnID,
                     order: {
                        set: newColumnOrder
                     }
                  }
               }
            }
         }
      },
      `{id userGroups {${collectionGroupFields}} columnOrders {__typename id order}}`
   );

   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.addGroupToCollection = addGroupToCollection;

async function deleteGroupFromCollection(
   parent,
   { collectionID, groupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const data = {};
   // First we need to remove the group's ID from any columns it might be in
   const originalCollection = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{columnOrders {id order}}`
   );
   for (const columnOrder of originalCollection.columnOrders) {
      if (columnOrder.order.includes(groupID)) {
         const newColumnOrder = columnOrder.order.filter(id => id !== groupID);
         const newColumnOrderData = await ctx.db.mutation.updateColumnOrder({
            where: {
               id: columnOrder.id
            },
            data: {
               order: {
                  set: newColumnOrder
               }
            }
         });
      }
   }

   // Then we just need to delete the userGroup from the provided collection
   data.userGroups = {
      delete: {
         id: groupID
      }
   };

   // Then we update the collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data
      },
      `{id userGroups {${collectionGroupFields}}}`
   );

   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.deleteGroupFromCollection = deleteGroupFromCollection;

async function renameGroupOnCollection(
   parent,
   { collectionID, groupID, newTitle },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   // first we need to change the title of the provided group
   await ctx.db.mutation.updateCollectionGroup({
      where: {
         id: groupID
      },
      data: {
         title: newTitle
      }
   });

   // Then we need to return the selected collection
   const updatedCollection = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{id userGroups {${collectionGroupFields}}}`
   );
   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.renameGroupOnCollection = renameGroupOnCollection;

async function copyThingToCollectionGroup(
   parent,
   { collectionID, thingID, targetGroupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   // First we need to pull the provided group so we can get its order array
   const oldGroup = await ctx.db.query.collectionGroup(
      {
         where: {
            id: targetGroupID
         }
      },
      `{order, things {id}}`
   );

   const { order, things } = oldGroup;

   let newOrder;
   if (order == null) {
      newOrder = things.map(thing => thing.id);
      newOrder.sort((a, b) => {
         if (a < b) {
            return 1;
         }
         return -1;
      });
      newOrder.push(thingID);
   } else {
      newOrder = [...order, thingID];
   }

   // first we need to connect the thing to the provided group
   await ctx.db.mutation.updateCollectionGroup({
      where: {
         id: targetGroupID
      },
      data: {
         things: {
            connect: {
               id: thingID
            }
         },
         order: {
            set: newOrder
         }
      }
   });

   // Then we need to return the selected collection
   const updatedCollection = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{id userGroups {${collectionGroupFields}}}`
   );
   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.copyThingToCollectionGroup = copyThingToCollectionGroup;

async function addLinkToCollectionGroup(
   parent,
   { url, groupID, position },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   // First we need to check if the member has already added this link, and if not, we need to create a new personal link
   const existingLink = await ctx.db.query.personalLinks(
      {
         where: {
            AND: [
               {
                  owner: {
                     id: ctx.req.memberId
                  }
               },
               {
                  url
               }
            ]
         }
      },
      `{${fullPersonalLinkFields}}`
   );

   let linkObject;
   if (existingLink != null && existingLink.length > 0) {
      [linkObject] = existingLink;
   } else {
      linkObject = await simpleAddLink(ctx, url);
   }

   // Then we need to check if the link is already in the group. And while we're doing that, we might as well grab the order of the group, because we'll need that next.
   const oldGroupData = await ctx.db.query.collectionGroup(
      {
         where: {
            id: groupID
         }
      },
      `{includedLinks {url} order}`
   );

   let linkAlreadyIncluded = false;
   oldGroupData.includedLinks.forEach(linkData => {
      if (linkData.url === url) {
         linkAlreadyIncluded = true;
      }
   });
   if (linkAlreadyIncluded) {
      throw new Error("You've already added that link to that group.");
   }

   const { order } = oldGroupData;
   if (position != null) {
      order.splice(position, 0, linkObject.id);
   } else {
      order.push(linkObject.id);
   }

   // Then we add that link to the CollectionGroup
   const updatedGroup = await ctx.db.mutation.updateCollectionGroup(
      {
         where: {
            id: groupID
         },
         data: {
            includedLinks: {
               connect: {
                  id: linkObject.id
               }
            },
            order: {
               set: order
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   findParentCollectionAndPublishUpdate(updatedGroup, ctx);
   return updatedGroup;
}
exports.addLinkToCollectionGroup = addLinkToCollectionGroup;

async function removeLinkFromCollectionGroup(
   parent,
   { linkID, groupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedGroup = await ctx.db.mutation.updateCollectionGroup(
      {
         where: {
            id: groupID
         },
         data: {
            includedLinks: {
               disconnect: {
                  id: linkID
               }
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   findParentCollectionAndPublishUpdate(updatedGroup, ctx);
   return updatedGroup;
}
exports.removeLinkFromCollectionGroup = removeLinkFromCollectionGroup;

async function reorderGroups(
   parent,
   { groupOneID, newOrderOne, groupTwoID, newOrderTwo },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupOneID != null ? groupOneID : groupTwoID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedGroupsArray = [];

   // If we got a groupOneID and a newOrderOne, we update groupOne and put the updated group data in an array
   if (groupOneID != null && newOrderOne != null) {
      const updatedGroupOne = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: groupOneID
            },
            data: {
               order: {
                  set: newOrderOne
               }
            }
         },
         `{__typename id order}`
      );
      updatedGroupsArray.push(updatedGroupOne);
   }

   // Then we check if a group two was provided, and if it was we update that group and add it to our updatedGroupsArray
   if (groupTwoID != null && newOrderTwo != null) {
      const updatedGroupTwo = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: groupTwoID
            },
            data: {
               order: {
                  set: newOrderTwo
               }
            }
         },
         `{__typename id order}`
      );
      updatedGroupsArray.push(updatedGroupTwo);
   }

   findParentCollectionAndPublishUpdate(updatedGroupsArray[0], ctx);
   return updatedGroupsArray;
}
exports.reorderGroups = reorderGroups;

async function moveCardToGroup(
   parent,
   { linkID, cardType, sourceGroupID, destinationGroupID, newPosition },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      sourceGroupID != null ? sourceGroupID : destinationGroupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedGroupsArray = [];

   // If we got a sourceGroupID, then we disconnect the thing from the sourceGroup
   if (sourceGroupID != null) {
      const oldSourceGroupData = await ctx.db.query.collectionGroup(
         {
            where: {
               id: sourceGroupID
            }
         },
         `{order}`
      );

      const { order: sourceOrder } = oldSourceGroupData;
      const newSourceOrder = sourceOrder.filter(
         existingID => existingID !== linkID
      );

      const data = {
         order: {
            set: newSourceOrder
         }
      };

      if (cardType === 'note') {
         data.notes = {
            disconnect: {
               id: linkID
            }
         };
      } else {
         data.includedLinks = {
            disconnect: {
               id: linkID
            }
         };
      }

      const updatedFromGroup = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: sourceGroupID
            },
            data
         },
         `{${collectionGroupFields}}`
      );
      updatedGroupsArray.push(updatedFromGroup);
   }

   // If we got a toGroupID, then we connect the thing to the toGroup
   if (destinationGroupID != null) {
      const oldDestinationGroupData = await ctx.db.query.collectionGroup(
         {
            where: {
               id: destinationGroupID
            }
         },
         `{order}`
      );

      const { order: destinationOrder } = oldDestinationGroupData;
      if (newPosition != null) {
         destinationOrder.splice(newPosition, 0, linkID);
      } else {
         destinationOrder.push(linkID);
      }

      const data = {
         order: {
            set: destinationOrder
         }
      };

      if (cardType === 'note') {
         data.notes = {
            connect: {
               id: linkID
            }
         };
      } else {
         data.includedLinks = {
            connect: {
               id: linkID
            }
         };
      }

      const updatedGroupTwo = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: destinationGroupID
            },
            data
         },
         `{${collectionGroupFields}}`
      );
      updatedGroupsArray.push(updatedGroupTwo);
   }

   findParentCollectionAndPublishUpdate(updatedGroupsArray[0], ctx);
   return updatedGroupsArray;
}
exports.moveCardToGroup = moveCardToGroup;

async function moveGroupToColumn(
   parent,
   { groupID, sourceColumnID, destinationColumnID, newPosition },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedColumnsArray = [];

   if (sourceColumnID != null) {
      const oldSourceOrderData = await ctx.db.query.columnOrder(
         {
            where: {
               id: sourceColumnID
            }
         },
         `{order}`
      );

      const { order: sourceOrder } = oldSourceOrderData;
      const newSourceOrder = sourceOrder.filter(
         existingID => existingID !== groupID
      );

      const updatedSourceOrder = await ctx.db.mutation.updateColumnOrder(
         {
            where: {
               id: sourceColumnID
            },
            data: {
               order: {
                  set: newSourceOrder
               }
            }
         },
         info
      );
      updatedColumnsArray.push(updatedSourceOrder);
   }

   if (destinationColumnID != null) {
      const oldDestinationOrderData = await ctx.db.query.columnOrder(
         {
            where: {
               id: destinationColumnID
            }
         },
         `{order}`
      );

      const { order: destinationOrder } = oldDestinationOrderData;
      if (newPosition != null) {
         destinationOrder.splice(newPosition, 0, groupID);
      } else {
         destinationOrder.push(groupID);
      }

      const updatedDestinationOrder = await ctx.db.mutation.updateColumnOrder(
         {
            where: {
               id: destinationColumnID
            },
            data: {
               order: {
                  set: destinationOrder
               }
            }
         },
         info
      );
      updatedColumnsArray.push(updatedDestinationOrder);
   }
   findParentCollectionAndPublishUpdate(
      { __typename: 'CollectionGroup', id: groupID },
      ctx
   );
   return updatedColumnsArray;
}
exports.moveGroupToColumn = moveGroupToColumn;

async function reorderGroup(
   parent,
   { groupID, linkID, newPosition },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const groupObj = await ctx.db.query.collectionGroup(
      {
         where: {
            id: groupID
         }
      },
      `{order}`
   );

   const oldPosition = groupObj.order.indexOf(linkID);

   const newGroupObj = JSON.parse(JSON.stringify(groupObj));

   newGroupObj.order.splice(oldPosition, 1);
   newGroupObj.order.splice(newPosition, 0, linkID);

   const updatedGroup = await ctx.db.mutation.updateCollectionGroup(
      {
         where: {
            id: groupID
         },
         data: {
            order: {
               set: newGroupObj.order
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   findParentCollectionAndPublishUpdate(updatedGroup, ctx);
   return updatedGroup;
}
exports.reorderGroup = reorderGroup;

async function reorderColumn(
   parent,
   { columnID, groupID, newPosition },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const orderObj = await ctx.db.query.columnOrder(
      {
         where: {
            id: columnID
         }
      },
      `{order}`
   );

   const oldPosition = orderObj.order.indexOf(groupID);

   const newOrderObj = JSON.parse(JSON.stringify(orderObj));

   newOrderObj.order.splice(oldPosition, 1);
   newOrderObj.order.splice(newPosition, 0, groupID);

   const updatedOrderObj = await ctx.db.mutation.updateColumnOrder(
      {
         where: {
            id: columnID
         },
         data: {
            order: {
               set: newOrderObj.order
            }
         }
      },
      `{id order}`
   );
   findParentCollectionAndPublishUpdate(
      { __typename: 'CollectionGroup', id: groupID },
      ctx
   );
   return updatedOrderObj;
}
exports.reorderColumn = reorderColumn;

async function addNoteToGroup(parent, { groupID, position }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      groupID,
      'collectionGroup',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const oldGroup = await ctx.db.query.collectionGroup(
      {
         where: {
            id: groupID
         }
      },
      `{order}`
   );

   const { order } = oldGroup;

   const newID = getRandomString(24);

   if (position != null) {
      order.splice(position, 0, newID);
   } else {
      order.push(newID);
   }

   const updatedGroup = await ctx.db.mutation.updateCollectionGroup(
      {
         where: {
            id: groupID
         },
         data: {
            notes: {
               create: {
                  id: newID,
                  author: {
                     connect: {
                        id: ctx.req.memberId
                     }
                  }
               }
            },
            order: {
               set: order
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   findParentCollectionAndPublishUpdate(updatedGroup, ctx);
   return updatedGroup;
}
exports.addNoteToGroup = addNoteToGroup;

async function deleteNote(parent, { noteID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      noteID,
      'note',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const noteData = await ctx.db.query.note(
      {
         where: {
            id: noteID
         }
      },
      `{onCollectionGroup {id order}}`
   );

   const groupID = noteData.onCollectionGroup.id;
   let { order } = noteData.onCollectionGroup;

   order = order.filter(id => id !== noteID);

   const updatedGroup = await ctx.db.mutation.updateCollectionGroup(
      {
         where: {
            id: groupID
         },
         data: {
            notes: {
               delete: {
                  id: noteID
               }
            },
            order: {
               set: order
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   findParentCollectionAndPublishUpdate(updatedGroup, ctx);
   return updatedGroup;
}
exports.deleteNote = deleteNote;

async function editNote(parent, { noteID, newContent }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      noteID,
      'note',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedNote = await ctx.db.mutation.updateNote(
      {
         where: {
            id: noteID
         },
         data: {
            content: newContent
         }
      },
      `{__typename id content}`
   );
   findParentCollectionAndPublishUpdate(updatedNote, ctx);
   return updatedNote;
}
exports.editNote = editNote;

async function setCollectionPrivacy(
   parent,
   { collectionID, privacy },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedCollection = ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            privacy
         }
      },
      `{id privacy}`
   );
   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.setCollectionPrivacy = setCollectionPrivacy;

async function addIndividualPermissionToCollection(
   parent,
   { collectionID, memberID, permissionType },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            [permissionType]: {
               connect: {
                  id: memberID
               }
            }
         }
      },
      info
   );
   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.addIndividualPermissionToCollection = addIndividualPermissionToCollection;

async function removeIndividualPermissionFromCollection(
   parent,
   { collectionID, memberID, permissionType },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const canEdit = await checkCollectionPermissions(
      collectionID,
      'collection',
      'edit',
      ctx
   );
   if (!canEdit) {
      throw new AuthenticationError(
         "You don't have permission to edit this collection."
      );
   }

   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            [permissionType]: {
               disconnect: {
                  id: memberID
               }
            }
         }
      },
      info
   );
   publishCollectionUpdate(collectionID, ctx);
   return updatedCollection;
}
exports.removeIndividualPermissionFromCollection = removeIndividualPermissionFromCollection;
