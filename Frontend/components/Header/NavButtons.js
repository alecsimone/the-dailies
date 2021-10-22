import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import SearchBar from '../SearchBar';
import { NEW_BLANK_THING } from '../../pages/new';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import X from '../Icons/X';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import { MY_THINGS_QUERY } from '../Archives/MyThings';

const StyledNav = styled.nav`
   display: flex;
   align-items: center;
   flex-grow: 1;
   a {
      line-height: 0;
      img, svg {
         width: ${props => props.theme.bigText};
         cursor: pointer;
         /* border: 1px solid ${props => props.theme.highContrastGrey}; */
         border-radius: 50%;
         padding: 0rem;
         opacity: 0.8;
         &:hover {
            opacity: 1;
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
         }
         &.newPost {
            transform: rotate(45deg);
            &.loading {
               ${props => props.theme.spin};
            }
         }
      }
   }
   .searchForm {
      ${props => props.theme.mobileBreakpoint} {
         width: 33%;
      }
      input {
         ${props => props.theme.desktopBreakpoint} {
            max-width: 40rem;
         }
      }
   }
`;

const NavButtons = ({ showSearch, setShowSearch, search }) => {
   const [newBlankThing] = useMutation(NEW_BLANK_THING, {
      onCompleted: data => {
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id }
         });
         const newPostButton = document.querySelector('.newPost');
         newPostButton.classList.remove('loading');
      },
      refetchQueries: [{ query: ALL_THINGS_QUERY }, { query: MY_THINGS_QUERY }],
      onError: err => {
         const newPostButton = document.querySelector('.newPost');
         newPostButton.classList.remove('loading');
         alert(err.message);
      },
      context: {
         debounceKey: 'newThing'
      }
   });
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <StyledNav className="navButtons">
         <Link href="/new">
            <a
               id="newPostButton"
               onClick={e => {
                  e.preventDefault();
                  const plusIcon = e.target.parentNode;
                  if (!plusIcon.classList.contains('loading')) {
                     plusIcon.classList.add('loading');
                     newBlankThing();
                  }
               }}
            >
               <X className="newPost" color={lowContrastGrey} />
            </a>
         </Link>
         <SearchBar
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            search={search}
         />
      </StyledNav>
   );
};
NavButtons.propTypes = {};

export default React.memo(NavButtons);
