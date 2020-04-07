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
const { me, member } = require('./Query/MemberQueries');
const {
   finishTwitterLogin,
   getTwitterLists,
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
   getTwitterLists,
   getTweet,
   refreshLists,
   getTweetsForList,
   search,
   allThings
};

module.exports = Query;
