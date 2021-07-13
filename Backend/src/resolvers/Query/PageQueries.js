const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const { fullThingFields } = require('../../utils/CardInterfaces');
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
   { orderBy = 'updatedAt_DESC', cursor },
   ctx,
   info
) {
   if (ctx.req.memberId == null) {
      return null;
   }

   const where = {
      author: {
         id: ctx.req.memberId
      }
   };

   if (cursor != null) {
      where.updatedAt_lt = cursor;
   }

   const things = await ctx.db.query
      .things(
         {
            where,
            orderBy,
            first: 20
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
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
            first: 8
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
