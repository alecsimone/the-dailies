import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const CURRENT_MEMBER_QUERY = gql`
   {
      me {
         id
         displayName
         rep
      }
   }
`;

const MemberContext = React.createContext();

const MemberProvider = props => {
   const { loading, error, data } = useQuery(CURRENT_MEMBER_QUERY);
   console.log(data);
   let memberData;
   if (loading) {
      memberData = 'loading';
   } else if (data == null) {
      memberData = null;
   } else {
      memberData = data.me;
   }
   return (
      <MemberContext.Provider value={memberData}>
         {props.children}
      </MemberContext.Provider>
   );
};

export { MemberContext, CURRENT_MEMBER_QUERY };
export default MemberProvider;
