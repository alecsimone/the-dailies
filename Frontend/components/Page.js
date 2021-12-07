import styled, { ThemeProvider } from 'styled-components';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Meta from './Header/Meta';
import Header from './Header/Header';
import BottomBar from './BottomBar';
import MemberProvider from './Account/MemberProvider';
import ModalProvider from './ModalProvider';
import Modal from './Modal';
import HeartPopUp from './HeartPopUp';
import NavSidebar from './NavSidebar';
import MyThings from './Archives/MyThings';
import ThingsSubscriptionManager from '../stuffStore/ThingsSubscriptionManager';
import GlobalStyle, { theme } from '../styles/globalStyle';
import StickifierHost from '../Stickifier/StickifierHost';

const StyledPage = styled.div`
   position: relative;
   height: 100%;
   min-height: 100%;
`;

const Page = ({ children, pageProps }) => {
   const router = useRouter();
   const isHome = router.pathname === '/'; // We use this to disable SSR on the homepage so that our https redirect will work
   const [navSidebarIsOpen, setNavSidebarIsOpen] = useState(false);
   const [thingsSidebarIsOpen, setThingsSidebarIsOpen] = useState(false);
   const [viewportHeight, setViewportHeight] = useState(0);

   // We're going to use the experimental visualViewport property to try to deal with the collapsing address bars on mobile browsers
   const adjustViewport = () => {
      // The idea is to create a custom css property that is equivalent to the vh unit, but that we set ourselves based on the visualViewport height
      const vh = window.visualViewport.height * 0.01;
      if (vh !== viewportHeight) {
         document.documentElement.style.setProperty('--vh', `${vh}px`);
         setViewportHeight(vh);
      }
   };

   // This effect will implement that custom vh property by putting listeners on touchmove and resize to update the vh property
   useEffect(() => {
      if (!process.browser) return; // We don't want to do anything if we're not in a browser though
      if (window.visualViewport == null) return; // And because the property is still experimental, a lot of browsers won't support it and we need to make sure they do before using it

      const vh = window.visualViewport.height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      window.addEventListener('touchmove', adjustViewport);
      window.addEventListener('resize', adjustViewport);
      window.visualViewport.addEventListener('resize', adjustViewport);
   }, [adjustViewport]);

   // Little tool to block the initial render so we can profile it
   // const [initialRenderBlock, setInitialRenderBlock] = useState(true);
   // if (initialRenderBlock) {
   //    return (
   //       <button onClick={() => setInitialRenderBlock(false)}>Unblock</button>
   //    );
   // }

   return (
      <MemberProvider isHome={isHome}>
         <ThemeProvider theme={theme}>
            <ModalProvider
               thingsSidebarIsOpen={thingsSidebarIsOpen}
               setThingsSidebarIsOpen={setThingsSidebarIsOpen}
               navSidebarIsOpen={navSidebarIsOpen}
               setNavSidebarIsOpen={setNavSidebarIsOpen}
               isHome={isHome}
            >
               <StyledPage id="page">
                  <Meta />
                  <Header pageProps={pageProps} />
                  <>
                     <GlobalStyle />
                     <section className="threeColumns">
                        <NavSidebar />
                        <div className="mainSection">{children}</div>
                        <div
                           className={
                              thingsSidebarIsOpen
                                 ? 'myThingsBar visible'
                                 : 'myThingsBar hidden'
                           }
                        >
                           <MyThings
                              setShowingSidebar={setThingsSidebarIsOpen}
                              scrollingSelector=".myThingsBar"
                              borderSide="left"
                           />
                        </div>
                     </section>
                     <Modal />
                     <HeartPopUp />
                     <ThingsSubscriptionManager />
                  </>
                  <BottomBar />
               </StyledPage>
               <ToastContainer className="dailiesStyle" />
               <StickifierHost />
            </ModalProvider>
         </ThemeProvider>
      </MemberProvider>
   );
};
Page.propTypes = {
   children: PropTypes.node
};
export default Page;
