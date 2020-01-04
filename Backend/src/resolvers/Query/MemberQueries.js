async function me(parent, args, ctx, info) {
   if (!ctx.req.memberId) {
      return null;
   }
   const member = await ctx.db.query.member(
      {
         where: { id: ctx.req.memberId }
      },
      info
   );
   if (member.defaultCategory == null) {
      member.defaultCategory = {
         title: 'Misc'
      };
   }
   return member;
}
exports.me = me;
