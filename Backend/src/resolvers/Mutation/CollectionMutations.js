const { AuthenticationError } = require('apollo-server-express');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   collectionGroupFields,
   smallThingCardFields,
   fullPersonalLinkFields,
   fullCollectionFields
} = require('../../utils/CardInterfaces');
const { simpleAddLink } = require('./LinkArchiveMutations');
const { publishMeUpdate } = require('./MemberMutations');

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
      `{collections {id} }`
   );
   const { collections } = originalMemberData;
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

   if (filteredCollections.length > 0) {
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

   // We just need to update the title of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection({
      where: {
         id: collectionID
      },
      data: {
         title: newTitle
      }
   });

   return updatedCollection;
}
exports.renameCollection = renameCollection;

async function setCollectionGroupByTag(
   parent,
   { collectionID, groupByTag },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to update the groupByTag property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection({
      where: {
         id: collectionID
      },
      data: {
         groupByTag
      }
   });

   return updatedCollection;
}
exports.setCollectionGroupByTag = setCollectionGroupByTag;

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

   return updatedCollection;
}
exports.deleteGroupFromCollection = deleteGroupFromCollection;

async function hideGroupOnCollection(
   parent,
   { collectionID, groupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to add the provided group to the hiddenGroups property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenGroups: {
               connect: {
                  id: groupID
               }
            }
         }
      },
      `{id hiddenGroups {${collectionGroupFields}}}`
   );

   return updatedCollection;
}
exports.hideGroupOnCollection = hideGroupOnCollection;

async function showHiddenGroupsOnCollection(
   parent,
   { collectionID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to reset the hiddenGroups property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenGroups: {
               set: []
            }
         }
      },
      `{id hiddenGroups {${collectionGroupFields}}}`
   );

   return updatedCollection;
}
exports.showHiddenGroupsOnCollection = showHiddenGroupsOnCollection;

async function hideTagOnCollection(parent, { collectionID, tagID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to add the provided tag to the hiddenTags property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenTags: {
               connect: {
                  id: tagID
               }
            }
         }
      },
      `{id hiddenTags {__typename id author {__typename id displayName}}}`
   );

   return updatedCollection;
}
exports.hideTagOnCollection = hideTagOnCollection;

async function showHiddenTagsOnCollection(parent, { collectionID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to reset the hiddenTags property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenTags: {
               set: []
            }
         }
      },
      `{id hiddenTags {__typename id}}`
   );

   return updatedCollection;
}
exports.showHiddenTagsOnCollection = showHiddenTagsOnCollection;

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
   return updatedCollection;
}
exports.copyThingToCollectionGroup = copyThingToCollectionGroup;

async function addLinkToCollectionGroup(parent, { url, groupID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

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
      linkObject = existingLink;
   } else {
      linkObject = await simpleAddLink(ctx, url);
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
            }
         }
      },
      `{${collectionGroupFields}}`
   );
   return updatedGroup;

   // And return the collection that it's part of
   // return updatedGroup.inCollection;
}
exports.addLinkToCollectionGroup = addLinkToCollectionGroup;

async function removeThingFromCollectionGroup(
   parent,
   { collectionID, thingID, groupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // first we need to disconnect the thing from the provided group
   await ctx.db.mutation.updateCollectionGroup({
      where: {
         id: groupID
      },
      data: {
         things: {
            disconnect: {
               id: thingID
            }
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
   return updatedCollection;
}
exports.removeThingFromCollectionGroup = removeThingFromCollectionGroup;

async function hideThingOnCollection(
   parent,
   { collectionID, thingID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to add the thing to the hiddenThings property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenThings: {
               connect: {
                  id: thingID
               }
            }
         }
      },
      `{id hiddenThings {__typename id}}`
   );
   return updatedCollection;
}
exports.hideThingOnCollection = hideThingOnCollection;

async function showHiddenThingsOnCollection(
   parent,
   { collectionID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to reset the hiddenThings property of the provided collection
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            hiddenThings: {
               set: []
            }
         }
      },
      `{id hiddenThings {__typename id}}`
   );

   return updatedCollection;
}
exports.showHiddenThingsOnCollection = showHiddenThingsOnCollection;

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

   return updatedGroupsArray;
}
exports.reorderGroups = reorderGroups;

const updateTagOrder = async (
   tagID,
   collectionID,
   groupID,
   newOrder,
   tagOrders,
   ctx
) => {
   const [thisTagOrder] = tagOrders.filter(orderObj => orderObj.id === groupID);

   let updatedGroup;
   if (thisTagOrder != null) {
      // If that TagOrder already exists, we just update its order property
      updatedGroup = await ctx.db.mutation.updateTagOrder(
         {
            where: {
               id: thisTagOrder.id
            },
            data: {
               order: {
                  set: newOrder
               }
            }
         },
         `{id order}`
      );
   } else {
      // If that TagOrder doesn't exist, we create it, making sure to give it the provided ID
      updatedGroup = await ctx.db.mutation.createTagOrder(
         {
            data: {
               id: groupID,
               tag: {
                  connect: {
                     id: tagID
                  }
               },
               order: {
                  set: newOrder
               },
               forCollection: {
                  connect: {
                     id: collectionID
                  }
               }
            }
         },
         `{id order}`
      );
   }
   return updatedGroup;
};

