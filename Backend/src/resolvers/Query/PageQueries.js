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
   calculateRelevancyScore
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
         const allowedThings = theTax.connectedThings.filter(thing =>
            canSeeThing(ctx, thing)
         );
         let cursoredThings = allowedThings;
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
   return thingData;
}
exports.thing = thing;

async function myThings(
   parent,
   { orderBy = 'updatedAt_DESC', cursor, forCollection },
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
      first: 10
   };

   if (cursor != null) {
      // We should only get a cursor when we're doing a fetchMore, in which case we'll want the 20 things after the cursor, so we can push in an updatedAt_lt of the cursor as soon as we get it
      where.AND.push({ updatedAt_lt: cursor });
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
         // If we find one, we'll add it to our where object. Note that here we want to use updatedAt_gte instead of updatedAt_lt because we want all the things BEFORE the cursor, not after
         queryObj.where.AND.push({
            updatedAt_gte: collectionData.lastActiveCollection.thingQueryCursor
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
      if (lastThing == null) return things;

      const newCursor = lastThing.updatedAt;
      ctx.db.mutation.updateCollection({
         where: {
            id: forCollection
         },
         data: {
            thingQueryCursor: newCursor
         }
      });
   }
   return things;
}
exports.myThings = myThings;

async function myFriendsThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
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
   return things;
}
exports.myFriendsThings = myFriendsThings;

async function publicThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
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
   return things;
}
exports.publicThings = publicThings;

async function allThings(parent, { cursor }, ctx, info) {
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
            first: 2
         },
         info
      )
      .catch(err => {
         throw new Error(err.message);
      });

   return things;
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

   return foundThings;
}
exports.searchThings = searchThings;

async function search(parent, { string, isTitleOnly, cursor }, ctx, info) {
   const relevantThings = await searchThings(string, ctx, isTitleOnly).catch(
      err => {
         console.log(err);
      }
   );

   const safeThings = relevantThings.filter(thing => canSeeThing(ctx, thing));

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

   const trimmedThings = cursoredThings.slice(0, 12);

   return trimmedThings;
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
