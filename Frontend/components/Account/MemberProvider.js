import React from 'react';
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
      }
   }
`;

const MemberContext = React.createContext();

const MemberProvider = props => {
   const { loading, error, data } = useQuery(CURRENT_MEMBER_QUERY);
   const memberData = {
      me: data == null ? null : data.me,
      loading
   };
   // if (loading) {
   //    memberData = {
   //       id: 'Loading...',
   //       displayName: 'Loading...',
   //       rep: 'Loading...',
   //       defaultPrivacy: 'Loading...',
   //       defaultCategory: {
   //          title: 'Loading...'
   //       }
   //    };
   // } else if (data == null) {
   //    memberData = null;
   // } else {
   //    memberData = data.me;
   // }
   return (
      <MemberContext.Provider value={memberData}>
         {props.children}
      </MemberContext.Provider>
   );
};

export { MemberContext, CURRENT_MEMBER_QUERY };
export default MemberProvider;
