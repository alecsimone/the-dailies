const { AuthenticationError } = require('apollo-server-express');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   fullThingFields,
   fullCollectionFields,
   fullPersonalLinkFields,
   contentPieceFields
} = require('../../utils/CardInterfaces');
const { getRandomString } = require('../../utils/TextHandling');
const {
   searchAvailableTaxes,
   canSeeThingGate,
   canSeeThing,
   properUpdateStuff,
   calculateRelevancyScore,
   filterContentPiecesForPrivacy,
   supplementFilteredQuery,
   getLinksFromContent,
   getThingIdFromLink,
   relationFilterFunction
} = require('../../utils/ThingHandling');
const {
   checkCollectionPermissions
} = require('../Mutation/CollectionMutations');

async function searchTaxes(parent, { searchTerm, personal }, ctx, info) {
   const availableTags = await searchAvailableTaxes(
      searchTerm,
      ctx,
      personal
   ).catch(err => {
      console.log(err);
   });
   return availableTags;
}
exports.searchTaxes = searchTaxes;

async function taxByTitle(parent, { title, personal, cursor }, ctx, info) {
   const typeToQuery = personal ? 'stacks' : 'tags';

   const possibleTaxes = await searchAvailableTaxes(title, ctx, personal).catch(
      err => {
         console.log(err);
      }
   );
   if (possibleTaxes != null && possibleTaxes.length > 0) {
      const [theActualTax] = possibleTaxes.filter(
         tax => tax.title.toLowerCase().trim() == title.toLowerCase().trim()
      );
      const where = {
         id: theActualTax.id
      };
      if (personal) {
         where.author = {
            id: ctx.req.memberId
         };
      }

      const [theTax] = await ctx.db.query[typeToQuery](
         {
            where
         },
         info
      ).catch(err => {
         console.log(err);
      });

      if (theTax == null) {
         return null;
      }

      if (theTax.connectedThings && theTax.connectedThings.length > 0) {
         const allowedThings = [];
         for (const thing of theTax.connectedThings) {
            if (await canSeeThing(ctx, thing)) {
               allowedThings.push(thing);
            }
         }
         const filteredThings = [];
         for (const thingData of allowedThings) {
            const filteredThingData = await filterContentPiecesForPrivacy(
               thingData,
               ctx
            );
            filteredThings.push(filteredThingData);
         }
         let cursoredThings = filteredThings;
         if (cursor != null) {
            cursoredThings = allowedThings.filter(
               thing => Date.parse(thing.createdAt) < Date.parse(cursor)
            );
         }
         cursoredThings.sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
         );
         const trimmedThings = cursoredThings.slice(0, 6);
         theTax.connectedThings = trimmedThings;
      }

      // const searchResults = await searchThings(title, ctx).catch(err => {
      //    console.log(err);
      // });
      // searchResults.forEach(result => {
      //    const preExistingCheck = theTax.connectedThings.filter(
      //       thing => thing.id !== result.id
      //    );
      //    if (preExistingCheck != null && preExistingCheck.length > 0) {
      //       theTax.connectedThings.push(result);
      //    }
      // });

      return theTax;
   }

   return null;
}
exports.taxByTitle = taxByTitle;

