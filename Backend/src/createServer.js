const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const { importSchema } = require('graphql-import');
const db = require('./db');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const Subscription = require('./resolvers/Subscription');

const typeDefs = gql(importSchema('./src/schema.graphql'));

const pubsub = new PubSub();

function createServer() {
   return new ApolloServer({
      typeDefs,
      resolvers: {
         Mutation,
         Query,
         Subscription
      },
      subscriptions: '/subscriptions',
      context: req => ({ ...req, db, pubsub })
   });
}

module.exports = createServer;
