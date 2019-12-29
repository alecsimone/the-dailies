const { withFilter } = require('graphql-subscriptions');

const Subscription = {
   thing: {
      subscribe: withFilter(
         (parent, { IDs }, ctx, info) => ctx.pubsub.asyncIterator('thing'),
         (payload, variables) => variables.IDs.includes(payload.thing.node.id)
      )
   }
};

module.exports = Subscription;
