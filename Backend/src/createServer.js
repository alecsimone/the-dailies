const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const { importSchema } = require('graphql-import');
const jwt = require('jsonwebtoken');
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
         Subscription,
         Stuff: {
            __resolveType(obj, context, info) {
               return obj.__typename;
            }
         },
         Tax: {
            __resolveType(obj, context, info) {
               return obj.__typename;
            }
         }
      },
      resolverValidationOptions: {
         requireResolversForResolveType: false
      },
      introspection: true,
      subscriptions: {
         onConnect: (connectionParams, webSocket) => {
            const rawToken = webSocket.upgradeReq.headers.cookie;
            if (rawToken) {
               const token = rawToken.substring(6);
               const { memberId } = jwt.verify(token, process.env.APP_SECRET);
               return { memberId };
            }
            return {};
         },
         path: '/subscriptions'
      },
      context: async req => ({ ...req, db, pubsub })
   });
}

module.exports = createServer;
