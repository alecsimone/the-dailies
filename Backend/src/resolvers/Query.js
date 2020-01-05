const { forwardTo } = require('prisma-binding');
const { categories, searchTags } = require('./Query/PageQueries');
const { me } = require('./Query/MemberQueries');

const Query = {
   me,
   categories,
   thing: forwardTo('db'),
   things: forwardTo('db'),
   searchTags
};

module.exports = Query;
