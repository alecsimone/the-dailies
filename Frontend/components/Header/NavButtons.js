import styled from 'styled-components';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { NEW_BLANK_THING } from '../../pages/new';
import { setAlpha, setLightness } from '../../styles/functions';

const StyledNav = styled.nav`
   display: flex;
   align-items: center;
   flex-grow: 1;
   a {
      line-height: 0;
      .loading {
         background: blue;
         ${props => props.theme.spin};
      }
      img {
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
            filter: saturate(0);
         }
      }
   }
   .searchBar {
      margin-left: 2rem;
      font-size: ${props => props.theme.bigText};
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      flex-grow: 1;
      padding-right: 3rem;
      img.searchIcon {
         cursor: pointer;
         width: ${props => props.theme.bigText};
         height: ${props => props.theme.bigText};
         ${props => props.theme.desktopBreakpoint} {
            cursor: auto;
         }
      }
      .searchForm {
         width: 100%;
         ${props => props.theme.mobileBreakpoint} {
            width: 33%;
         }
         input {
            width: 100%;
            height: 4rem;
            margin: 1rem;
            padding: 0 1rem;
            transition: all .25s;
            margin-left: 1rem;
            background: ${props => setLightness(props.theme.black, 1)};
            font-size: ${props => props.theme.bigText};
            z-index: 2;
            ${props => props.theme.desktopBreakpoint} {
               max-width: 40rem;
               opacity: .6;
            }
            &:focus {
               opacity: 1;
            }
         }
         &.hidden {
            @media screen and (max-width: ${props =>
               props.theme.desktopBPWidth}) {
               input {
                  max-width: 0;
                  min-width: 0;
                  padding: 0;
                  overflow: hidden;
               }
            }
         }
      }
   }
`;

const NavButtons = ({ showSearch, setShowSearch }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [newBlankThing] = useMutation(NEW_BLANK_THING, {
      onCompleted: data => {
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id }
         });
         const newPostButton = document.querySelector('.newPost');
         newPostButton.classList.remove('loading');
      }
   });
   return (
      <StyledNav className="navButtons">
         <a
            href="/new"
            id="newPostButton"
            onClick={e => {
               e.preventDefault();
               if (!e.target.classList.contains('loading')) {
                  e.target.classList.add('loading');
                  newBlankThing();
               }
            }}
         >
            <img src="/green-plus.png" className="newPost" alt="New Post" />
         </a>
         <div className="searchBar">
            <img
               className="searchIcon"
               src="/search.png"
               alt="search icon"
               onClick={() => setShowSearch(!showSearch)}
            />
            <form
               className={showSearch ? 'searchForm show' : 'searchForm hidden'}
               onSubmit={e => {
                  e.preventDefault();
                  setShowSearch(false);
                  Router.push({
                     pathname: '/search',
                     query: {
                        s: searchTerm
                     }
                  });
                  setSearchTerm('');
               }}
            >
               <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </form>
         </div>
      </StyledNav>
   );
};
NavButtons.propTypes = {};

export default NavButtons;
