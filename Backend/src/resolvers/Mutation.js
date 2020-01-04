const { signup, login, logout } = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPieceToThing,
   deleteContentPieceFromThing,
   editContentPieceOnThing
} = require('./Mutation/ThingMutations/Editing');

const Mutations = {
   signup,
   login,
   logout,
   createThing,
   addContentPieceToThing,
   deleteContentPieceFromThing,
   editContentPieceOnThing
};

module.exports = Mutations;