async function reorderTags(
   parent,
   {
      groupOneID,
      tagOneID,
      newOrderOne,
      groupTwoID,
      tagTwoID,
      newOrderTwo,
      collectionID
   },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const updatedGroupsArray = [];

   // First we need to pull the provided collection so we can look through the TagOrders connected to it
   const collectionData = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{tagOrders {id}}`
   );

   const { tagOrders } = collectionData;

   // If we got a groupOneID and a newOrderOne, we check to see if groupOneID represents a TagOrder that already exists on the collection
   if (groupOneID != null && newOrderOne != null) {
      const updatedGroupOne = await updateTagOrder(
         tagOneID,
         collectionID,
         groupOneID,
         newOrderOne,
         tagOrders,
         ctx
      );
      if (updatedGroupOne != null) {
         updatedGroupsArray.push(updatedGroupOne);
      }
   }

   // If we got a groupTwoID and a newOrderTwo, we check to see if groupTwoID represents a TagOrder that already exists on the collection
   if (groupTwoID != null && newOrderTwo != null) {
      const [thisTagOrder] = tagOrders.filter(
         orderObj => orderObj.id === groupTwoID
      );

      const updatedGroupTwo = await updateTagOrder(
         tagTwoID,
         collectionID,
         groupTwoID,
         newOrderTwo,
         tagOrders,
         ctx
      );

      if (updatedGroupTwo != null) {
         updatedGroupsArray.push(updatedGroupTwo);
      }
   }

   return updatedGroupsArray;
}
exports.reorderTags = reorderTags;

async function reorderUngroupedThings(
   parent,
   { collectionID, newOrder },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We just need to set a new order for the ungroupedThingsOrder property
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            ungroupedThingsOrder: {
               set: newOrder
            }
         }
      },
      `{id ungroupedThingsOrder}`
   );

   return updatedCollection;
}
exports.reorderUngroupedThings = reorderUngroupedThings;

async function moveCardToGroup(
   parent,
   { thingID, fromGroupID, toGroupID },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   const updatedGroupsArray = [];

   // If we got a toGroupID, then we get disconnect the thing from the fromGroup
   if (fromGroupID != null) {
      const updatedFromGroup = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: fromGroupID
            },
            data: {
               things: {
                  disconnect: {
                     id: thingID
                  }
               }
            }
         },
         `{__typename id things {${smallThingCardFields}}}`
      );
      updatedGroupsArray.push(updatedFromGroup);
   }

   // If we got a toGroupID, then we connect the thing to the toGroup
   if (toGroupID != null) {
      const updatedGroupTwo = await ctx.db.mutation.updateCollectionGroup(
         {
            where: {
               id: toGroupID
            },
            data: {
               things: {
                  connect: {
                     id: thingID
                  }
               }
            }
         },
         `{__typename id things {${smallThingCardFields}}}`
      );
      updatedGroupsArray.push(updatedGroupTwo);
   }

   return updatedGroupsArray;
}
exports.moveCardToGroup = moveCardToGroup;

async function setColumnOrder(
   parent,
   { columnIDs, newOrders, collectionID, isTagOrder },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (columnIDs.length !== newOrders.length) {
      throw new Error(
         'You must provide the same number of columnIDs and newOrders'
      );
   }

   // We just need to upsert the new order to the columnOrders or tagColumnOrders property of the provided collection

   const property = isTagOrder ? 'tagColumnOrders' : 'columnOrders';

   const requestedFields = isTagOrder
      ? `{__typename id tagColumnOrders { __typename id order }}`
      : `{__typename id columnOrders { __typename id order }}`;

   let i = 0;
   let updatedCollection;
   for (const id of columnIDs) {
      updatedCollection = await ctx.db.mutation.updateCollection(
         {
            where: {
               id: collectionID
            },
            data: {
               [property]: {
                  upsert: {
                     where: {
                        id
                     },
                     create: {
                        id,
                        order: {
                           set: newOrders[i]
                        }
                     },
                     update: {
                        order: {
                           set: newOrders[i]
                        }
                     }
                  }
               }
            }
         },
         requestedFields
      );
      i += 1;
   }

   return updatedCollection;
}
exports.setColumnOrder = setColumnOrder;

async function handleCardExpansion(
   parent,
   { thingID, collectionID, newValue },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First we need to get the old list of expanded cards
   const oldCollection = await ctx.db.query.collection(
      {
         where: {
            id: collectionID
         }
      },
      `{expandedCards}`
   );

   let newExpandedCards;
   if (newValue) {
      // If we're expanding, we add the given ID to the list
      newExpandedCards = [...oldCollection.expandedCards, thingID];
   } else {
      // If we're collapsing, we remove the given ID from the list
      newExpandedCards = oldCollection.expandedCards.filter(
         id => id !== thingID
      );
   }

   // Then we update the collection with the new order
   const updatedCollection = await ctx.db.mutation.updateCollection(
      {
         where: {
            id: collectionID
         },
         data: {
            expandedCards: {
               set: newExpandedCards
            }
         }
      },
      `{id expandedCards}`
   );

   return updatedCollection;
}
exports.handleCardExpansion = handleCardExpansion;
