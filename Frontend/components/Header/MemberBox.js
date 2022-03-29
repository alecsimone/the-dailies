import styled, { ThemeContext } from 'styled-components';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { ModalContext } from '../ModalProvider';
import MemberMenu from './MemberMenu';
import Avatar from '../Avatar';
import DefaultAvatar from '../Icons/DefaultAvatar';
import SignupOrLogin from '../Account/SignupOrLogin';
import useMe from '../Account/useMe';

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
   const {
      memberLoading,
      loggedInUserID,
      memberFields: { rep, displayName, avatar }
   } = useMe('MemberBox', 'rep displayName avatar');
   const { desktopBPWidthRaw } = useContext(ThemeContext);
   const {
      thingsSidebarIsOpen,
      setThingsSidebarIsOpen,
      homepageThingsBarIsOpen,
      setHomepageThingsBarIsOpen,
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
      if (isHome) {
         setHomepageThingsBarIsOpen(!homepageThingsBarIsOpen);
         return;
      }
      // Not entirely sure what this conditional was for. It used to have isHome && as its first part, but we moved that to a separate conditional to allow opening and closing the my things sidebar on the homepage. I'm not sure if there's any reason for it still, but I'm keeping it for posterity.
      // if (!thingsSidebarIsOpen && window.outerWidth > desktopBPWidthRaw) {
      //    return;
      // }
      if (navSidebarIsOpen === true && thingsSidebarIsOpen === false) {
         setNavSidebarIsOpen(false);
      }
      setThingsSidebarIsOpen(!thingsSidebarIsOpen);
   };

   let memberBoxContent;
   if (loggedInUserID) {
      memberBoxContent = (
         <>
            <Link href={{ pathname: '/me' }}>
               <a
                  className={
                     memberMenuOpen ? 'profileLink open' : 'profileLink closed'
                  }
               >
                  [{rep}] {displayName}
               </a>
            </Link>
            <Avatar
               id={loggedInUserID}
               avatar={avatar}
               displayName={displayName}
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
      memberBoxContent = <SignupOrLogin />;
   }

   return (
      <StyledMemberBox className="memberBox">
         {memberBoxContent}
      </StyledMemberBox>
   );
};

MemberBox.propTypes = {};

export default React.memo(MemberBox);
