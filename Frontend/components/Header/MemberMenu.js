import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { CURRENT_MEMBER_QUERY } from '../Account/MemberProvider';
import { setAlpha } from '../../styles/functions';

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
   border-radius: 0 0 4px 4px;
   right: -2rem;
   top: calc(100% + 0.5rem);
   width: 20rem;
   background: hsla(210, 40%, 4%, 1);
   z-index: 2;
   color: ${props => props.theme.mainText};
   font-size: ${props => props.theme.smallText};
   text-align: center;
   border: 3px solid ${props => setAlpha(props.theme.lowContrastCoolGrey, 0.25)};
   border-top: 3px solid
      ${props => setAlpha(props.theme.lowContrastCoolGrey, 0.05)};
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
   &.closed {
      display: none;
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
