const {
   signup,
   login,
   logout,
   editProfile,
   sendFriendRequest,
   confirmFriendRequest,
   ignoreFriendRequest,
   readNotifications,
   toggleBroadcastView
} = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPiece,
   deleteContentPiece,
   editContentPiece,
   reorderContent,
   setThingPrivacy,
   addTaxToThingHandler,
   setFeaturedImage,
   setStuffTitle,
   setPublicity,
   addComment,
   editComment,
   deleteComment,
   editLink,
   deleteThing,
   newBlankThing,
   deleteTax,
   setColor,
   editSummary,
   copyContentPiece,
   unlinkContentPiece
} = require('./Mutation/ThingMutations/Editing');
const {
   initiateTwitterLogin,
   likeTweet,
   markTweetsSeen,
   saveTweet
} = require('./Mutation/TwitterMutations');
const { vote } = require('./Mutation/ThingMutations/Voting');

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
   addTaxToThing: addTaxToThingHandler,
   setFeaturedImage,
   setStuffTitle,
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
   deleteTax,
   setColor,
   vote,
   toggleBroadcastView,
   editSummary,
   copyContentPiece,
   unlinkContentPiece
};

module.exports = Mutations;
