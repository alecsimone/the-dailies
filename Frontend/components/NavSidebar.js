import gql from 'graphql-tag';
import styled from 'styled-components';
import Link from 'next/link';
import Router from 'next/router';
import { useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { NEW_BLANK_THING } from '../pages/new';
import { setAlpha } from '../styles/functions';
import Home from './Icons/Home';
import SidebarHeaderIcon from './Icons/SidebarHeaderIcon';
import Search from './Icons/Search';
import X from './Icons/X';
import DefaultAvatar from './Icons/DefaultAvatar';
import { ModalContext } from './ModalProvider';
import { ALL_THINGS_QUERY } from '../pages/index';
import { PUBLIC_THINGS_QUERY } from './Archives/PublicThings';
import { CURRENT_MEMBER_QUERY } from './Account/MemberProvider';

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
      refetchQueries: [
         { query: ALL_THINGS_QUERY },
         { query: PUBLIC_THINGS_QUERY }
      ]
   });
   const { navSidebarIsOpen, setNavSidebarIsOpen } = useContext(ModalContext);

   const [logout] = useMutation(LOGOUT_MUTATION);
   return (
      <StyledNavSidebar
         className={
            navSidebarIsOpen ? 'navSidebar visible' : 'navSidebar hidden'
         }
      >
         <div className="container">
            <Link href="/">
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <Home />
                     </span>
                     <span className="navLabel">Home</span>
                  </div>
               </a>
            </Link>
            <Link href="/me">
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <SidebarHeaderIcon icon="You" className="wide" />
                     </span>
                     <span className="navLabel">My Things</span>
                  </div>
               </a>
            </Link>
            <Link
               href={{
                  pathname: '/me',
                  query: { stuff: 'Friends' }
               }}
            >
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <SidebarHeaderIcon icon="Friends" className="wide" />
                     </span>
                     <span className="navLabel">Friends</span>
                  </div>
               </a>
            </Link>
            <Link href="/search">
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <Search />
                     </span>
                     <span className="navLabel">Search</span>
                  </div>
               </a>
            </Link>
            <Link href="/twitter">
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <SidebarHeaderIcon icon="Tweets" className="wide" />
                     </span>
                     <span className="navLabel">Twitter</span>
                  </div>
               </a>
            </Link>
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
               >
                  <div className="navLine">
                     <span className="navIcon">
                        <X color="lowContrastGrey" className="navNewPost" />
                     </span>
                     <span className="navLabel">New Thing</span>
                  </div>
               </a>
            </Link>
            <Link href="/me">
               <a onClick={() => setNavSidebarIsOpen(false)}>
                  <div className="navLine">
                     <span className="navIcon">
                        <DefaultAvatar />
                     </span>
                     <span className="navLabel">Profile</span>
                  </div>
               </a>
            </Link>
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
            >
               <div className="navLine">
                  <span className="navIcon">
                     <X color="lowContrastGrey" />
                  </span>
                  <span className="navLabel">Logout</span>
               </div>
            </a>
         </div>
      </StyledNavSidebar>
   );
};

export default NavSidebar;
