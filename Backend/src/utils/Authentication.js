const loggedInGate = context => {
   if (!context.req.memberId) {
      throw new Error('You must be logged in to do that');
   }
};
exports.loggedInGate = loggedInGate;

const modGate = member => {
   if (!['Admin', 'Editor', 'Moderator'].includes(member.role)) {
      throw new Error("You don't have permission to do that");
   }
};
exports.modGate = modGate;

const fullMemberGate = member => {
   if (!['Admin', 'Editor', 'Moderator', 'Member'].includes(member.role)) {
      throw new Error('Only full members can do that');
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
