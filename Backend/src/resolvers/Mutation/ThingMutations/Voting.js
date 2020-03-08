const {
   loggedInGate,
   fullMemberGate
} = require('../../../utils/Authentication');
const { properUpdateStuff } = require('../../../utils/ThingHandling');

async function vote(parent, { thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const myVoterInfo = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{rep}`
   );

   const oldThing = await ctx.db.query.thing(
      {
         where: {
            id: thingID
         }
      },
      `{id votes {id voter {id}}}`
   );
   if (oldThing == null) {
      throw new Error('Thing not found');
   }

   const [myVote] = oldThing.votes.filter(
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
   } else {
      dataObj.votes = {
         delete: {
            id: myVote.id
         }
      };
   }

   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx);
   return updatedThing;
}
exports.vote = vote;
