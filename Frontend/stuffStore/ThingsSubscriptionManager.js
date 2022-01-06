import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useDispatch, useSelector } from 'react-redux';
import { fullThingFields } from '../lib/CardInterfaces';
import { upsertStuff } from './stuffSlice';

const MANY_THINGS_SUBSCRIPTION = gql`
   subscription MANY_THINGS_SUBSCRIPTION($IDs: [ID!]) {
      things(IDs: $IDs) {
         node {
            ${fullThingFields}
         }
      }
   }
`;

const ThingsSubscriptionManager = ({ children }) => {
   // The first role of this component is to keep track of all the various things we've fetched data for and handle a subscription to them so they stay up to date.
   const thingIDs = useSelector(
      state => {
         const fullKeys = Object.keys(state.stuff).filter(name =>
            name.startsWith('Thing')
         );
         const ids = fullKeys.map(key => key.substring(6));
         return ids;
      },
      (prev, next) => {
         if (prev.length !== next.length) return false;
         if (next.some(id => !prev.includes(id))) return false;
         if (prev.some(id => !next.includes(id))) return false;
         return true;
      }
   );

   const dispatch = useDispatch();

   const { data, loading } = useSubscription(MANY_THINGS_SUBSCRIPTION, {
      variables: { IDs: thingIDs },
      onSubscriptionData: ({ subscriptionData }) =>
         dispatch(upsertStuff(subscriptionData.data.things.node))
   });

   return null;
};

export default ThingsSubscriptionManager;
