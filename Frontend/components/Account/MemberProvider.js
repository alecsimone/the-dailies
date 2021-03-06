import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { basicMemberFields } from '../../lib/CardInterfaces';
import { MY_THINGS_QUERY } from '../Archives/MyThings';

const CURRENT_MEMBER_QUERY = gql`
   {
      me {
         ${basicMemberFields}
      }
   }
`;
const ME_SUBSCRIPTION = gql`
   subscription ME_SUBSCRIPTION {
      me {
         node {
            ${basicMemberFields}
         }
      }
   }
`;

const MemberContext = React.createContext();

const MemberProvider = ({ children, isHome }) => {
   const { loading, error, data } = useQuery(CURRENT_MEMBER_QUERY);

   const {
      data: subscriptionDataOne,
      loading: subscriptionLoading
   } = useSubscription(ME_SUBSCRIPTION);

   let memberData = {};
   if (error) {
      console.log(error);
      memberData.me = 'error';
   }

   if (data != null) {
      if (data.me == null) {
         memberData.me = null;
      } else {
         memberData.me = data.me;
      }
   } else {
      memberData = {
         loading
      };
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
