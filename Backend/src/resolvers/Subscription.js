const { withFilter } = require('graphql-subscriptions');

const Subscription = {
   thing: {
      subscribe: withFilter(
         (parent, { id }, ctx, info) => ctx.pubsub.asyncIterator('thing'),
         (payload, variables) => variables.id == payload.thing.node.id
      )
   },
   tag: {
      subscribe: (parent, { id }, ctx, info) => ctx.pubsub.asyncIterator('tag')
   }
};

module.exports = Subscription;
