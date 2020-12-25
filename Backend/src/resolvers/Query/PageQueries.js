const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const { fullThingFields } = require('../../utils/CardInterfaces');
const {
   searchAvailableTaxes,
   canSeeThingGate,
   canSeeThing,
   properUpdateStuff
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

async function taxByTitle(parent, { title, personal }, ctx, info) {
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
         theTax.connectedThings = theTax.connectedThings.filter(thing =>
            canSeeThing(ctx, thing)
         );
      }

      const searchResults = await searchThings(title, ctx).catch(err => {
         console.log(err);
      });
      searchResults.forEach(result => {
         const preExistingCheck = theTax.connectedThings.filter(
            thing => thing.id !== result.id
         );
         if (preExistingCheck != null && preExistingCheck.length > 0) {
            theTax.connectedThings.push(result);
         }
      });

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

async function myThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
   if (ctx.req.memberId == null) {
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
   const things = await ctx.db.query
      .things(
         {
            where: {
               author: {
                  id: ctx.req.memberId
               }
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

async function allThings(parent, args, ctx, info) {
   let where;
   if (ctx.req.memberId == null) {
      where = {
         privacy: 'Public'
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
         ]
      };
   }

   const things = await ctx.db.query
      .things(
         {
            where,
            orderBy: 'id_DESC'
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   const thingsWithAVote = things.filter(thing => thing.votes.length > 0);

   return thingsWithAVote;
}
exports.allThings = allThings;

async function searchThings(string, ctx, isTitleOnly = false) {
   const everyThing = await ctx.db.query
      .things({}, `{${fullThingFields}}`)
      .catch(err => {
         console.log(err);
      });

   const term = string.toLowerCase().trim();

   const relevantThings = everyThing.filter(thing => {
      if (
         thing.title &&
         thing.title
            .toLowerCase()
            .trim()
            .includes(term)
      ) {
         return true;
      }
      if (isTitleOnly) return false;

      if (
         (thing.link &&
            thing.link
               .toLowerCase()
               .trim()
               .includes(term)) ||
         (thing.author.displayName &&
            thing.author.displayName
               .toLowerCase()
               .trim()
               .includes(term))
      ) {
         return true;
      }
      const contentCheck = thing.content.filter(contentPiece =>
         contentPiece.content.includes(term)
      );
      if (contentCheck != null && contentCheck.length > 0) {
         return true;
      }

      const tagCheck = thing.partOfTags.filter(tag => tag.title.includes(term));
      if (tagCheck != null && tagCheck.length > 0) {
         return true;
      }

      const commentCheck = thing.comments.filter(comment =>
         comment.comment.includes(term)
      );
      if (commentCheck != null && commentCheck.length > 0) {
         return true;
      }

      return false;
   });

   return relevantThings;
}
exports.searchThings = searchThings;

async function search(parent, { string, isTitleOnly }, ctx, info) {
   const relevantThings = await searchThings(string, ctx, isTitleOnly).catch(
      err => {
         console.log(err);
      }
   );

   const safeThings = relevantThings.filter(thing => canSeeThing(ctx, thing));
   return safeThings;
}
exports.search = search;
