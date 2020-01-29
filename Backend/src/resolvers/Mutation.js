const {
   signup,
   login,
   logout,
   editProfile
} = require('./Mutation/MemberMutations');
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
const {
   initiateTwitterLogin,
   likeTweet,
   markTweetsSeen
} = require('./Mutation/TwitterMutations');

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
   initiateTwitterLogin,
   likeTweet,
   markTweetsSeen,
   editProfile
};

module.exports = Mutations;
