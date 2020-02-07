import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { CURRENT_MEMBER_QUERY } from '../Account/MemberProvider';
import { ALL_THINGS_QUERY } from '../../pages/index';
import { setAlpha, setLightness } from '../../styles/functions';

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
   top: calc(100% + 1rem);
   width: 20rem;
   background: ${props => setLightness(props.theme.black, 1)};
   z-index: 2;
   color: ${props => props.theme.mainText};
   font-size: ${props => props.theme.smallText};
   text-align: center;
   border: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   border-top: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.05)};
   .userMenuLinkRow {
      padding: 1rem;
      cursor: pointer;
      text-align: center;
      &:hover {
         background: ${props => props.theme.lowContrastGrey};
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

const MemberMenu = () => {
   const [logout, { data, loading, error }] = useMutation(LOGOUT_MUTATION);

   return (
      <StyledMemberMenu className="memberMenu">
         <Link href={{ pathname: '/me' }}>
            <div className="userMenuLinkRow">
               <a>Profile</a>
            </div>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'Things' }
            }}
         >
            <div className="userMenuLinkRow">
               <a>My Things</a>
            </div>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'Friends' }
            }}
         >
            <div className="userMenuLinkRow">
               <a>My Friends</a>
            </div>
         </Link>
         <div className="userMenuLinkRow">
            <a
               onClick={() =>
                  logout({
                     refetchQueries: [
                        { query: CURRENT_MEMBER_QUERY },
                        { query: ALL_THINGS_QUERY }
                     ]
                  })
               }
            >
               Log Out
            </a>
         </div>
      </StyledMemberMenu>
   );
};
MemberMenu.propTypes = {};

export default MemberMenu;
