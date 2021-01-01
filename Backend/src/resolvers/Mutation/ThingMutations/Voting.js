const { AuthenticationError } = require('apollo-server-express');
const {
   loggedInGate,
   fullMemberGate
} = require('../../../utils/Authentication');
const { properUpdateStuff } = require('../../../utils/ThingHandling');

async function vote(parent, { id, type }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const myVoterInfo = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{rep}`
      )
      .catch(err => {
         console.log(err);
      });

   let lowerCasedType = type.toLowerCase();
   if (lowerCasedType === 'contentpiece') {
      lowerCasedType = 'contentPiece';
   }

   const oldStuff = await ctx.db.query[lowerCasedType](
      {
         where: {
            id
         }
      },
      `{id score votes {id voter {id} value}}`
   ).catch(err => {
      console.log(err);
   });
   if (oldStuff == null) {
      throw new Error(`${type} not found`);
   }

   const [myVote] = oldStuff.votes.filter(
      ({ voter }) => voter.id === ctx.req.memberId
   );

   const dataObj = {};
   if (myVote == null) {
      dataObj.votes = {
         create: {
            value: myVoterInfo.rep,
            voter: {
               connect: {
                  id: ctx.req.memberId
               }
            }
         }
      };
      dataObj.score = oldStuff.score + myVoterInfo.rep;
   } else {
      dataObj.votes = {
         delete: {
            id: myVote.id
         }
      };
      dataObj.score = oldStuff.score - myVote.value;
   }

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(
      err => {
         console.log(err);
      }
   );
   return updatedStuff;
}
exports.vote = vote;
