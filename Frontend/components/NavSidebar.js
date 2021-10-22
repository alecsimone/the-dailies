import gql from 'graphql-tag';
import styled from 'styled-components';
import Link from 'next/link';
import Router from 'next/router';
import { useContext, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { NEW_BLANK_THING } from '../pages/new';
import { setAlpha } from '../styles/functions';
import Home from './Icons/Home';
import SidebarHeaderIcon from './Icons/SidebarHeaderIcon';
import Search from './Icons/Search';
import X from './Icons/X';
import DefaultAvatar from './Icons/DefaultAvatar';
import StackIcon from './Icons/Stack';
import { ModalContext } from './ModalProvider';
import { ALL_THINGS_QUERY } from '../lib/ThingHandling';
import { CURRENT_MEMBER_QUERY } from './Account/MemberProvider';
import ArrowIcon from './Icons/Arrow';
import { MY_THINGS_QUERY } from './Archives/MyThings';
import useMe from './Account/useMe';

const LOGOUT_MUTATION = gql`
   mutation LOG_OUT_MUTATION {
      logout {
         message
      }
   }
`;

const StyledNavSidebar = styled.section`
   background: ${props => props.theme.midBlack};
   border-right: 3px solid
      ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   text-align: center;
   .container {
      max-height: 800px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
   }
   &.loggedOut {
      .container {
         justify-content: flex-start;
      }
   }
   a {
      &:hover {
         text-decoration: none;
      }
   }
   padding-top: 1rem;
   .navLine {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 2rem 1.5rem;
      transition: all 0.2s;
      ${props => props.theme.mobileBreakpoint} {
         justify-content: space-around;
         .navLabel {
            display: none;
         }
      }
      ${props => props.theme.midScreenBreakpoint} {
         justify-content: stretch;
         .navLabel {
            display: block;
         }
      }
      &:hover {
         background: hsla(0, 0%, 100%, 0.05);
         svg {
            &.homeIcon {
               fill: ${props => props.theme.majorColor};
            }
            &.You,
            &.Friends {
               stroke: ${props => props.theme.majorColor};
            }
            &.searchIcon {
               circle {
                  stroke: ${props => props.theme.majorColor};
               }
               path {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.Tweets {
               path {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.x {
               rect {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.defaultAvatar {
               path,
               circle {
                  fill: ${props => props.theme.majorColor};
               }
            }
         }
         .navLabel {
            color: ${props => props.theme.majorColor};
         }
      }
      .navIcon {
         width: 8rem;
         height: ${props => props.theme.bigText};
         display: inline-flex;
         align-items: center;
         justify-content: center;
      }
      .navLabel {
         justify-self: start;
         color: ${props => props.theme.mainText};
         font-size: ${props => props.theme.bigText};
         margin-left: 2rem;
         transition: all 0.2s;
         line-height: 1;
         &:hover {
            text-decoration: none;
         }
      }
      svg {
         width: ${props => props.theme.bigText};
         justify-self: center;
         &.wide {
            width: auto;
            height: ${props => props.theme.bigText};
         }
         &.homeIcon {
            fill: ${props => props.theme.lowContrastGrey};
         }
         &.navNewPost {
            transform: rotate(45deg);
            &.loading {
               ${props => props.theme.spin};
            }
         }
         &.defaultAvatar {
            rect {
               fill: none;
            }
            path,
            circle {
               fill: ${props => props.theme.lowContrastGrey};
            }
         }
      }
   }
   svg.desktopHider {
      display: none;
      ${props => props.theme.desktopBreakpoint} {
         display: inline-block;
         height: ${props => props.theme.smallHead};
         position: absolute;
         right: 1rem;
         bottom: 1rem;
         opacity: 0.4;
         &:hover {
            opacity: 0.8;
         }
      }
   }
`;

const NavSidebar = () => {
   const [newBlankThing] = useMutation(NEW_BLANK_THING, {
      onCompleted: data => {
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id }
         });
         const newPostButton = document.querySelector('.navNewPost');
         newPostButton.classList.remove('loading');
      },
      refetchQueries: [{ query: ALL_THINGS_QUERY }, { query: MY_THINGS_QUERY }],
      onError: err => alert(err.message),
      context: {
         debounceKey: 'newThing'
      }
   });
   const {
      navSidebarIsOpen,
      setNavSidebarIsOpen,
      setThingsSidebarIsOpen
   } = useContext(ModalContext);

   const { loggedInUserID } = useMe();

   const [desktopIsHidden, setDesktopIsHidden] = useState(false);

   const [logout] = useMutation(LOGOUT_MUTATION, {
      onError: err => alert(err.message)
   });

   let className = 'navSidebar';
   if (navSidebarIsOpen) {
      className += ' visible';
   } else {
      className += ' hidden';
   }
   if (loggedInUserID != null) {
      className += ' loggedIn';
   } else {
      className += ' loggedOut';
   }
   if (desktopIsHidden) {
      className += ' desktopHidden';
   }

   return (
      <StyledNavSidebar className={className}>
         <div className="container">
            <Link href="/">
               <a
                  onClick={() => {
                     setNavSidebarIsOpen(false);
                     setThingsSidebarIsOpen(false);
                  }}
                  title="Home"
               >
                  <div className="navLine">
                     <span className="navIcon">
                        <Home />
                     </span>
                     <span className="navLabel">Home</span>
                  </div>
               </a>
            </Link>
            {loggedInUserID && (
               <Link href="/me">
                  <a
                     onClick={() => setNavSidebarIsOpen(false)}
                     title="My Things"
                  >
                     <div className="navLine">
                        <span className="navIcon">
                           <SidebarHeaderIcon icon="You" className="wide" />
                        </span>
                        <span className="navLabel">My Things</span>
                     </div>
                  </a>
               </Link>
            )}
            {loggedInUserID && (
               <Link
                  href={{
                     pathname: '/me',
                     query: { stuff: 'Friends' }
                  }}
               >
                  <a onClick={() => setNavSidebarIsOpen(false)} title="Friends">
                     <div className="navLine">
                        <span className="navIcon">
                           <SidebarHeaderIcon icon="Friends" className="wide" />
                        </span>
                        <span className="navLabel">Friends</span>
                     </div>
                  </a>
               </Link>
            )}
            <Link href="/search">
               <a onClick={() => setNavSidebarIsOpen(false)} title="Search">
                  <div className="navLine">
                     <span className="navIcon">
                        <Search />
                     </span>
                     <span className="navLabel">Search</span>
                  </div>
               </a>
            </Link>
            {loggedInUserID && (
               <Link href="/twitter">
                  <a onClick={() => setNavSidebarIsOpen(false)} title="Twitter">
                     <div className="navLine">
                        <span className="navIcon">
                           <SidebarHeaderIcon icon="Tweets" className="wide" />
                        </span>
                        <span className="navLabel">Twitter</span>
                     </div>
                  </a>
               </Link>
            )}
            {loggedInUserID && (
               <Link href="/new">
                  <a
                     onClick={e => {
                        setNavSidebarIsOpen(false);
                        e.preventDefault();
                        const thisLine = e.target.parentNode;
                        const plusIconList = thisLine.getElementsByClassName(
                           'navNewPost'
                        );
                        const plusIcon = plusIconList[0];
                        if (!plusIcon.classList.contains('loading')) {
                           plusIcon.classList.add('loading');
                           newBlankThing();
                        }
                     }}
                     title="New Thing"
                  >
                     <div className="navLine">
                        <span className="navIcon">
                           <X color="lowContrastGrey" className="navNewPost" />
                        </span>
                        <span className="navLabel">New Thing</span>
                     </div>
                  </a>
               </Link>
            )}
            {loggedInUserID && (
               <Link href="/collections">
                  <a
                     onClick={() => setNavSidebarIsOpen(false)}
                     title="Collections"
                  >
                     <div className="navLine">
                        <span className="navIcon">
                           <StackIcon />
                        </span>
                        <span className="navLabel">Collections</span>
                     </div>
                  </a>
               </Link>
            )}
            {loggedInUserID && (
               <Link href="/me">
                  <a onClick={() => setNavSidebarIsOpen(false)} title="Profile">
                     <div className="navLine">
                        <span className="navIcon">
                           <DefaultAvatar />
                        </span>
                        <span className="navLabel">Profile</span>
                     </div>
                  </a>
               </Link>
            )}
            {loggedInUserID && (
               <a
                  onClick={() => {
                     if (!confirm('Are you sure you want to logout?')) return;
                     logout({
                        refetchQueries: [
                           { query: CURRENT_MEMBER_QUERY },
                           { query: ALL_THINGS_QUERY }
                        ]
                     });
                     setNavSidebarIsOpen(false);
                  }}
                  title="Logout"
               >
                  <div className="navLine">
                     <span className="navIcon">
                        <X color="lowContrastGrey" />
                     </span>
                     <span className="navLabel">Logout</span>
                  </div>
               </a>
            )}
         </div>
         <ArrowIcon
            className="desktopHider"
            pointing={desktopIsHidden ? 'right' : 'left'}
            onClick={() => setDesktopIsHidden(!desktopIsHidden)}
         />
      </StyledNavSidebar>
   );
};

export default NavSidebar;
