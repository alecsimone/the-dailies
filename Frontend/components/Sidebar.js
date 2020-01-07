import styled from 'styled-components';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import { MemberContext } from './Account/MemberProvider';
import { smallThingCardFields } from '../lib/CardInterfaces';
import { makeTransparent } from '../styles/functions';
import Things from './Archives/Things';
import Error from './ErrorMessage';
import LoadingRing from './LoadingRing';

const THINGS_BY_MEMBER_QUERY = gql`
   query THINGS_BY_MEMBER_QUERY($id: ID!) {
      things(where: {author: {id: $id}}) {
         ${smallThingCardFields}
      }
   }
`;

const StyledSidebar = styled.section`
   background: hsla(30, 1%, 3%, 0.9);
   border-right: 2px solid
      ${props => makeTransparent(props.theme.highContrastGrey, 0.1)};
   padding: 2rem;
`;

const Sidebar = props => {
   const { me, loading: memberLoading } = useContext(MemberContext);
   const { loading, error, data } = useQuery(THINGS_BY_MEMBER_QUERY, {
      variables: { id: memberLoading || me == null ? '' : me.id }
   });

   if (error)
      return (
         <StyledSidebar>
            <Error error={error} />
         </StyledSidebar>
      );
   if (data)
      return (
         <StyledSidebar>
            <Things things={data.things} />
         </StyledSidebar>
      );
   if (loading)
      return (
         <StyledSidebar>
            <LoadingRing />
         </StyledSidebar>
      );
};

export default Sidebar;
