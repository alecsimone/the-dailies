const jwt = require('jsonwebtoken');
const { canSeeThing } = require('../../utils/ThingHandling');

async function finishSignup(parent, { id, code }, ctx, info) {
   const existingMember = await ctx.db.query
      .member(
         {
            where: {
               id
            }
         },
         `{id, verificationToken, verificationTokenExpiry}`
      )
      .catch(err => {
         console.log(err);
      });

   if (existingMember == null) {
      throw new Error(
         'Something has gone in the registration process, sorry. Please try again.'
      );
   }

   if (existingMember.verificationToken !== code) {
      throw new Error(
         'Your verification code is not correct, sorry. Please try again or reach out for some help.'
      );
   }

   if (existingMember.verificationTokenExpiry < Date.now()) {
      throw new Error(
         "That verification code has expired, sorry. You're going to have to start again."
      );
   }

   const updatedMember = await ctx.db.mutation
      .updateMember(
         {
            where: {
               id
            },
            data: {
               role: 'Member'
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
   return updatedMember;
}
exports.finishSignup = finishSignup;

async function finishReset(parent, { id, code }, ctx, info) {
   const existingMember = await ctx.db.query
      .member(
         {
            where: {
               id
            }
         },
         `{id email displayName rep avatar resetToken resetTokenExpiry}`
      )
      .catch(err => {
         console.log(err);
      });

   if (existingMember == null) {
      throw new Error(
         "There's no member with that ID, so something went wrong somewhere, sorry. Please try to reset your password again or reach out for some help."
      );
   }

   if (existingMember.resetToken !== code) {
      throw new Error(
         'Your reset code is not correct, sorry. Please try again or reach out for some help.'
      );
   }

   if (existingMember.resetTokenExpiry < Date.now()) {
      throw new Error(
         "That reset code has expired, sorry. You're going to have to start again."
      );
   }

   return existingMember;
}
exports.finishReset = finishReset;

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
   // if (member && member.friends) {
   //    member.friends.forEach((friend, index) => {
   //       member.friends[index].createdThings = friend.createdThings.filter(
   //          thing => canSeeThing(ctx, thing)
   //       );
   //    });
   // }
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
