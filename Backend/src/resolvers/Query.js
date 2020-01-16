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
const { me } = require('./Query/MemberQueries');

const Query = {
   me,
   categories,
   searchTags,
   tagByTitle,
   categoryByTitle,
   thing,
   myThings,
   myFriendsThings,
   publicThings
};

module.exports = Query;
