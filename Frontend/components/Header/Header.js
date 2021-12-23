import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import React, { useState } from 'react';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import NavButtons from './NavButtons';
import NotificationsIcon from './NotificationsIcon';
import { setLightness } from '../../styles/functions';
import useMe from '../Account/useMe';

Router.events.on('routeChangeStart', target => {
   // If we're routing to the same thing, we need to use Router.push so the browser back button will work properly in broadcast view, but we don't want to fire NProgress.start
   if (window.location.pathname === '/thing' && target.startsWith('/thing')) {
      const targetIDIndex = target.indexOf('id=') + 3;
      const locationIDIndex = window.location.search.indexOf('id=') + 3;
      if (targetIDIndex > -1 && locationIDIndex > -1) {
         const targetAmpersandIndex = target.indexOf('&');
         const targetIDStopIndex =
            targetAmpersandIndex > -1 ? targetAmpersandIndex : target.length;
         const targetID = target.substring(targetIDIndex, targetIDStopIndex);

         const locationAmpersandIndex = window.location.search.indexOf('&');
         const locationIDStopIndex =
            locationAmpersandIndex > -1
               ? locationAmpersandIndex
               : window.location.search.length;
         const locationID = window.location.search.substring(
            locationIDIndex,
            locationIDStopIndex
         );
         if (targetID === locationID) {
            return;
         }
      }
   }
   NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const StyledHeader = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   z-index: 9;
   border-bottom: 3px solid
      ${props => setLightness(props.theme.lowContrastGrey, 10)};
   background: ${props => props.theme.midBlack};
   padding: 0.5rem 0;
   .headerContents {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      .navButtons {
         display: none;
      }
      ${props => props.theme.mobileBreakpoint} {
         padding: 0 2rem;
         grid-template-columns: 1fr auto 1fr;
         &.showSearch {
            grid-template-columns: 1fr;
            .memberColumn,
            .logoBox {
               display: none;
            }
            ${props => props.theme.desktopBreakpoint} {
               grid-template-columns: 1fr auto 1fr;
               .memberColumn {
                  display: flex;
               }
               .logoBox {
                  display: flex;
               }
            }
         }
         .navButtons {
            display: flex;
         }
      }
      padding: 0 2rem;
      margin: auto;
      .memberColumn {
         display: flex;
         align-items: center;
         justify-content: flex-end;
      }
   }
`;

const Header = ({ pageProps }) => {
   const [showSearch, setShowSearch] = useState(false);
   const { loggedInUserID } = useMe();

   let search;
   if (pageProps != null && pageProps?.query?.s != null) {
      search = pageProps.query.s;
   }

   return (
      <StyledHeader id="header">
         <div className={`headerContents${showSearch ? ' showSearch' : ''}`}>
            <NavButtons
               showSearch={showSearch}
               setShowSearch={setShowSearch}
               search={search}
            />
            <LogoBox />
            <div className="memberColumn">
               {loggedInUserID && <NotificationsIcon />}
               <MemberBox />
            </div>
         </div>
      </StyledHeader>
   );
};
Header.propTypes = {};

export default React.memo(Header);
