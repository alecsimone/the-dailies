const { withFilter } = require('graphql-subscriptions');

const Subscription = {
   thing: {
      subscribe: withFilter(
         (parent, { id }, ctx, info) => ctx.pubsub.asyncIterator('thing'),
         (payload, variables) => variables.id == payload.thing.node.id
      )
   },
   things: {
      subscribe: withFilter(
         (parent, { IDs }, ctx, info) => ctx.pubsub.asyncIterator('things'),
         (payload, variables) => variables.IDs.includes(payload.things.node.id)
      )
   },
   tag: {
      subscribe: (parent, args, ctx, info) => ctx.pubsub.asyncIterator('tag')
   },
   stack: {
      subscribe: (parent, args, ctx, info) => ctx.pubsub.asyncIterator('stack')
   },
   me: {
      subscribe: withFilter(
         (parent, args, ctx, info) => ctx.pubsub.asyncIterator('me'),
         (payload, variables, ctx, info) =>
            ctx.connection.context.memberId === payload.me.node.id
      )
   },
   myThings: {
      subscribe: withFilter(
         (parent, args, ctx, info) => ctx.pubsub.asyncIterator('myThings'),
         (payload, variables, ctx, info) =>
            payload.myThings.node != null &&
            ctx.connection.context.memberId === payload.myThings.node.author.id
      )
   }
};

module.exports = Subscription;
