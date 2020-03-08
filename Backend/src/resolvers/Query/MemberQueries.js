const { canSeeThing } = require('../../utils/ThingHandling');

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
   if (member && member.friends) {
      member.friends.forEach((friend, index) => {
         member.friends[index].createdThings = friend.createdThings.filter(
            thing => canSeeThing(ctx.req.memberId, thing)
         );
      });
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

   if (member && member.createdThings && member.createdThings.length > 0) {
      member.createdThings = member.createdThings.filter(thing =>
         canSeeThing(ctx.req.memberId, thing)
      );
   }

   return member;
}
exports.member = member;
