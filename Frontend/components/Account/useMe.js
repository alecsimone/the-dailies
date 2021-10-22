import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useContext } from 'react';
import { MemberContext } from './MemberProvider';

// Instead of putting the logged in user's data in context and retrieving it that way, we're going to use the apollo cache. To make that easier, we have this custom hook
const useMe = (fragmentName, requestedFields) => {
   // First we have to pull the loggedInUserID and memberLoading values out of MemberContext
   const { loggedInUserID, memberLoading } = useContext(MemberContext);
   // Then set up an apolloClient, which has to be done before the loading check because it's a hook and can't be called conditionally.
   const apolloClient = useApolloClient();

   // Then we check if we've loaded the loggedInUserData yet
   if (loggedInUserID == null) {
      // If we haven't, we have to return an object with a memberLoading property (so the component using the hook knows we're still loading) and a memberFields property (because that component is probably going to try to destructure that property, so it can't be null). The rest can be null though.
      return { memberLoading, memberFields: {} };
   }

   if (requestedFields == null || requestedFields.trim() === '') {
      // If they didn't request any fields, they just need the loggedInUserID, and there's no need to readFragment
      return { loggedInUserID, memberLoading, memberFields: {} };
   }

   // Then we run our readFragment. We need to get a unique fragmentName (which should just be the name of the component calling this hook), and then we just pass in the requested fields
   const memberFields = apolloClient.readFragment(
      {
         id: `Member:${loggedInUserID}`,
         fragment: gql`
         fragment MemberFor${fragmentName} on Member {
            ${requestedFields}
         }
      `
      },
      true // This parameter specifies that we do want to get data from optimisticResponses
   );

   // And return an object with everything the calling component needs
   return { loggedInUserID, memberLoading, memberFields };
};

export default useMe;
