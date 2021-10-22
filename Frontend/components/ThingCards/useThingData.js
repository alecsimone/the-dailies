import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';

// Instead of passing down all the thing data from the queries directly through props, each component can just use this hook to get any data it needs directly from the Apollo cache, and we can keep our components nice and clean that way, as well as making them more flexible and able to be dropped in random places.

const useThingData = (thingID, fragmentName, requestedFields) => {
   const apolloClient = useApolloClient();
   const thingFields = apolloClient.readFragment(
      {
         id: `Thing:${thingID}`,
         fragment: gql`
         fragment ThingFor${fragmentName} on Thing {
            ${requestedFields}
         }
      `
      },
      true // This parameter specifies that we do want to get data from optimisticResponses
   );
   return thingFields;
};

export default useThingData;
