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
   getRelationsForThing
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
const { getLinkArchive } = require('./query/pageQueries');

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
   getLinkData,
   getRelationsForThing,
   getLinkArchive
};

module.exports = Query;
