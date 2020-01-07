const loggedInGate = context => {
   if (!context.req.memberId) {
      throw new Error('You must be logged in to do that');
   }
};
exports.loggedInGate = loggedInGate;

const modGate = member => {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      )
   ) {
      throw new Error("You don't have permission to do that");
   }
};
exports.modGate = modGate;

const fullMemberGate = member => {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator', 'Member'].includes(role)
      )
   ) {
      throw new Error('Only full members can do that');
   }
};
exports.fullMemberGate = fullMemberGate;

const canEditThing = (member, thing) => {
   if (
      member.roles.some(role => ['Admin', 'Editor', 'Moderator'].includes(role))
   ) {
      return true;
   }
   if (thing.author.id === member.id) {
      return true;
   }
   return false;
};
exports.canEditThing = canEditThing;
