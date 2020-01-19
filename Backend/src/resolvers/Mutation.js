const { signup, login, logout } = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPiece,
   deleteContentPiece,
   editContentPiece,
   setThingPrivacy,
   setThingCategory,
   addTagToThingHandler,
   setFeaturedImage,
   setThingTitle,
   setPublicity,
   addComment,
   editComment,
   deleteComment,
   editLink
} = require('./Mutation/ThingMutations/Editing');
const { initiateTwitterLogin } = require('./Mutation/TwitterMutations');

const Mutations = {
   signup,
   login,
   logout,
   createThing,
   addContentPiece,
   deleteContentPiece,
   editContentPiece,
   setThingPrivacy,
   setThingCategory,
   addTagToThing: addTagToThingHandler,
   setFeaturedImage,
   setThingTitle,
   setPublicity,
   addComment,
   editComment,
   deleteComment,
   editLink,
   initiateTwitterLogin
};

module.exports = Mutations;
