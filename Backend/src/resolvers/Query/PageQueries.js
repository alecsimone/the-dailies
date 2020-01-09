const { searchAvailableTags } = require('../../utils/ThingHandling');

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
