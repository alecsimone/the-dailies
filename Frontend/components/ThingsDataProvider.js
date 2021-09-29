import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { useState } from 'react';
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

const ThingsContext = React.createContext();
export { ThingsContext };

const addThingID = (id, setThingIDs) => {
   setThingIDs(prevState => {
      if (!prevState.includes(id)) {
         return [...prevState, id];
      }
      return prevState;
   });
};
const removeThingID = (id, setThingIDs) => {
   setThingIDs(prevState => prevState.filter(thingID => thingID !== id));
};

const ThingsDataProvider = ({ children }) => {
   const [thingIDs, setThingIDs] = useState([]);

   const { data, loading } = useSubscription(MANY_THINGS_SUBSCRIPTION, {
      variables: { IDs: thingIDs }
   });

   const addThingIDHandler = id => addThingID(id, setThingIDs);
   const removeThingIDHandler = id => removeThingID(id, setThingIDs);

   const thingsData = {
      addThingID: addThingIDHandler,
      removeThingID: removeThingIDHandler
   };

   return (
      <ThingsContext.Provider value={thingsData}>
         {children}
      </ThingsContext.Provider>
   );
};

export default ThingsDataProvider;
