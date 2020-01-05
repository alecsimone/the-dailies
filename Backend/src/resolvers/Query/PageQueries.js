async function categories(parent, args, ctx, info) {
   const globalCategories = await ctx.db.query.categories(
      {
         where: { owner: null }
      },
      `{id title}`
   );
   const personalCategories = await ctx.db.query.categories(
      {
         where: { owner: { id: ctx.req.memberId } }
      },
      `{id title}`
   );
   const allCategories = globalCategories.concat(personalCategories);
   return allCategories;
}
exports.categories = categories;
