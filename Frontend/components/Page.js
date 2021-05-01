import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
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
import {
   setAlpha,
   setLightness,
   setSaturation,
   midScreenBreakpointPx
} from '../styles/functions';

const theme = {
   tinyText: '1.25rem',
   miniText: '1.7rem',
   smallText: '2.25rem',
   bigText: '2.75rem',
   smallHead: '4rem',
   bigHead: '5rem',

   deepBlack: 'hsl(30, 1%, 1%)',
   midBlack: 'hsl(30, 1%, 4%)',
   lightBlack: 'hsl(210, 20%, 8%)',

   mainText: 'hsl(210, 3%, 90%)',
   lowContrastGrey: 'hsl(210, 10%, 30%)',
   highContrastGrey: 'hsl(30, 10%, 60%)',

   majorColor: 'hsl(210, 100%, 40%)',
   primaryAccent: 'hsl(120, 100%, 25%)',
   secondaryAccent: 'hsl(42, 79%, 64%)',
   warning: 'hsl(0, 75%, 50%)',

   mobileBPWidth: '600px',
   mobileBPWidthRaw: 600,
   mobileBreakpoint: '@media screen and (min-width: 600px)',

   desktopBPWidth: '1100px',
   desktopBPWidthRaw: 1100,
   desktopBreakpoint: '@media screen and (min-width: 1100px)',

   midScreenBPWidth: `${midScreenBreakpointPx}px`,
   midScreenBPWidthRaw: midScreenBreakpointPx,
   midScreenBreakpoint: `@media screen and (min-width: ${midScreenBreakpointPx}px)`,

   bigScreenBPWidth: '1800px',
   bigScreenBPWidthRaw: 1800,
   bigScreenBreakpoint: '@media screen and (min-width: 1800px)',

   massiveScreenBPWidth: '1921px',
   massiveScreenBPWidthRaw: 1921,
   massiveScreenBreakpoint: '@media screen and (min-width: 1921px)',

   tweetHead: 'hsl(30, 15%, 2.5%)',

   scroll: {
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'hsl(210, 10%, 30%) hsl(30, 1%, 4%)'
   },
   spin: {
      animationName: 'spin',
      animationDuration: '1000ms',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
   },
   spinBackward: {
      animationName: 'spinBackward',
      animationDuration: '1000ms',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
   },
   twist: {
      animationName: 'twist',
      animationDuration: '1000ms',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
   }
};

