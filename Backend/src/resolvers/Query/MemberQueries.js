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

async function member(parent, { id, displayName }, ctx, info) {
   let where;
   if (id) {
      where = {
         id
      };
   } else if (displayName) {
      where = {
         displayName
      };
   }
   const member = await ctx.db.query.member(
      {
         where
      },
      info
   );
   return member;
}
exports.member = member;
