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
   deleteComment
} = require('./Mutation/ThingMutations/Editing');

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
   deleteComment
};

module.exports = Mutations;
