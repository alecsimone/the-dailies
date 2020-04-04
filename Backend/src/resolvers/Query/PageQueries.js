const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
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
      false,
      personal
   );
   return availableTags;
}
exports.searchTaxes = searchTaxes;

async function taxByTitle(parent, { title, personal }, ctx, info) {
   const typeToQuery = personal ? 'stacks' : 'tags';
   const where = {
      title
   };
   if (personal) {
      where.author = {
         id: ctx.req.memberId
      };
   }
   const taxes = await ctx.db.query[typeToQuery](
      {
         where
      },
      info
   );
   if (taxes == null || taxes.length === 0) {
      return null;
   }

   if (taxes[0].connectedThings && taxes[0].connectedThings.length > 0) {
      taxes[0].connectedThings = taxes[0].connectedThings.filter(thing =>
         canSeeThing(ctx.req.memberId, thing)
      );
   }

   return taxes[0];
}
exports.taxByTitle = taxByTitle;

async function thing(parent, { where }, ctx, info) {
   await canSeeThingGate(where, ctx);

   const thing = await ctx.db.query.thing(
      {
         where
      },
      info
   );
   return thing;
}
exports.thing = thing;

async function myThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
   if (ctx.req.memberId == null) {
      const things = await ctx.db.query.things(
         {
            where: {
               privacy: 'Public'
            },
            orderBy
         },
         info
      );
      return things;
   }
   const things = await ctx.db.query.things(
      {
         where: {
            author: {
               id: ctx.req.memberId
            }
         },
         orderBy
      },
      info
   );
   return things;
}
exports.myThings = myThings;

async function myFriendsThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
   if (ctx.req.memberId == null) {
      return [];
   }
   const things = await ctx.db.query.things(
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
   );
   return things;
}
exports.myFriendsThings = myFriendsThings;

async function publicThings(parent, { orderBy = 'id_DESC' }, ctx, info) {
   const things = await ctx.db.query.things(
      {
         where: {
            privacy: 'Public'
         },
         orderBy
      },
      info
   );
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

   const things = await ctx.db.query.things(
      {
         where,
         orderBy: 'id_DESC'
      },
      info
   );

   const thingsWithAVote = things.filter(thing => thing.votes.length > 0);

   return thingsWithAVote;
}
exports.allThings = allThings;

async function search(parent, { string }, ctx, info) {
   const foundThings = await ctx.db.query.things(
      {
         orderBy: 'id_DESC',
         where: {
            OR: [
               {
                  title_contains: string
               },
               {
                  link_contains: string
               },
               {
                  content_some: {
                     content_contains: string
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
                  author: {
                     displayName_contains: string
                  }
               }
            ]
         }
      },
      info
   );
   const safeThings = foundThings.filter(thing =>
      canSeeThing(ctx.req.memberId, thing)
   );
   return safeThings;
}
exports.search = search;
