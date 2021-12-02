const jwt = require('jsonwebtoken');
const {
   canSeeThing,
   supplementFilteredQuery,
   canSeeContentPiece
} = require('../../utils/ThingHandling');

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
   const memberData = await ctx.db.query
      .member(
         {
            where: { id: ctx.req.memberId }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });

   return memberData;
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
      const safeThings = [];
      for (const thing of member.createdThings) {
         const hasPermission = await canSeeThing(ctx, thing);
         if (hasPermission) {
            safeThings.push(thing);
         }
      }
      member.createdThings = safeThings;
   }

   if (ctx.req.memberId !== id) {
      if (ctx.req.memberId != null) {
         const viewer = await ctx.db.query
            .member(
               {
                  where: {
                     id: ctx.req.memberId
                  }
               },
               `{role}`
            )
            .catch(err => console.log(err));
         if (!['Admin', 'Editor', 'Moderator'].includes(viewer.role)) {
            member.email = '[PRIVATE]';
         }
      } else {
         member.email = '[PRIVATE]';
      }
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

async function moreMemberThings(
   parent,
   { memberID, cursor, count = 2 },
   ctx,
   info
) {
   const moreThings = await ctx.db.query.things(
      {
         where: {
            AND: [
               {
                  author: {
                     id: memberID
                  }
               },
               {
                  createdAt_lt: cursor
               }
            ]
         },
         orderBy: 'createdAt_DESC',
         first: count
      },
      info
   );

   const filterFunction = async thing => canSeeThing(ctx, thing);

   let safeThings = [];
   for (const thing of moreThings) {
      if (await filterFunction(thing)) {
         safeThings.push(thing);
      }
   }

   if (safeThings.length < count && moreThings.length > 0) {
      // The supplementFilteredQuery function needs a query object that's missing the cursor
      const queryObj = {
         where: {
            AND: [
               {
                  author: {
                     id: memberID
                  }
               }
            ]
         },
         orderBy: 'createdAt_DESC',
         first: count - safeThings.length
      };

      const supplementaryThings = await supplementFilteredQuery(
         ctx,
         'things',
         queryObj,
         info,
         filterFunction,
         'createdAt_lt',
         moreThings[moreThings.length - 1].createdAt,
         'createdAt',
         count - safeThings.length
      );

      safeThings = safeThings.concat(supplementaryThings);
   }

   return safeThings;
}
exports.moreMemberThings = moreMemberThings;

async function moreMemberVotes(
   parent,
   { memberID, cursor, count = 2 },
   ctx,
   info
) {
   const moreVotes = await ctx.db.query.votes(
      {
         where: {
            AND: [
               {
                  voter: {
                     id: memberID
                  }
               },
               {
                  createdAt_lt: cursor
               }
            ]
         },
         orderBy: 'createdAt_DESC',
         first: count
      },
      info
   );

   if (moreVotes.length === 0) return [];

   const filterFunction = async vote => {
      if (vote.onThing != null) {
         return canSeeThing(ctx, vote.onThing);
      }
      if (vote.onContentPiece != null) {
         return canSeeContentPiece(ctx, vote.onContentPiece);
      }
      if (vote.onComment != null) {
         // Comments can be on things or content pieces. They do not have their own privacy outside of that.
         if (vote.onComment.onThing != null) {
            return canSeeThing(ctx, vote.onComment.onThing);
         }
         return canSeeContentPiece(ctx, vote.onComment.onContentPiece);
      }
      return false;
   };

   let safeVotes = [];
   for (const vote of moreVotes) {
      if (await filterFunction(vote)) {
         safeVotes.push(vote);
      }
   }

   // If we got things back, but we now have less things than were asked for, we need to supplement our results
   if (safeVotes.length < count && moreVotes.length > 0) {
      // The supplementFilteredQuery function needs a query object that's missing the cursor
      const queryObj = {
         where: {
            AND: [
               {
                  voter: {
                     id: memberID
                  }
               }
            ]
         },
         orderBy: 'createdAt_DESC',
         first: count - safeVotes.length
      };

      const supplementaryVotes = await supplementFilteredQuery(
         ctx,
         'votes',
         queryObj,
         info,
         filterFunction,
         'createdAt_lt',
         moreVotes[moreVotes.length - 1].createdAt,
         'createdAt',
         count - safeVotes.length
      );

      safeVotes = safeVotes.concat(supplementaryVotes);
   }

   return safeVotes;
}
exports.moreMemberVotes = moreMemberVotes;