const GlobalStyle = createGlobalStyle`
   html {
      background: ${setLightness(setSaturation(theme.majorColor, 90), 11)};
      /* background: ${setLightness(theme.primaryAccent, 3)}; */
      color: ${theme.mainText};
      font-family: "proxima-nova", sans-serif;
      box-sizing: border-box;
      font-size: 8px;
      ${theme.scroll};
      ${props => props.theme.bigScreenBreakpoint} {
         font-size: 10px;
      }
      ${props => props.theme.massiveScreenBreakpoint} {
         font-size: 12px;
      }
      height: 100%;
      height: -moz-available;
      height: -webkit-fill-available;
      --header-height: calc(6.6rem + 3px); // On mobile, the header has a .5rem padding on both top and bottom and a 3px border. It gets its height from the MemberBox, which has a height of 2.25rem * 1.6 (2.25rem font size at 1.6 line height), and a 1rem margin on either side. So that's 2.25 * 1.6 + 1 * 2 + 0.5 * 2 = 6.6 rem, + 3px for the border
      --bottombar-height: calc(6.25rem + 6px); // The bottom bar has 1.75rem of padding on the top and bottom around icons that have a height of 2.75rem, and a 2px border on top. Even though the line height is 1 everywhere, the svgs within the bottom bar are getting an extra 4px added onto them, so we added that too.
      ${props => props.theme.mobileBreakpoint} {
         --header-height: calc(7rem + 3px); // On bigger screens, the header's padding and border are still 0.5rem * 2 and 3px respectively, but it gets its height from the search box, which has a height of 4 rem and a margin of 1rem on either side. Thus the contents are 6rem, the margin is 1 rem, and the border is 3px for a total of 7rem + 3px;
      }
   }
   *, *:before, *:after {
      box-sizing: inherit;
   }
   body {
      min-height: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      font-size: ${theme.smallText};
      line-height: 1.6;
      font-weight: 300;
   }
   #__next {
      min-height: 100%;
      height: 100%;
   }
   *::-webkit-scrollbar {
      width: .5rem;
      background: ${theme.midBlack};
   }
   *::-webkit-scrollbar-track {
      box-shadow: inset 0 0 1px ${theme.deepBlack};
   }
   *::-webkit-scrollbar-thumb {
      border-radius: 3px;
      box-shadow: inset 0 0 1px ${theme.deepBlack};
      background: ${theme.lowContrastGrey};
   }
   p, .explodingLinkGraph, .embed-container {
      margin: 1.8rem 0;
   }
   a, a:visited {
      text-decoration: none;
      color: ${setLightness(theme.majorColor, 75)};
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
      &:hover {
         text-decoration: underline;
      }
   }
   fieldset {
      border: none;
   }
   input {
      background: none;
      color: ${theme.mainText};
      font-family: "proxima-nova", sans-serif;
      border-radius: 3px;
      border: none;
      border-bottom: 1px solid ${theme.lowContrastGrey};
      padding: .25rem 1rem;
      &:disabled {
         background: ${theme.veryLowContrastGrey};
      }
   }
   textarea {
      background: none;
      color: ${theme.mainText};
      border: 1px solid ${setAlpha(theme.lowContrastGrey, 0.25)};
      border-radius: 3px;
      border-bottom: 1px solid ${theme.lowContrastGrey};
      padding: 1rem 1rem calc(1rem - 1px) 1rem;
      line-height: 1.6;
      font-family: "proxima-nova", sans-serif;
      font-size: ${props => props.theme.smallText};
      font-weight: 300;
      &:focus {
         border: 1px solid ${setAlpha(theme.highContrastGrey, 0.4)};
         border-bottom: 1px solid ${theme.highContrastGrey};
         box-shadow: 0 1px 4px ${setAlpha(theme.highContrastGrey, 0.2)};
      }
   }
   select {
      border: 1px solid ${theme.lowContrastGrey};
      border-radius: 3px;
      color: ${theme.mainText};
      padding: .25rem;
      font-size: ${theme.smallText};
      appearance: none;
      /* The background value is a uri encoded version of Dropdown.svg, with the theme value interpolated and encoded as well  */
      background: url(${props =>
         `data:image/svg+xml;charset=UTF-8,%3Csvg%20id%3D%22ac8a07ef-417f-4921-8ef8-8b93f553bed2%22%20data-name%3D%22Layer%201%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20x%3D%2270.35%22%20y%3D%2267.57%22%20width%3D%2218%22%20height%3D%2276.37%22%20transform%3D%22translate%28-51.54%2087.08%29%20rotate%28-45%29%22%20fill%3D%22${encodeURIComponent(
            theme.lowContrastGrey
         )
            .replace('(', '%28')
            .replace(
               ')',
               '%29'
            )}%22%2F%3E%3Crect%20x%3D%22111.63%22%20y%3D%2267.57%22%20width%3D%2218%22%20height%3D%2276.37%22%20transform%3D%22translate%28131.15%20265.82%29%20rotate%28-135%29%22%20fill%3D%22${encodeURIComponent(
            theme.lowContrastGrey
         )
            .replace('(', '%28')
            .replace(')', '%29')}%22%2F%3E%3C%2Fsvg%3E`})
         no-repeat right;
      option {
         background: ${theme.deepBlack};
         &:focus {
            background: red;
         }
      }
   }
   button {
      background: none;
      border: 1px solid ${theme.highContrastGrey};
      border-radius: 3px;
      color: ${theme.mainText};
      font-family: "proxima-nova", sans-serif;
      cursor: pointer;
      &:hover {
         background: ${setAlpha(theme.lowContrastGrey, 0.3)};
      }
   }
   blockquote {
      margin: 0;
      display: block;
      font-style: italic;
      opacity: 0.9;
      background: ${setAlpha(setSaturation(theme.majorColor, 25), 0.15)};
      padding: 2rem;
      border-radius: 3px;
      border: 2px solid ${setAlpha(theme.lowContrastGrey, 0.2)};
      border-left: 0.4rem solid ${setSaturation(theme.majorColor, 40)};
   }
   svg.resetIcon {
      transition: transform 0.25s ease-in-out;
      &:hover {
         transform: rotate(-30deg);
      }
   }
   .embed-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      max-width: 100%;
      &.tiktok {
         padding-bottom: 240%;
         ${props => props.theme.mobileBreakpoint} {
            padding-bottom: 100%;
         }
      }
      &.instagram {
         padding-bottom: 200%;
         ${props => props.theme.mobileBreakpoint} {
            padding-bottom: 150%;
         }
      }
      iframe {
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
      }
   }
   @keyframes spin {
      from {
         transform: rotate(0deg);
      }
      to {
         transform: rotate(360deg);
      }
   }
   @keyframes spinBackward {
      from {
         transform: rotate(330deg);
      }
      to {
         transform: rotate(-30deg);
      }
   }
   @keyframes twist {
      from {
         transform: rotateY(360deg);
      }
      to {
         transform: rotateY(0deg);
      }
   }
   section.threeColumns {
      position: fixed;
      /* top: var(--header-height);
      bottom: var(--bottombar-height); */
      padding-top: var(--header-height);
      padding-bottom: var(--bottombar-height);
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      ${props => props.theme.mobileBreakpoint} {
         /* bottom: 0; */
         padding-bottom: 0;
      }
      overflow-x: hidden;
      .navSidebar {
         display: block;
         position: fixed;
         margin: 0;
         overflow: hidden;
         width: 100%;
         height: calc(100% - 13.5rem - 3px); /* 6.75rem is the height of each of the header and bottom bar. The header has a 1px border, the bottom bar 2px */
         top: calc(6.75rem + 1px);
         z-index: 99;
         ${props => props.theme.scroll};
         transition: transform .25s;
         &.visible {
            transform: translateX(0%);
         }
         &.hidden {
            transform: translateX(-100%);
         }
         ${props => props.theme.mobileBreakpoint} {
            width: 10%;
         }
         ${props => props.theme.midScreenBreakpoint} {
            width: 20%;
         }
      }
      .mainSection {
         height: 100%;
         z-index: 1;
         ${props => props.theme.scroll};
      }
      ${props => props.theme.desktopBreakpoint} {
         display: flex;
         ${props => props.theme.scroll};
         max-height: 100%;
         max-width: 100vw;
         .navSidebar {
            position: relative;
            top: 0;
            height: 100%;
            max-width: 400px;
            max-height: 100%;
            &.visible, &.hidden {
               transform: none;
            }
            ${props => props.theme.midScreenBreakpoint} {
               min-width: 320px;
            }
         }
         .mainSection {
            padding: 0;
            flex-grow: 1;
            max-height: 100%;
            overflow: hidden;
            ${props => props.theme.scroll};
         }
      }
      .myThingsBar {
         display: block;
         position: fixed;
         margin: 0;
         overflow: hidden;
         width: 100%;
         height: calc(100% - 13.5rem - 3px); /* 6.75rem is the height of each of the header and bottom bar. The header has a 1px border, the bottom bar 2px */
         top: calc(6.75rem + 1px);
         right: 0;
         z-index: 99;
         ${props => props.theme.scroll};
         background: ${props => props.theme.midBlack};
         transition: all .25s;
         p.emptyThings {
            padding: 0 2rem;
         }
         &.visible {
            transform: translateX(0%);
         }
         &.hidden, &.default {
            transform: translateX(100%);
         }
         .list .regularThingCard {
            margin: 0;
         }
         ${props => props.theme.desktopBreakpoint} {
            position: absolute;
            width: 25%;
            top: 0;
            height: 100%;
            max-width: 512px;
            max-height: 100%;
            &.visible, &.default {
               transform: none;
               /* max-width: 512px; */
            }
            &.hidden {
               width: 0;
               flex-shrink: 1;
               /* max-width: 0; */
            }
         }
      }
   }
   .styleGuideLink {
      opacity: 0.7;
      display: inline-block;
      font-size: ${props => props.theme.tinyText};
   }
   .Toastify__toast-container.dailiesStyle {
      .Toastify__toast {
         background: ${props => props.theme.deepBlack};
         border: 2px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
         border-radius: 3px;
      }
      .Toastify__toast-body {
         color: ${props => props.theme.mainText};
         padding: 1rem 3rem;
      }
      .Toastify__progress-bar {
         background: ${props => props.theme.majorColor};
      }
   }
   .tweetHead {
         display: flex;
         align-items: center;
         background: ${props => props.theme.deepBlack};
         padding: 1rem 0rem;
         border-bottom: 1px solid
               ${props => setLightness(props.theme.lowContrastGrey, 15)};
      }
   .tweet {
      margin: 3rem 0;
      white-space: pre-wrap;
      &.threaded {
         margin: 0;
         border-radius: 0;
         padding-top: 1rem;
         &.threadStarter {
            margin-top: 3rem;
            border-radius: 3px 3px 0 0;
         }
         &.threadEnder {
            border-radius: 0 0 3px 3px;
            &:last-child {
                  margin-bottom: 3rem;
               }
         }
      }
      ${props => props.theme.mobileBreakpoint} {
         margin: 5rem 1rem;
         &.threaded {
            margin: 0 1rem;
            &.threadStarter {
               margin-top: 5rem;
               &:first-child {
                  margin-top: 3rem;
               }
            }
         }
      }
      &:first-child {
         margin-top: 3rem;
      }
      padding: 0 1.5rem 2rem;
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      border-radius: 3px;
      background: ${props => props.theme.midBlack};
      .repliedToTweet {
         margin-top: 0;
         .quoteTweetContainer {
            border-top: none;
            margin-top: 0;
            border-radius: 0;
            .repliedToTweet .quoteTweetContainer {
               border-radius: 3px;
               border-top: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
            }
         }
         .tweet {
            margin-top: 0;
            margin-bottom: 0;
         }
      }
      p {
         overflow-wrap: break-word;
         word-wrap: break-word;
      }
      &.retweet {
         .retweeter {
            margin: 0 -1.5rem 1rem -1.5rem;
            border-radius: 3px 3px 0 0;
            a.retweetLink {
               color: ${props => props.theme.mainText};
               font-weight: 600;
            }
            img.retweetedAvatar {
               border-radius: 50%;
               width: ${props => props.theme.smallHead};
               height: auto;
               margin: 0 1rem;
            }
         }
         .repliedToTweet {
            margin-top: -1rem;
            .tweet {
               border: 1px solid
                  /* ${props => setAlpha(props.theme.lowContrastGrey, 0.5)}; */
               border-top: none;
            }
         }
         .tweet {
            padding: 0;
            border: 0;
            margin: 0;
         }
      }
      a,
      a:visited {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
         &:hover {
            color: ${props => props.theme.majorColor};
         }
      }
      .quoteTweetContainer {
         border: 1px solid ${props =>
            setAlpha(props.theme.lowContrastGrey, 0.5)};
         border-radius: 3px;
         margin: 2rem 0;
         .tweet {
            margin: 0;
            padding: 1rem;
            box-sizing: border-box;
            border: none;
         }
         h5 {
            a,
            a:visited {
               color: ${props => props.theme.mainText};
            }
            margin: 0;
            border-radius: 3px 3px 0 0;
         }
         img.quotedTweeterAvatar {
            border-radius: 50%;
            max-width: ${props => props.theme.smallHead};
            height: ${props => props.theme.smallHead};
            overflow: hidden;
            margin: 0 1rem;
         }
         article {
            margin-top: 0;
            border-top: none;
            border-radius: 0 0 3px 3px;
            p:first-of-type {
               margin-top: 0;
               padding-top: 2rem;
            }
            .replyInfo {
               margin-top: 0;
               padding-top: 2rem;
            }
         }
      }
      img.embeddedPhoto,
         .embeddedVideo video {
            width: 100%;
            height: auto;
            margin: 1rem 0;
         }
      img {
         max-width: 100%;
      }
      .tweetMeta {
         margin-top: 1rem;
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
         font-size: ${props => props.theme.smallText};
         ${props => props.theme.desktopBreakpoint} {
            font-size: ${props => props.theme.tinyText};
         }
         display: flex;
         align-items: center;
         justify-content: space-between;
         opacity: 0.8;
         a {
            cursor: pointer;
         }
         a.linkToOriginalTweet {
            color: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
            &:hover {
               color: ${props => props.theme.majorColor};
            }
         }
         .score {
            display: inline-flex;
            align-items: center;
            span {
               cursor: pointer;
               display: flex;
               align-items: center;
            }
            svg, img {
               opacity: 1;
               width: ${props => props.theme.smallText};
               ${props => props.theme.desktopBreakpoint} {
                  width: ${props => props.theme.tinyText};
               }
               height: auto;
               margin: 0 1rem 0 0.6rem;
               cursor: pointer;
               &.heartIcon {
                  fill: none;
                  stroke: ${props => props.theme.lowContrastGrey};
                  stroke-width: 3px;
                  &:hover {
                     /* fill: ${props => props.theme.warning}; */
                     stroke: ${props => props.theme.warning};
                  }
                  &.on {
                     fill: ${props => props.theme.warning};
                     stroke: ${props => props.theme.warning};
                     &:hover {
                        fill: ${props => props.theme.lowContrastGrey};;
                        stroke: ${props => props.theme.lowContrastGrey};
                     }
                  }
               }
            }
         }
      }
   }
`;

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
                  </>
                  <BottomBar />
               </StyledPage>
               <ToastContainer className="dailiesStyle" />
            </ModalProvider>
         </ThemeProvider>
      </MemberProvider>
   );
};
Page.propTypes = {
   children: PropTypes.node
};
export default Page;
