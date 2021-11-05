import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useSelector } from 'react-redux';
import { fullThingFields } from '../lib/CardInterfaces';

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
      state => Object.keys(state.things),
      (prev, next) => {
         if (prev.length !== next.length) return false;
         if (next.some(id => !prev.includes(id))) return false;
         if (prev.some(id => !next.includes(id))) return false;
         return true;
      }
   );

   const { data, loading } = useSubscription(MANY_THINGS_SUBSCRIPTION, {
      variables: { IDs: thingIDs },
      onCompleted: newData => console.log(newData)
   });

   return null;
};

export default ThingsSubscriptionManager;
