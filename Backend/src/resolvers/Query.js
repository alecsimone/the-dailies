const { forwardTo } = require('prisma-binding');
const {
   searchTaxes,
   taxByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings,
   search,
   allThings
} = require('./Query/PageQueries');
const { me, member, searchFriends } = require('./Query/MemberQueries');
const {
   finishTwitterLogin,
   getTweet,
   refreshLists,
   getTweetsForList
} = require('./Query/TwitterQueries');

const Query = {
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
   searchFriends,
   allThings
};

module.exports = Query;
