const {
   startSignup,
   login,
   logout,
   requestReset,
   changePassword,
   editProfile,
   sendFriendRequest,
   confirmFriendRequest,
   ignoreFriendRequest,
   readNotifications,
   toggleBroadcastView,
   addViewerToThing,
   removeViewerFromThing,
   storeOrganizeState
} = require('./Mutation/MemberMutations');
const {
   createThing,
   addContentPiece,
   storeUnsavedThingChanges,
   deleteContentPiece,
   editContentPiece,
   storeUnsavedContentPieceChanges,
   clearUnsavedContentPieceChanges,
   reorderContent,
   setThingPrivacy,
   addTaxToThingHandler,
   addTaxToThingById,
   addTaxesToThings,
   removeTaxFromThing,
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
const {
   addCollection,
   deleteCollection,
   setActiveCollection,
   renameCollection,
   setCollectionGroupByTag,
   addGroupToCollection,
   deleteGroupFromCollection,
   hideGroupOnCollection,
   showHiddenGroupsOnCollection,
   hideTagOnCollection,
   showHiddenTagsOnCollection,
   renameGroupOnCollection,
   copyThingToCollectionGroup,
   removeThingFromCollectionGroup,
   hideThingOnCollection,
   showHiddenThingsOnCollection,
   reorderGroups,
   reorderTags,
   moveCardToGroup,
   reorderUngroupedThings,
   setColumnOrder
} = require('./Mutation/CollectionMutations');

const Mutations = {
   startSignup,
   login,
   logout,
   requestReset,
   changePassword,
   createThing,
   addContentPiece,
   storeUnsavedThingChanges,
   deleteContentPiece,
   editContentPiece,
   storeUnsavedContentPieceChanges,
   clearUnsavedContentPieceChanges,
   reorderContent,
   setThingPrivacy,
   addTaxToThing: addTaxToThingHandler,
   addTaxToThingById,
   addTaxesToThings,
   removeTaxFromThing,
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
   unlinkContentPiece,
   addViewerToThing,
   removeViewerFromThing,
   storeOrganizeState,
   addCollection,
   deleteCollection,
   setActiveCollection,
   renameCollection,
   setCollectionGroupByTag,
   addGroupToCollection,
   deleteGroupFromCollection,
   hideGroupOnCollection,
   showHiddenGroupsOnCollection,
   hideTagOnCollection,
   showHiddenTagsOnCollection,
   renameGroupOnCollection,
   copyThingToCollectionGroup,
   removeThingFromCollectionGroup,
   hideThingOnCollection,
   showHiddenThingsOnCollection,
   reorderGroups,
   reorderTags,
   moveCardToGroup,
   reorderUngroupedThings,
   setColumnOrder
};

module.exports = Mutations;
