const { AuthenticationError } = require('apollo-server-express');

const loggedInGate = async context => {
   if (!context.req.memberId) {
      // return false;
      throw new Error();
   }
   const memberCheck = await context.db.query
      .member(
         {
            where: {
               id: context.req.memberId
            }
         },
         '{id}'
      )
      .catch(err => console.log(err));
   if (memberCheck == null) {
      // return false;
      throw new Error();
   }
   return true;
};
exports.loggedInGate = loggedInGate;

const modGate = member => {
   if (!['Admin', 'Editor', 'Moderator'].includes(member.role)) {
      throw new AuthenticationError("You don't have permission to do that");
   }
};
exports.modGate = modGate;

const fullMemberGate = member => {
   if (!['Admin', 'Editor', 'Moderator', 'Member'].includes(member.role)) {
      if (member.role === 'Unverified') {
         throw new AuthenticationError(
            'You have to verify your email before you can do that!'
         );
      }
      throw new AuthenticationError('Only full members can do that');
   }
};
exports.fullMemberGate = fullMemberGate;

const canEditThing = (member, thing) => {
   if (['Admin', 'Editor', 'Moderator'].includes(member.role)) {
      return true;
   }
   if (thing.author.id === member.id) {
      return true;
   }
   return false;
};
exports.canEditThing = canEditThing;
