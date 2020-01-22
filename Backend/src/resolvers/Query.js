const { forwardTo } = require('prisma-binding');
const {
   categories,
   searchTags,
   tagByTitle,
   categoryByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings
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
   categories,
   searchTags,
   tagByTitle,
   categoryByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings,
   finishTwitterLogin,
   getTwitterLists,
   getTweet,
   refreshLists,
   getTweetsForList
};

module.exports = Query;
