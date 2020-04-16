import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { NEW_BLANK_THING } from '../../pages/new';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import X from '../Icons/X';
import SearchIcon from '../Icons/Search';
import { ALL_THINGS_QUERY } from '../../pages';
import { PUBLIC_THINGS_QUERY } from '../Archives/PublicThings';

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
   .searchBar {
      margin-left: 2rem;
      font-size: ${props => props.theme.bigText};
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      flex-grow: 1;
      padding-right: 3rem;
      svg.searchIcon {
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
            background: ${props => props.theme.deepBlack};
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
      },
      refetchQueries: [
         { query: ALL_THINGS_QUERY },
         { query: PUBLIC_THINGS_QUERY }
      ]
   });
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <StyledNav className="navButtons">
         <a
            href="/new"
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
         <div className="searchBar">
            <SearchIcon onClick={() => setShowSearch(!showSearch)} />
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

export default React.memo(NavButtons);
