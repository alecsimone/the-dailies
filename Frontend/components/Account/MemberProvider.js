import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const CURRENT_MEMBER_QUERY = gql`
   {
      me {
         id
         displayName
         rep
         avatar
         defaultPrivacy
         defaultCategory {
            title
         }
         roles
         twitterUserName
      }
   }
`;

const MemberContext = React.createContext();

const MemberProvider = props => {
   const { children } = props;
   const { loading, error, data } = useQuery(CURRENT_MEMBER_QUERY);

   const memberData = {
      loading
   };
   if (error) {
      memberData.me = 'error';
   }

   if (data) {
      if (data.me == null) {
         memberData.me = null;
      } else {
         memberData.me = data.me;
      }
   }

   return (
      <MemberContext.Provider value={memberData}>
         {children}
      </MemberContext.Provider>
   );
};
MemberProvider.propTypes = {
   children: PropTypes.node
};

export { MemberContext, CURRENT_MEMBER_QUERY };
export default MemberProvider;
