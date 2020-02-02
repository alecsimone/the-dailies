const {
   signup,
   login,
   logout,
   editProfile,
   sendFriendRequest,
   confirmFriendRequest,
   ignoreFriendRequest
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
   markTweetsSeen,
   saveTweet
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
   editProfile,
   sendFriendRequest,
   confirmFriendRequest,
   ignoreFriendRequest,
   saveTweet
};

module.exports = Mutations;
