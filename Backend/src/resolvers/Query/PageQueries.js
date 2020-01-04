async function categories(parent, args, ctx, info) {
   const globalCategories = await ctx.db.query.categories(
      {
         where: { owner: null }
      },
      `{title}`
   );
   const personalCategories = await ctx.db.query.categories(
      {
         where: { owner: { id: ctx.req.memberId } }
      },
      `{title}`
   );
   const allCategories = globalCategories.concat(personalCategories);
   return allCategories;
}
exports.categories = categories;
