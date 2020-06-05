import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import { CURRENT_MEMBER_QUERY, MemberContext } from '../Account/MemberProvider';
import { ALL_THINGS_QUERY } from '../../pages/index';
import { setAlpha, setLightness } from '../../styles/functions';

const LOGOUT_MUTATION = gql`
   mutation LOG_OUT_MUTATION {
      logout {
         message
      }
   }
`;

const TOGGLE_BROADCAST_MUTATION = gql`
   mutation TOGGLE_BROADCAST_MUTATION($newState: Boolean!) {
      toggleBroadcastView(newState: $newState) {
         __typename
         id
         broadcastView
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
   background: ${props => props.theme.deepBlack};
   z-index: 2;
   color: ${props => props.theme.mainText};
   font-size: ${props => props.theme.smallText};
   text-align: center;
   border: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   border-top: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.05)};
   a.userMenuLinkRow,
   .userMenuLinkRow {
      display: block;
      color: ${props => props.theme.mainText};
      padding: 1rem;
      margin: 0;
      cursor: pointer;
      text-align: center;
      position: relative;
      &:hover {
         background: ${props => props.theme.lowContrastGrey};
         text-decoration: underline;
      }
      .switch {
         display: inline-block;
         height: 2.5rem;
         position: relative;
         width: 4.5rem;
         input {
            display: none;
         }
      }
      .slider {
         background-color: ${props => props.theme.highContrastGrey};
         bottom: 0;
         cursor: pointer;
         left: 0;
         position: absolute;
         right: 0;
         top: 0;
         transition: 0.4s;
         &:before {
            background-color: #fff;
            bottom: 0.25rem;
            content: '';
            height: 2rem;
            left: 0.25rem;
            position: absolute;
            transition: 0.4s;
            width: 2rem;
         }
      }
      input:checked + .slider {
         background-color: ${props => props.theme.primaryAccent};
      }

      input:checked + .slider:before {
         transform: translateX(2rem);
      }

      .slider.round {
         border-radius: 3rem;
      }

      .slider.round:before {
         border-radius: 50%;
      }
   }
   &.closed {
      display: none;
   }
`;

const MemberMenu = () => {
   const [logout, { data, loading, error }] = useMutation(LOGOUT_MUTATION);
   const [toggleBroadcastView] = useMutation(TOGGLE_BROADCAST_MUTATION);

   const {
      me: { broadcastView, id }
   } = useContext(MemberContext);

   const toggleBroadcasting = e => {
      toggleBroadcastView({
         variables: {
            newState: !broadcastView
         },
         optimisticResponse: {
            __typename: 'Mutation',
            toggleBroadcastView: {
               __typename: 'Member',
               id,
               broadcastView: !broadcastView
            }
         }
      });
   };

   return (
      <StyledMemberMenu className="memberMenu">
         <Link href={{ pathname: '/me' }}>
            <a className="userMenuLinkRow">Profile</a>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'Things' }
            }}
         >
            <a className="userMenuLinkRow">My Things</a>
         </Link>
         <Link
            href={{
               pathname: '/me',
               query: { stuff: 'Friends' }
            }}
         >
            <a className="userMenuLinkRow">My Friends</a>
         </Link>
         <div
            className="userMenuLinkRow"
            id="broadcastToggle"
            onClick={toggleBroadcasting}
         >
            Broadcast View:
            <label className="switch" htmlFor="broadcastToggle">
               <input
                  type="checkbox"
                  id="broadcastToggle"
                  checked={broadcastView}
               />
               <div className="slider round" />
            </label>
         </div>
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
