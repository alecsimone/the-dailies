const {
   searchAvailableTags,
   canSeeThingGate
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
                        owner: {
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
   return tags[0];
}
exports.tagByTitle = tagByTitle;

async function thing(parent, { where }, ctx, info) {
   const thingPrivacyInfo = await ctx.db.query.thing(
      {
         where
      },
      `{privacy author {id friends {id friends {id}}}}`
   );

   canSeeThingGate(thingPrivacyInfo, ctx);

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