async function thing(parent, { where }, ctx, info) {
   await canSeeThingGate(where, ctx);

   const thingData = await ctx.db.query
      .thing(
         {
            where
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   const filteredThingData = await filterContentPiecesForPrivacy(
      thingData,
      ctx
   );
   return filteredThingData;
}
exports.thing = thing;

async function myThings(
   parent,
   { orderBy = 'manualUpdatedAt_DESC', cursor, forCollection, count = 10 },
   ctx,
   info
) {
   if (ctx.req.memberId == null) {
      return null;
   }

   const where = {
      AND: [
         {
            author: {
               id: ctx.req.memberId
            }
         }
      ]
   };

   const queryObj = {
      where,
      orderBy,
      first: count
   };

   if (cursor != null) {
      // We should only get a cursor when we're doing a fetchMore, in which case we'll want the 20 things after the cursor, so we can push in an manualUpdatedAt_lt of the cursor as soon as we get it
      where.AND.push({ manualUpdatedAt_lt: cursor });
      // queryObj.first = 20;
   }

   if (forCollection != null && cursor == null) {
      // If this is for a collection, but no cursor is provided, then that means it's the initial collection query, and there might be a cursor already saved for it. Let's check
      const collectionData = await ctx.db.query.member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{lastActiveCollection {thingQueryCursor}}`
      );

      if (collectionData.lastActiveCollection.thingQueryCursor != null) {
         // If we find one, we'll add it to our where object. Note that here we want to use manualUpdatedAt_gte instead of manualUpdatedAt_lt because we want all the things BEFORE the cursor, not after
         queryObj.where.AND.push({
            manualUpdatedAt_gte:
               collectionData.lastActiveCollection.thingQueryCursor
         });
      } else {
         // If we don't find one, we just want to get the first 20 things
         // queryObj.first = 20;
      }
   }

   const things = await ctx.db.query.things(queryObj, info).catch(err => {
      console.log(err);
   });

   if (forCollection != null && forCollection !== '1') {
      // If this is for a collection, we need to update that collection to represent the new cursor value. However, if the forCollection value is 1, that means it's the initial query and we don't need to update the cursor yet as it won't have changed
      // First we need to find the new cursor value. It will not be the same as a provided cursor, because that will represent where the previous query ended, and we need to know where this query ended so we can get all things before that next time

      const lastThing = things[things.length - 1];
      if (lastThing == null) {
         const filteredThings = [];
         for (const thingData of things) {
            const filteredThingData = await filterContentPiecesForPrivacy(
               thingData,
               ctx
            );
            filteredThings.push(filteredThingData);
         }

         return filteredThings;
      }

      const newCursor = lastThing.manualUpdatedAt;
      ctx.db.mutation.updateCollection({
         where: {
            id: forCollection
         },
         data: {
            thingQueryCursor: newCursor
         }
      });
   }

   const filteredThings = [];
   for (const thingData of things) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.myThings = myThings;

async function myFriendsThings(
   parent,
   { orderBy = 'manualUpdatedAt_DESC', cursor, count = 2 },
   ctx,
   info
) {
   if (ctx.req.memberId == null) {
      return [];
   }

   const where = {
      author: {
         friends_some: {
            id: ctx.req.memberId
         }
      },
      privacy_in: ['Public', 'Friends']
   };

   if (cursor != null) {
      where.manualUpdatedAt_lt = cursor;
   }

   const things = await ctx.db.query
      .things(
         {
            where,
            orderBy,
            first: count
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   const filteredThings = [];
   for (const thingData of things) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.myFriendsThings = myFriendsThings;

async function publicThings(
   parent,
   { orderBy = 'manualUpdatedAt_DESC' },
   ctx,
   info
) {
   const things = await ctx.db.query
      .things(
         {
            where: {
               privacy: 'Public'
            },
            orderBy
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   const filteredThings = [];
   for (const thingData of things) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.publicThings = publicThings;

async function allThings(parent, { cursor, count = 2 }, ctx, info) {
   let where;
   if (ctx.req.memberId == null) {
      where = {
         privacy: 'Public',
         votes_some: {
            id_not: 'poopface' // We only want to return things with votes. Easiest way to do this seems to me to be to get any thing where at least one of the votes doesn't have an ID of poopface.
         }
      };
   } else {
      where = {
         OR: [
            {
               privacy: 'Public'
            },
            {
               author: {
                  friends_some: {
                     id: ctx.req.memberId
                  }
               },
               privacy_in: ['Public', 'Friends', 'FriendsOfFriends']
            },
            {
               author: {
                  friends_some: {
                     friends_some: {
                        id: ctx.req.memberId
                     }
                  }
               },
               privacy: 'FriendsOfFriends'
            },
            {
               author: {
                  id: ctx.req.memberId
               },
               privacy_not: 'Private'
            }
         ],
         votes_some: {
            id_not: 'poopface' // We only want to return things with votes. Easiest way to do this seems to me to be to get any thing where at least one of the votes doesn't have an ID of poopface.
         }
      };
   }
   if (cursor != null) {
      where.createdAt_lt = cursor;
   }

   const things = await ctx.db.query
      .things(
         {
            where,
            orderBy: 'createdAt_DESC',
            first: count
         },
         info
      )
      .catch(err => {
         throw new Error(err.message);
      });

   const filteredThings = [];
   for (const thingData of things) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.allThings = allThings;

async function searchThings(string, ctx, isTitleOnly = false) {
   let where;
   if (isTitleOnly) {
      where = {
         title_contains: string
      };
   } else {
      where = {
         OR: [
            {
               title_contains: string
            },
            {
               author: {
                  displayName_contains: string
               }
            },
            {
               content_some: {
                  OR: [
                     {
                        content_contains: string
                     },
                     {
                        comments_some: {
                           comment_contains: string
                        }
                     }
                  ]
               }
            },
            {
               copiedInContent_some: {
                  OR: [
                     {
                        content_contains: string
                     },
                     {
                        comments_some: {
                           comment_contains: string
                        }
                     }
                  ]
               }
            },
            {
               partOfTags_some: {
                  title_contains: string
               }
            },
            {
               comments_some: {
                  comment_contains: string
               }
            },
            {
               summary_contains: string
            }
         ]
      };
   }

   const foundThings = await ctx.db.query
      .things(
         {
            where
         },
         `{${fullThingFields}}`
      )
      .catch(err => console.log(err));

   const filteredThings = [];
   for (const thingData of foundThings) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.searchThings = searchThings;

async function search(
   parent,
   { string, isTitleOnly, cursor, count = 12 },
   ctx,
   info
) {
   const relevantThings = await searchThings(string, ctx, isTitleOnly).catch(
      err => {
         console.log(err);
      }
   );

   const safeThings = [];
   for (const thing of relevantThings) {
      if (await canSeeThing(ctx, thing)) {
         safeThings.push(thing);
      }
   }

   safeThings.sort(
      (a, b) =>
         calculateRelevancyScore(b, string) - calculateRelevancyScore(a, string)
   );
   let cursorScore;
   let cursorID;
   if (cursor != null) {
      const cursorDivider = cursor.indexOf('_ID_'); // Our cursor is a string that combines the relevancy score
      cursorScore = cursor.substring(0, cursorDivider);
      cursorID = cursor.substring(cursorDivider + 4);
   }
   const cursoredThings = safeThings.filter(thing => {
      if (cursor == null) return true;
      const thingScore = calculateRelevancyScore(thing, string);
      if (thing.id === cursorID) return false; // If this thing has the ID we pulled out of the cursor, then it's already been sent and we skip it
      if (thingScore < cursorScore) return true; // If this thing has a lower relevancy than the score we pulled out of the cursor, then we haven't sent it yet
      if (thingScore === cursorScore && thing.id > cursorID) return true; // If this thing has the same score as the score we pulled out of the cursor but a higher ID, then we probably haven't sent it yet
      return false; // Otherwise, we should have sent this thing so we skip it
   });

   const trimmedThings = cursoredThings.slice(0, count);

   const filteredThings = [];
   for (const thingData of trimmedThings) {
      const filteredThingData = await filterContentPiecesForPrivacy(
         thingData,
         ctx
      );
      filteredThings.push(filteredThingData);
   }

   return filteredThings;
}
exports.search = search;

async function ensureColumnsAreOrdered(collectionObj, ctx) {
   // We're going to loop over every userGroup and make sure it shows up in a columnOrder somewhere.
   const { userGroups, columnOrders } = collectionObj;

   let hasUnorderedGroups = false;
   const newOrder = [];

   // We're going to loop over every group
   userGroups.forEach(groupObj => {
      let groupIsOrdered = false;

      // First we check if it's in at least one columnOrder
      columnOrders.forEach(orderObj => {
         if (groupIsOrdered) return; // To avoid unnecessary loops
         if (orderObj.order.includes(groupObj.id)) {
            groupIsOrdered = true;
         }
      });

      // If it is not in a columnOrder, we need to add it to one.
      if (!groupIsOrdered) {
         hasUnorderedGroups = true;
         if (columnOrders.length > 0) {
            // If they have columnOrders already, we add it to the first one
            columnOrders[0].order.push(groupObj.id);
         } else {
            // If they don't, we make a new one
            newOrder.push(groupObj.id);
         }
      }
   });

   // If there were no unordered groups, we're done here
   if (!hasUnorderedGroups) return collectionObj;

   // If there were unordered groups, we need to update the collection to put them in their new order
   let updatedCollection;
   if (newOrder.length > 0) {
      // If we had to make a new columnOrder because there weren't any, we do so
      updatedCollection = await ctx.db.mutation.updateCollection(
         {
            where: {
               id: collectionObj.id
            },
            data: {
               columnOrders: {
                  create: {
                     order: {
                        set: newOrder
                     }
                  }
               }
            }
         },
         `{${fullCollectionFields}}`
      );
   } else {
      // If they already had a columnOrder we could add the unordered groups into, we have to update that columnOrder
      updatedCollection = collectionObj;
      await ctx.db.mutation.updateColumnOrder({
         where: {
            id: columnOrders[0].id
         },
         data: {
            order: {
               set: columnOrders[0].order
            }
         }
      });
   }

   // Then we send back the updatedCollection
   return updatedCollection;
}

async function getCollections(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // We need to get the full data for the last active collection and the ID and title of all other collections for the currently logged in member
   const myCollections = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{id lastActiveCollection {${fullCollectionFields}} collections {id title createdAt} }`
   );

   if (
      myCollections.lastActiveCollection == null &&
      myCollections.collections.length > 0
   ) {
      // If they have collections, but the lastActiveCollection is null for some reason, let's set their newest collection to be last active
      const { collections } = myCollections;
      collections.sort((a, b) => {
         const aDate = new Date(a.createdAt);
         const bDate = new Date(b.createdAt);
         return bDate - aDate;
      });
      const latestCollectionID = collections[0].id;

      const updatedMember = await ctx.db.mutation.updateMember(
         {
            where: {
               id: ctx.req.memberId
            },
            data: {
               lastActiveCollection: {
                  connect: {
                     id: latestCollectionID
                  }
               }
            }
         },
         `{id lastActiveCollection {${fullCollectionFields}} collections {id title createdAt} }`
      );
      return updatedMember;
   }

   // Finally, we make sure all the userGroups in this collection are included in a column order
   myCollections.lastActiveCollection = ensureColumnsAreOrdered(
      myCollections.lastActiveCollection,
      ctx
   );

   return myCollections;
}
exports.getCollections = getCollections;

async function getCollection(parent, { id }, ctx, info) {
   // First we make sure the member has permission to view this collection
   const canView = await checkCollectionPermissions(
      id,
      'collection',
      'view',
      ctx
   ).catch(error => {
      throw new Error(error);
   });
   if (!canView) {
      throw new AuthenticationError(
         "You don't have permission to see this collection."
      );
   }

   // And if they do, we send back the collection
   let collectionData = await ctx.db.query.collection(
      {
         where: {
            id
         }
      },
      `{${fullCollectionFields}}`
   );

   // After making sure all the columns are ordered, of course.
   collectionData = ensureColumnsAreOrdered(collectionData, ctx);

   return collectionData;
}
exports.getCollection = getCollection;

async function getRelationsForThing(
   parent,
   { thingID, totalCount = 12 },
   ctx,
   info
) {
   // const start = new Date();
   // First we need to make sure the current user has permission to view this thing
   await canSeeThingGate({ id: thingID }, ctx);

   // Next we want to figure out how many things we want to fetch, which will be the totalCount evenly distributed among the relations (ie, among all the tags and the author)
   // So first let's get the tags for the thing, and we might as well grab the author, the content, and the existing connections while we're at it
   const theThingToRelate = await ctx.db.query.thing(
      {
         where: {
            id: thingID
         }
      },
      `{
         id
         title
         author {
            id
            displayName
            createdThings(first: ${totalCount}, orderBy: manualUpdatedAt_DESC) {
               id
               author {
                  id
                  friends {
                     id
                     friends {
                        id
                     }
                  }
               }
               individualViewPermissions {
                  id
               }
               privacy
            }
         }
         partOfTags {
            id
            title
            connectedThings(first: ${totalCount}, orderBy: manualUpdatedAt_DESC) {
               id
               author {
                  id
                  friends {
                     id
                     friends {
                        id
                     }
                  }
               }
               individualViewPermissions {
                  id
               }
               privacy
            }
         }
         copiedInContent {
            content
         }
         content {
            content
         }
         subjectConnections {
            object {
               id
            }
         }
         objectConnections {
            subject {
               id
            }
         }
      }`
   );
   // Let's pull some things out of this now for future convenience
   const {
      author,
      partOfTags: tags,
      content,
      copiedInContent,
      subjectConnections,
      objectConnections
   } = theThingToRelate;
   const authorThings = author.createdThings;

   let individualCount = Math.ceil(
      // We want to have plenty of related things, so we're using ceil instead of floor / round
      totalCount / (tags.length + 1) // the +1 is to count same author relations too
   );
   if (individualCount < 2) {
      // Because we want plenty of related things, we're going to make sure we get at least 2 of every kind of relation
      individualCount = 2;
   }

   // Then we need to get the IDs of all the things that are already connected to our thing

   // First we need to get all the links in the thing
   const fullContent = content.concat(copiedInContent);
   const contentLinkIDs = getLinksFromContent(fullContent);

   // Then we need to get the ids of all the existing connections
   const subjectConnectionIDs = subjectConnections.map(
      connection => connection.object.id
   );
   const objectConnectionIDs = objectConnections.map(
      connection => connection.subject.id
   );

   // Then we put them all together
   let alreadyRelatedThingIDs = contentLinkIDs
      .concat(subjectConnectionIDs)
      .concat(objectConnectionIDs);
   // And add the thing we're working with too
   alreadyRelatedThingIDs.push(thingID);

   // Now it's time to process the things we've got and make our relations

   // First we'll go through the tags on the thing. We'll need to make an object for each tag with two properties: tagID, and things, which will hold the connected things for that tag. Each of those objects will be added to our tagObjects array.
   const tagObjects = [];
   for (const tag of tags) {
      const tagThings = tag.connectedThings;

      let safeTagThings = [];
      for (const tagThing of tagThings) {
         if (
            await relationFilterFunction(tagThing, alreadyRelatedThingIDs, ctx)
         ) {
            safeTagThings.push(tagThing);
            alreadyRelatedThingIDs.push(tagThing.id);
         }
      }

      if (safeTagThings.length < individualCount && tagThings.length > 0) {
         const queryObj = {
            where: {
               AND: [
                  {
                     partOfTags_some: {
                        id: tag.id
                     }
                  }
               ]
            },
            first: individualCount - safeTagThings.length,
            orderBy: 'manualUpdatedAt_DESC'
         };

         const supplementaryThings = await supplementFilteredQuery(
            ctx,
            'things',
            queryObj,
            `{${fullThingFields}}`,
            newThing =>
               relationFilterFunction(newThing, alreadyRelatedThingIDs, ctx),
            'manualUpdatedAt_lt',
            tagThings[tagThings.length - 1].manualUpdatedAt,
            'manualUpdatedAt',
            individualCount - safeTagThings.length
         );

         safeTagThings = safeTagThings.concat(supplementaryThings);
         const newThingIDs = supplementaryThings.map(newThing => newThing.id);
         alreadyRelatedThingIDs.concat(newThingIDs);
         tagObjects.push({ tagID: tag.id, things: safeTagThings });
      } else {
         // if we got too may things, we want to trim our safeTagThings
         const trimmedTagThings = safeTagThings.slice(0, individualCount);

         // We also need to remove the things that get trimmed off from our alreadyConnectedThings array
         const thingsToRemove = safeTagThings.slice(individualCount);
         const idsToRemove = thingsToRemove.map(
            thingToRemove => thingToRemove.id
         );
         alreadyRelatedThingIDs = alreadyRelatedThingIDs.filter(
            relatedThingID => !idsToRemove.includes(relatedThingID)
         );

         // Then we can push the object for this tag into our tagObjects array
         tagObjects.push({ tagID: tag.id, things: trimmedTagThings });
      }
   }

   // Next we want to make relations for any things that are in a collection or a collection group with our provided thing.
   // Collections are made up of personal links (not things directly) so we have to use a loose search that would catch any link to the provided thing
   const collectionLinks = await ctx.db.query.personalLinks(
      {
         where: {
            url_contains: `${
               process.env.FRONTEND_URL_NOHTTP
            }/thing?id=${thingID}`
         }
      },
      `{
         inCollectionGroups {
            id
            includedLinks {
               url
            }
            inCollection {
               id
               userGroups {
                  id
                  includedLinks {
                     url
                  }
               }
            }
         }
      }`
   );

   const inCollectionGroupWithThings = []; // This will keep track of the things that are in a group with the provided thing
   const inGroups = []; // This will keep track of the groups we've checked for things. This is important because once we're going through collections, we want to skip the groups the provided thing is in.
   const inCollectionWithThings = []; // This will keep track of the things that are in a collection with the provided thing

   collectionLinks.forEach(collectionLinkObj => {
      if (collectionLinkObj == null) return;
      if (collectionLinkObj.inCollectionGroups == null) return;
      // We need to loop over all the groups that it's in
      collectionLinkObj.inCollectionGroups.forEach(groupObj => {
         if (groupObj == null) return;
         if (inGroups.includes(groupObj.id)) return;
         inGroups.push(groupObj.id);
         // For each group, first we need to loop over the links that are in that group, figure out if they're links to a thing, and if they are, pop them in our inCollectionGroupWithThings array
         if (groupObj.includedLinks != null) {
            groupObj.includedLinks.forEach(linkObj => {
               const linkThingID = getThingIdFromLink(linkObj.url);
               if (
                  linkThingID != null && // The link exists
                  !alreadyRelatedThingIDs.includes(linkThingID) && // We haven't already related it
                  !inCollectionGroupWithThings.includes(linkThingID) // We haven't added it in this step without pushing it to alreadyRelatedThings
               ) {
                  inCollectionGroupWithThings.push(linkThingID);
               }
            });
         }
         // Then we need to loop over the collections that group is a part of
         if (groupObj.inCollection != null) {
            const collectionObj = groupObj.inCollection;
            if (collectionObj == null) return;

            // Then we need to loop over every group in that collection (skipping ones we already know have the provided thing)
            collectionObj.userGroups.forEach(collectionGroupObj => {
               if (collectionGroupObj == null) return;
               if (collectionGroupObj.id == null) return;
               if (inGroups.includes(collectionGroupObj.id)) return;

               // For each group, first we need to loop over the links that are in that group, figure out if they're links to a thing, and if they are, pop them in our inCollectionWithThings array
               if (groupObj.includedLinks != null) {
                  collectionGroupObj.includedLinks.forEach(
                     collectionGroupLinkObj => {
                        const linkThingID = getThingIdFromLink(
                           collectionGroupLinkObj.url
                        );
                        if (
                           linkThingID != null && // The link is to a thing
                           !alreadyRelatedThingIDs.includes(linkThingID) && // We haven't already related it
                           !inCollectionWithThings.includes(linkThingID) // We haven't added it in this step without pushing it to alreadyRelatedThings
                        ) {
                           inCollectionWithThings.push(linkThingID);
                        }
                     }
                  );
               }
            });
         }
      });
   });

   // Next we'll make an array with all the IDs of all the things that are in either a collection or a collection group with our provided thing
   const masterCollectionThingIDsArray = inCollectionGroupWithThings.concat(
      inCollectionWithThings
   );
   // And then we'll get the full data for all of those things
   const masterCollectionThingsArray = await ctx.db.query.things(
      {
         where: {
            id_in: masterCollectionThingIDsArray
         }
      },
      `{${fullThingFields}}`
   );

   // Next we need to figure out how many things we want from each of collections and collection groups
   const maxCollectionCount =
      individualCount > totalCount / 3
         ? Math.ceil(totalCount / 3)
         : individualCount;

   const safeGroupThings = [];
   for (const groupThingID of inCollectionGroupWithThings) {
      // First we get the data for each thing from our masterCollectionThingsArray
      const groupThingData = masterCollectionThingsArray.find(
         thingObj => thingObj.id === groupThingID
      );
      // Then we check if it passes our filter function
      if (
         await relationFilterFunction(
            groupThingData,
            alreadyRelatedThingIDs,
            ctx
         )
      ) {
         // And add it to our safeGroupThings array if it does
         safeGroupThings.push(groupThingData);
      }
   }
   const trimmedGroupThings = safeGroupThings.slice(0, maxCollectionCount);
   const newGroupThingIDs = trimmedGroupThings.map(newThing => newThing.id);
   alreadyRelatedThingIDs = alreadyRelatedThingIDs.concat(newGroupThingIDs);

   const safeCollectionThings = [];
   for (const collectionThingID of inCollectionWithThings) {
      // First we get the data for each thing from our masterCollectionThingsArray
      const collectionThingData = masterCollectionThingsArray.find(
         thingObj => thingObj.id === collectionThingID
      );
      // Then we check if it passes our filter function
      if (
         await relationFilterFunction(
            collectionThingData,
            alreadyRelatedThingIDs,
            ctx
         )
      ) {
         // And add it to our safeCollectionThings array if it does
         safeCollectionThings.push(collectionThingData);
      }
   }
   const trimmedCollectionThings = safeCollectionThings.slice(
      0,
      maxCollectionCount
   );
   const newCollectionThingIDs = trimmedCollectionThings.map(
      newThing => newThing.id
   );
   alreadyRelatedThingIDs = alreadyRelatedThingIDs.concat(
      newCollectionThingIDs
   );

   // Finally, we'll do things by the same author
   let safeAuthorThings = [];
   for (const authorThing of authorThings) {
      if (
         await relationFilterFunction(authorThing, alreadyRelatedThingIDs, ctx)
      ) {
         safeAuthorThings.push(authorThing);
         alreadyRelatedThingIDs.push(authorThing.id);
      }
   }

   // If we didn't get enough author things in our initial query (after filtering them), we'll supplement the query
   if (safeAuthorThings.length < individualCount && authorThings.length > 0) {
      const queryObj = {
         where: {
            AND: [
               {
                  author: {
                     id: author.id
                  }
               }
            ]
         },
         first: individualCount - safeAuthorThings.length,
         orderBy: 'manualUpdatedAt_DESC'
      };

      const supplementaryThings = await supplementFilteredQuery(
         ctx,
         'things',
         queryObj,
         `{${fullThingFields}}`,
         newThing =>
            relationFilterFunction(newThing, alreadyRelatedThingIDs, ctx),
         'manualUpdatedAt_lt',
         authorThings[authorThings.length - 1].manualUpdatedAt,
         'manualUpdatedAt',
         individualCount - safeAuthorThings.length
      );

      safeAuthorThings = safeAuthorThings.concat(supplementaryThings);
      const newThingIDs = supplementaryThings.map(newThing => newThing.id);
      alreadyRelatedThingIDs.concat(newThingIDs);
   } else if (safeAuthorThings.length > individualCount) {
      // If we got too many things, we want to trim our safeAuthorThings
      safeAuthorThings = safeAuthorThings.slice(0, individualCount);

      // We also need to remove the things that get trimmed off from our alreadyConnectedThings array
      const thingsToRemove = safeAuthorThings.slice(individualCount);
      const idsToRemove = thingsToRemove.map(thingToRemove => thingToRemove.id);
      alreadyRelatedThingIDs = alreadyRelatedThingIDs.filter(
         relatedThingID => !idsToRemove.includes(relatedThingID)
      );
   }

   // If we have more relations than the total count just between our author, group, and collection things, we want to trim our author things list down till we have the right number
   if (
      safeAuthorThings.length +
         trimmedGroupThings.length +
         trimmedCollectionThings.length >
      totalCount
   ) {
      const authorThingCount =
         totalCount -
         trimmedGroupThings.length -
         trimmedCollectionThings.length;
      safeAuthorThings = safeAuthorThings.slice(0, authorThingCount);
   }

   // Finally, we need to turn our found things into connections and return them
   const relationsArray = [];

   const createdAt = new Date().toISOString();
   for (const authorThing of safeAuthorThings) {
      const relation = {
         id: `new-${getRandomString(32)}`,
         subject: theThingToRelate,
         object: authorThing,
         relationship: `also written by ${author.displayName}`,
         strength: 0,
         createdAt
      };
      relationsArray.push(relation);
   }

   for (const tagObj of tagObjects) {
      const { tagID, things } = tagObj;

      // We need to figure out the name of this tag by finding it in our original list of tags and then getting its title
      const tagIndexInOriginalThing = tags.findIndex(tag => tag.id === tagID);
      const tagName = tags[tagIndexInOriginalThing].title;

      things.forEach(tagThing => {
         const relation = {
            id: `new-${getRandomString(32)}`,
            subject: theThingToRelate,
            object: tagThing,
            relationship: `shares the tag "${tagName}" with`,
            strength: 0,
            createdAt
         };
         relationsArray.push(relation);
      });
   }

   for (const groupThing of trimmedGroupThings) {
      const relation = {
         id: `new-${getRandomString(32)}`,
         subject: theThingToRelate,
         object: groupThing,
         relationship: `in a collection group with`,
         strength: 0,
         createdAt
      };
      relationsArray.push(relation);
   }

   for (const collectionThing of trimmedCollectionThings) {
      const relation = {
         id: `new-${getRandomString(32)}`,
         subject: theThingToRelate,
         object: collectionThing,
         relationship: `in a collection with`,
         strength: 0,
         createdAt
      };
      relationsArray.push(relation);
   }

   // const end = new Date();
   // console.log(`end: ${(end.getTime() - start.getTime()) / 1000}`);
   return relationsArray;
}
exports.getRelationsForThing = getRelationsForThing;

async function getCollectionsForThing(
   parent,
   { thingID, totalCount = 4 },
   ctx,
   info
) {
   const thingLinkURL = `${
      process.env.FRONTEND_URL_NOHTTP
   }/thing?id=${thingID}`;
   const linksData = await ctx.db.query.personalLinks(
      {
         where: {
            url_contains: thingLinkURL // We don't want to do an exact URL search just to allow for different permutations someone might have used when adding the thing to the collection
         }
      },
      `{inCollectionGroups { inCollection { id title } }}`
   );

   const collectionsArray = [];
   linksData.forEach(linkData => {
      if (linkData != null && linkData.inCollectionGroups != null) {
         linkData.inCollectionGroups.forEach(groupObj => {
            if (groupObj.inCollection != null) {
               collectionsArray.push(groupObj.inCollection);
            }
         });
      }
   });

   const filteredCollections = [];
   for (const collection of collectionsArray) {
      if (
         await checkCollectionPermissions(
            collection.id,
            'collection',
            'view',
            ctx
         )
      ) {
         filteredCollections.push(collection);
      }
   }

   return filteredCollections;
}
exports.getCollectionsForThing = getCollectionsForThing;

async function getLinkArchive(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const member = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{id ownedLinks {${fullPersonalLinkFields}}}`
   );

   return member;
}
exports.getLinkArchive = getLinkArchive;
