const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   searchAvailableTags,
   canSeeThingGate,
   canSeeThing,
   properUpdateStuff
} = require('../../utils/ThingHandling');

async function categories(parent, args, ctx, info) {
   const categories = await ctx.db.query.categories({}, `{id title}`);
   return categories;
}
exports.categories = categories;

async function searchTags(parent, { searchTerm }, ctx, info) {
   const availableTags = await searchAvailableTags(searchTerm, ctx, false);
   return availableTags;
}
exports.searchTags = searchTags;

async function tagByTitle(parent, { title }, ctx, info) {
   const tags = await ctx.db.query.tags(
      {
         where: {
            AND: [
               {
                  title
               },
               {
                  OR: [
                     {
                        author: {
                           id: ctx.req.memberId
                        }
                     },
                     {
                        public: true
                     }
                  ]
               }
            ]
         }
      },
      info
   );
   if (tags == null || tags.length === 0) {
      return null;
   }

   if (tags[0].connectedThings && tags[0].connectedThings.length > 0) {
      tags[0].connectedThings = tags[0].connectedThings.filter(thing =>
         canSeeThing(ctx.req.memberId, thing)
      );
   }

   return tags[0];
}
exports.tagByTitle = tagByTitle;

async function categoryByTitle(parent, { title }, ctx, info) {
   const categories = await ctx.db.query.categories(
      {
         where: {
            title
         }
      },
      info
   );

   if (categories[0] == null) {
      return null;
   }

   if (
      categories[0].connectedThings &&
      categories[0].connectedThings.length > 0
   ) {
      categories[0].connectedThings = categories[0].connectedThings.filter(
         thing => canSeeThing(ctx.req.memberId, thing)
      );
   }

   return categories[0];
}
exports.categoryByTitle = categoryByTitle;

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
   return things;
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
