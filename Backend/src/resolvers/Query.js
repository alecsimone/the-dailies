const {
   searchTaxes,
   taxByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings,
   search,
   allThings,
   getCollections,
   getCollection,
   getRelationsForThing,
   getCollectionsForThing,
   getLinkArchive
} = require('./Query/PageQueries');
const {
   finishSignup,
   finishReset,
   me,
   member,
   searchMembers,
   moreMemberThings,
   moreMemberVotes
} = require('./Query/MemberQueries');
const {
   finishTwitterLogin,
   getTweet,
   refreshLists,
   getTweetsForList,
   getLinkData
} = require('./Query/TwitterQueries');

const Query = {
   finishSignup,
   finishReset,
   me,
   member,
   searchTaxes,
   taxByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings,
   finishTwitterLogin,
   getTweet,
   refreshLists,
   getTweetsForList,
   search,
   searchMembers,
   moreMemberThings,
   moreMemberVotes,
   allThings,
   getCollections,
   getCollection,
   getLinkData,
   getRelationsForThing,
   getCollectionsForThing,
   getLinkArchive
};

module.exports = Query;
