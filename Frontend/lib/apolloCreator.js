import withApollo from 'next-with-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, Observable, split } from 'apollo-link';
import DebounceLink from 'apollo-link-debounce';
import { WebSocketLink } from 'apollo-link-ws';
import ws from 'ws';
import { getMainDefinition } from 'apollo-utilities';
import { endpoint, endpointNoHTTP } from '../config';

function createClient({ headers, initialState }) {
   const cache = new InMemoryCache().restore(initialState);
   cache.writeData({
      data: {}
   });

   const request = async operation => {
      operation.setContext({
         fetchOptions: {
            credentials: 'include'
         },
         headers: {
            cookie: headers && headers.cookie
         }
      });
   };

   const httpLink = new HttpLink({
      uri: endpoint,
      credentials: 'same-origin'
   });

   const subscriptionEndpoint =
      process.env.NODE_ENV === 'development'
         ? `ws://${endpointNoHTTP}/subscriptions`
         : `wss://${endpointNoHTTP}/subscriptions`;

   const wsLink = process.browser
      ? new WebSocketLink({
           uri: subscriptionEndpoint,
           options: {
              reconnect: true
           },
           webSocketImpl: ws.client
        })
      : () => console.log('SSR');

   const link = split(
      ({ query }) => {
         const { kind, operation } = getMainDefinition(query);
         return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink
   );

   const requestLink = new ApolloLink(
      (operation, forward) =>
         new Observable(observer => {
            let handle;
            Promise.resolve(operation)
               .then(oper => request(oper))
               .then(() => {
                  handle = forward(operation).subscribe({
                     next: observer.next.bind(observer),
                     error: observer.error.bind(observer),
                     complete: observer.complete.bind(observer)
                  });
               })
               .catch(observer.error.bind(observer));

            return () => {
               if (handle) handle.unsubscribe();
            };
         })
   );

   return new ApolloClient({
      ssrMode: false,
      link: ApolloLink.from([
         onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors)
               graphQLErrors.forEach(({ message, locations, path }) =>
                  console.log(
                     `[GraphQL error]: ${message}, Path: ${path}`,
                     locations
                  )
               );
            if (networkError)
               console.log(`[Network error]: ${networkError}`, networkError);
         }),
         new DebounceLink(2000), // Any mutation or query which gets a debounceKey in the context property of its useMutation or useQuery hook (note: has to be in the hook, not in a mutation function) will be debounced for the length in ms of the argument of the DebounceLink() function
         requestLink,
         link
      ]),
      cache,
      resolvers: {},
      shouldBatch: true
   });
}

export default withApollo(createClient);
