import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { CURRENT_MEMBER_QUERY } from '../Account/MemberProvider';

const LOGOUT_MUTATION = gql`
   mutation LOG_OUT_MUTATION {
      logout {
         message
      }
   }
`;

const StyledMemberMenu = styled.div`
   position: absolute;
   display: block;
   border-radius: 4px;
   right: -2rem;
   top: -1rem;
   width: calc(100% + 3rem);
   background: ${props => props.theme.solidLowContrastCoolGrey};
   padding-top: 8rem;
   z-index: 2;
   color: ${props => props.theme.mainText};
   font-size: ${props => props.theme.smallText};
   border: 1px solid ${props => props.theme.lowContrastGrey};
   .userMenuLinkRow {
      padding: 1rem;
      cursor: pointer;
      text-align: center;
      &:hover {
         background: ${props => props.theme.lowContrastCoolGrey};
         text-decoration: underline;
      }
   }
   a {
      color: ${props => props.theme.mainText};
   }
`;

const MemberMenu = props => {
   const [logout, { data, loading, error }] = useMutation(LOGOUT_MUTATION);

   return (
      <StyledMemberMenu className="memberMenu">
         <Link href={{ pathname: '/me' }}>
            <div className="userMenuLinkRow">
               <a>Profile</a>
            </div>
         </Link>
         <Link href={{ pathname: '/me', query: { stuff: 'votes' } }}>
            <div className="userMenuLinkRow">
               <a>My Votes</a>
            </div>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'submissions' }
            }}
         >
            <div className="userMenuLinkRow">
               <a>My Submissions</a>
            </div>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'comments' }
            }}
         >
            <div className="userMenuLinkRow">
               <a>My Comments</a>
            </div>
         </Link>
         <div className="userMenuLinkRow">
            <a
               onClick={() =>
                  logout({
                     refetchQueries: [{ query: CURRENT_MEMBER_QUERY }]
                  })
               }
            >
               Log Out
            </a>
         </div>
      </StyledMemberMenu>
   );
};

export default MemberMenu;
