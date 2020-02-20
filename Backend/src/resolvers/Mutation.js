const {
   signup,
   login,
   logout,
   editProfile,
   sendFriendRequest,
   confirmFriendRequest,
   ignoreFriendRequest,
   readNotifications
} = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPiece,
   deleteContentPiece,
   editContentPiece,
   reorderContent,
   setThingPrivacy,
   setThingCategory,
   addTagToThingHandler,
   setFeaturedImage,
   setThingTitle,
   setPublicity,
   addComment,
   editComment,
   deleteComment,
   editLink,
   deleteThing,
   newBlankThing,
   deleteTag
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
   reorderContent,
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
   saveTweet,
   deleteThing,
   readNotifications,
   newBlankThing,
   deleteTag
};

module.exports = Mutations;
