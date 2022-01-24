const { AuthenticationError } = require('apollo-server-express');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   fullThingFields,
   fullCollectionFields
} = require('../../utils/CardInterfaces');
const {
   searchAvailableTaxes,
   canSeeThingGate,
   canSeeThing,
   properUpdateStuff,
   calculateRelevancyScore,
   filterContentPiecesForPrivacy,
   supplementFilteredQuery
} = require('../../utils/ThingHandling');

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
   { orderBy = 'manualUpdatedAt_DESC' },
   ctx,
   info
) {
   if (ctx.req.memberId == null) {
      return [];
   }
   const things = await ctx.db.query
      .things(
         {
            where: {
               author: {
                  friends_some: {
                     id: ctx.req.memberId
                  }
               },
               privacy_in: ['Public', 'Friends']
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
      `{id lastActiveCollection {${fullCollectionFields}} collections {id title} }`
   );

   return myCollections;
}
exports.getCollections = getCollections;

async function getRelationsForThing(
   parent,
   { thingID, totalCount = 12 },
   ctx,
   info
) {
   // First we need to make sure the current user has permission to view this thing
   await canSeeThingGate({ id: thingID }, ctx);

   // Next we want to figure out how many things we want to fetch, which will be the total count evenly distributed among the relations (ie, among all the tags and the author)
   // So first let's get the tags for the thing, and we might as well grab the author while we're at it
   const theThingToRelate = await ctx.db.query.thing(
      {
         where: {
            id: thingID
         }
      },
      `{${fullThingFields}}`
   );
   const individualCount = Math.floor(
      totalCount / (theThingToRelate.partOfTags.length + 1)
   );

   // Then we want to get the most recent things by the author of the thing
   const authorThings = await ctx.db.query.things(
      {
         where: {
            author: {
               id: theThingToRelate.author.id
            }
         },
         first: individualCount,
         orderBy: 'manualUpdatedAt_DESC'
      },
      `{${fullThingFields}}`
   );

   const authorFilterFunction = async authorThing => {
      if (canSeeThing(ctx, authorThing)) {
         // If they can see the thing, we want to only let it through if it's not the original thing
         return authorThing.id !== thingID;
      }
      // If they can't see the thing, don't let it through
      return false;
   };

   let safeAuthorThings = [];
   for (const authorThing of authorThings) {
      if (await authorFilterFunction(authorThing)) {
         safeAuthorThings.push(authorThing);
      }
   }

   if (safeAuthorThings.length < individualCount && authorThings.length > 0) {
      const queryObj = {
         where: {
            AND: [
               {
                  author: {
                     id: theThingToRelate.author.id
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
         authorFilterFunction,
         'manualUpdatedAt_lt',
         authorThings[authorThings.length - 1].manualUpdatedAt,
         'manualUpdatedAt',
         individualCount - safeAuthorThings.length
      );

      safeAuthorThings = safeAuthorThings.concat(supplementaryThings);
   }

   // And the most recent things for each tag on the thing
   // First let's make arrays for the tags we're going to get things from and the things we've already used that we're going to filter out
   const tagIDs = theThingToRelate.partOfTags.map(tag => tag.id);
   let alreadyRelatedThingIDs = safeAuthorThings.map(thing => thing.id);
   alreadyRelatedThingIDs.push(thingID);

   const tagObjects = [];
   for (const tagID of tagIDs) {
      const tagThings = await ctx.db.query.things(
         {
            where: {
               partOfTags_some: {
                  id: tagID
               }
            },
            first: individualCount,
            orderBy: 'manualUpdatedAt_DESC'
         },
         `{${fullThingFields}}`
      );

      const tagFilterFunction = async tagThing => {
         if (canSeeThing(ctx, tagThing)) {
            // If they can see the thing, we want to only let it through if it's not the original thing or one of our author things
            return !alreadyRelatedThingIDs.includes(tagThing.id);
         }
         // If they can't see the thing, don't let it through
         return false;
      };

      let safeTagThings = [];
      for (const tagThing of tagThings) {
         if (await tagFilterFunction(tagThing)) {
            safeTagThings.push(tagThing);
         }
      }

      if (safeTagThings.length < individualCount && tagThings.length > 0) {
         const queryObj = {
            where: {
               AND: [
                  {
                     partOfTags_some: {
                        id: tagID
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
            tagFilterFunction,
            'manualUpdatedAt_lt',
            tagThings[tagThings.length - 1].manualUpdatedAt,
            'manualUpdatedAt',
            individualCount - safeTagThings.length
         );

         safeTagThings = safeTagThings.concat(supplementaryThings);
         tagObjects.push({ tagID, things: safeTagThings });

         const newUsedThings = safeTagThings.map(tagThing => tagThing.id);
         alreadyRelatedThingIDs = alreadyRelatedThingIDs.concat(newUsedThings);
      }
   }

   // Finally, we need to turn our found things into connections and return them
   const relationsArray = [];

   const createdAt = new Date().toISOString();
   console.log(safeAuthorThings.length);
   for (const authorThing of safeAuthorThings) {
      const relation = {
         id: `new-${authorThing.id}`,
         subject: theThingToRelate,
         object: authorThing,
         relationship: `also written by ${theThingToRelate.author.displayName}`,
         strength: 0,
         createdAt
      };
      relationsArray.push(relation);
   }

   for (const tagObj of tagObjects) {
      const { tagID, things } = tagObj;
      console.log(things.length);

      const tagIndexInOriginalThing = theThingToRelate.partOfTags.findIndex(
         tag => tag.id === tagID
      );
      const tagName =
         theThingToRelate.partOfTags[tagIndexInOriginalThing].title;

      things.forEach(tagThing => {
         const relation = {
            id: `new-${tagThing.id}`,
            subject: theThingToRelate,
            object: tagThing,
            relationship: `shares the tag "${tagName}" with`,
            strength: 0,
            createdAt
         };
         relationsArray.push(relation);
      });
   }

   return relationsArray;
}
exports.getRelationsForThing = getRelationsForThing;
