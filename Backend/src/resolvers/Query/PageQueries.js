const {
   searchAvailableTags,
   canSeeThingGate,
   canSeeThing,
   canSeeTagGate,
   canSeeTag
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
   await canSeeTagGate({ id: tags[0].id }, ctx);

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
   if (thing.partOfTags && thing.partOfTags.length > 0) {
      thing.partOfTags = thing.partOfTags.filter(tagData =>
         canSeeTag(ctx.req.memberId, tagData)
      );
   }
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
