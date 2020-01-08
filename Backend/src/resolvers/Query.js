const { forwardTo } = require('prisma-binding');
const { categories, searchTags, tagByTitle } = require('./Query/PageQueries');
const { me } = require('./Query/MemberQueries');

const Query = {
   me,
   categories,
   thing: forwardTo('db'),
   things: forwardTo('db'),
   searchTags,
   tagByTitle
};

module.exports = Query;
