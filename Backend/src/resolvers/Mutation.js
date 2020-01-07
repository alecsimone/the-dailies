const { signup, login, logout } = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPieceToThing,
   deleteContentPieceFromThing,
   editContentPieceOnThing,
   setThingPrivacy,
   setThingCategory,
   addTagToThingHandler,
   setFeaturedImage,
   setThingTitle
} = require('./Mutation/ThingMutations/Editing');

const Mutations = {
   signup,
   login,
   logout,
   createThing,
   addContentPieceToThing,
   deleteContentPieceFromThing,
   editContentPieceOnThing,
   setThingPrivacy,
   setThingCategory,
   addTagToThing: addTagToThingHandler,
   setFeaturedImage,
   setThingTitle
};

module.exports = Mutations;
