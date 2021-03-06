import styled, { ThemeContext } from 'styled-components';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { MemberContext } from '../Account/MemberProvider';
import { ModalContext } from '../ModalProvider';
import MemberMenu from './MemberMenu';
import Login from '../Account/Login';
import Signup from '../Account/Signup';
import { setAlpha } from '../../styles/functions';
import Avatar from '../Avatar';
import DefaultAvatar from '../Icons/DefaultAvatar';

const StyledMemberBox = styled.div`
   color: ${props => props.theme.secondaryAccent};
   display: inline-flex;
   align-items: center;
   font-size: ${props => props.theme.smallText};
   font-weight: 600;
   position: relative;
   z-index: 3;
   p {
      margin: 0.5rem;
   }
   a,
   a:visited {
      color: ${props => props.theme.secondaryAccent};
      margin: 1rem;
      cursor: pointer;
      z-index: 3;
   }
   img,
   svg {
      z-index: 3;
      width: ${props => props.theme.smallHead};
      height: ${props => props.theme.smallHead};
      object-fit: cover;
      border-radius: 50%;
      margin-left: 1rem;
      cursor: pointer;
   }
`;

const MemberBox = () => {
   const { me, loading: memberLoading } = useContext(MemberContext);
   const { mobileBPWidthRaw } = useContext(ThemeContext);
   const {
      setContent,
      thingsSidebarIsOpen,
      setThingsSidebarIsOpen,
      navSidebarIsOpen,
      setNavSidebarIsOpen,
      isHome
   } = useContext(ModalContext);
   const [memberMenuOpen, setMemberMenuOpen] = useState(false);

   const escapeDetector = e => {
      if (e.which === 27) {
         setMemberMenuOpen(false);
         window.removeEventListener('click', escapeDetector);
      }
   };

   const clickOutsideDetector = e => {
      if (
         !e.target.classList.contains('MemberMenu') &&
         e.target.id !== 'avatar' &&
         e.target.closest('#avatar') == null &&
         e.target.closest('#broadcastToggle') == null
      ) {
         setMemberMenuOpen(false);
         window.removeEventListener('click', clickOutsideDetector);
      }
   };

   const toggleThingsSidebar = e => {
      e.preventDefault();
      if (
         isHome &&
         !thingsSidebarIsOpen &&
         window.outerWidth > mobileBPWidthRaw
      )
         return;
      if (navSidebarIsOpen === true && thingsSidebarIsOpen === false) {
         setNavSidebarIsOpen(false);
      }
      setThingsSidebarIsOpen(!thingsSidebarIsOpen);
   };

   let memberBoxContent;
   if (me) {
      memberBoxContent = (
         <>
            <Link href={{ pathname: '/me' }}>
               <a
                  className={
                     memberMenuOpen ? 'profileLink open' : 'profileLink closed'
                  }
               >
                  [{me.rep}] {me.displayName}
               </a>
            </Link>
            <Avatar
               id={me.id}
               avatar={me.avatar}
               displayName={me.displayName}
               alt="avatar"
               htmlid="avatar"
               onClick={e => toggleThingsSidebar(e)}
               doesNotLink
            />
            {memberMenuOpen && <MemberMenu />}
         </>
      );
   } else if (memberLoading) {
      memberBoxContent = (
         <>
            <a>Logging in...</a>
            <DefaultAvatar id="avatar" />
         </>
      );
   } else {
      memberBoxContent = (
         <>
            <p>
               <Link href={{ pathname: '/signup' }}>
                  <a
                     onClick={e => {
                        e.preventDefault();
                        setContent(<Signup />);
                     }}
                  >
                     Sign up
                  </a>
               </Link>{' '}
               or{' '}
               <Link href={{ pathname: '/login' }}>
                  <a
                     onClick={e => {
                        e.preventDefault();
                        setContent(<Login redirect={false} />);
                     }}
                  >
                     Log in
                  </a>
               </Link>
            </p>
         </>
      );
   }

   return (
      <StyledMemberBox className="memberBox">
         {memberBoxContent}
      </StyledMemberBox>
   );
};

MemberBox.propTypes = {};

export default React.memo(MemberBox);
