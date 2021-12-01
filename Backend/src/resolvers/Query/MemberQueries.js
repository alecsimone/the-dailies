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
   console.log("let's get some member data");
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

   const safeThings = moreThings.filter(thing => canSeeThing(ctx, thing));

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

   const safeVotes = [];
   for (const vote of moreVotes) {
      if (vote.onThing != null) {
         const canSee = await canSeeThing(ctx, vote.onThing);
         if (canSee) {
            safeVotes.push(vote);
         }
      }
      if (vote.onContentPiece != null) {
         // TODO: Actually check content piece privacy
         safeVotes.push(vote);
      }
      if (vote.onComment != null) {
         // TODO: Actually check comment privacy. Currently comments don't have their own privacy, so this means finding the thing or content piece they're on and then checking that stuff's privacy
         safeVotes.push(vote);
      }
   }

   if (safeVotes.length < count && moreVotes.length > 0) {
      // If we didn't get enough votes that passed our filter, we need to get more until we do.
      let supplementaryVotes = [];
      let noMoreVotes = false;
      let newCursor = moreVotes[moreVotes.length - 1].createdAt;

      // We're going to keep getting more votes until we have enough votes to send back to the user, or until we run out of votes
      while (
         supplementaryVotes.length < count - safeVotes.length &&
         !noMoreVotes
      ) {
         // First we'll get as many new votes as we still need to complete our count
         const newVotes = await ctx.db.query.votes(
            {
               where: {
                  AND: [
                     {
                        voter: {
                           id: memberID
                        }
                     },
                     {
                        createdAt_lt: newCursor
                     }
                  ]
               },
               orderBy: 'createdAt_DESC',
               first: count - supplementaryVotes.length - safeVotes.length
            },
            info
         );

         if (newVotes.length === 0) {
            // If we don't get anything from that query, that means we're all out of votes and can exit the loop
            noMoreVotes = true;

            const combinedVotes = safeVotes.concat(supplementaryVotes);

            return combinedVotes;
         }

         // Otherwise, we run our filter again on the new votes
         const newSafeVotes = [];
         for (const vote of newVotes) {
            if (vote.onThing != null) {
               const canSee = await canSeeThing(ctx, vote.onThing);
               if (canSee) {
                  newSafeVotes.push(vote);
               }
            }
            if (vote.onContentPiece != null) {
               // TODO: Actually check content piece privacy
               newSafeVotes.push(vote);
            }
            if (vote.onComment != null) {
               // TODO: Actually check comment privacy
               newSafeVotes.push(vote);
            }
         }
         // And combine what we have left with our previous supplementary votes
         supplementaryVotes = supplementaryVotes.concat(newSafeVotes);

         newCursor = newVotes[newVotes.length - 1].createdAt;
      }
      const finalVotes = safeVotes.concat(supplementaryVotes);
      return finalVotes;
   }

   return safeVotes;
}
exports.moreMemberVotes = moreMemberVotes;
