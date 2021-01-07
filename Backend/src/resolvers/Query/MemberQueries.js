const { canSeeThing } = require('../../utils/ThingHandling');

async function me(parent, args, ctx, info) {
   const start = Date.now();
   if (!ctx.req.memberId) {
      return null;
   }
   const member = await ctx.db.query
      .member(
         {
            where: { id: ctx.req.memberId }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
   if (member && member.friends) {
      member.friends.forEach((friend, index) => {
         member.friends[index].createdThings = friend.createdThings.filter(
            thing => canSeeThing(ctx, thing)
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
   const member = await ctx.db.query
      .member(
         {
            where
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   if (member && member.createdThings && member.createdThings.length > 0) {
      member.createdThings = member.createdThings.filter(thing =>
         canSeeThing(ctx, thing)
      );
   }

   return member;
}
exports.member = member;

async function searchMembers(parent, { string }, ctx, info) {
   const allMembers = await ctx.db.query
      .members({}, '{__typename id displayName avatar}')
      .catch(err => {
         console.log(err);
      });

   if (allMembers == null) return null;

   const relevantMembers = allMembers.filter(member =>
      member.displayName.toLowerCase().includes(string.toLowerCase())
   );

   return relevantMembers;
}
exports.searchMembers = searchMembers;
