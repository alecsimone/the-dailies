const Query = {
   async me(parent, args, ctx, info) {
      console.log(ctx.req.memberId);
      if (!ctx.req.memberId) {
         return null;
      }
      return await ctx.db.query.member(
         {
            where: { id: ctx.req.memberId }
         },
         info
      );
   }
};

module.exports = Query;
