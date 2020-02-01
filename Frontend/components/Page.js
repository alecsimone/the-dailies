import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import Meta from './Header/Meta';
import Header from './Header/Header';
import MemberProvider from './Account/MemberProvider';
import { setAlpha, setLightness, setSaturation } from '../styles/functions';

const theme = {
   tinyText: '1.25rem',
   smallText: '2rem',
   bigText: '2.5rem',
   smallHead: '4rem',
   bigHead: '5rem',

   black: 'hsla(30, 1%, 5%, 1)',
   mainText: 'hsl(210, 3%, 75%)',
   background: 'hsl(210, 60%, 3%)',

   majorColor: 'hsl(210, 100%, 40%)',
   primaryAccent: 'hsl(120, 100%, 25%)',
   secondaryAccent: 'hsl(42, 79%, 64%)',

   lowContrastGrey: 'hsl(210, 10%, 30%)',
   highContrastGrey: 'hsl(30, 10%, 60%)',

   mobileBPWidth: '800px',
   mobileBPWidthRaw: 800,
   mobileBreakpoint: '@media screen and (min-width: 800px)',

   desktopBPWidth: '1280px',
   desktopBPWidthRaw: 1280,
   desktopBreakpoint: '@media screen and (min-width: 1280px)',

   bigScreenWidth: '1800px',
   bigScreenBreakpoint: '@media screen and (min-width: 1800px)',

   scroll: {
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'hsl(210, 10%, 30%) hsla(345, 25%, 2%, 1)'
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
   }
};

const GlobalStyle = createGlobalStyle`
   html {
      background: ${setLightness(setSaturation(theme.primaryAccent, 75), 3)};
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      box-sizing: border-box;
      font-size: 8px;
      ${theme.scroll};
      ${theme.mobileBreakpoint} {
         font-size: 10px;
      }
      @media screen and (min-width: 1921px) {
         font-size: 12px;
      }
   }
   *, *:before, *:after {
      box-sizing: inherit;
   }
   body {
      padding: 0;
      margin: 0;
      font-size: ${theme.smallText};
      line-height: 1.6;
      font-weight: 400;
   }
   body::-webkit-scrollbar {
      width: .5rem;
      background: ${theme.background};
   }
   body::-webkit-scrollbar-track {
      box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
   }
   body::-webkit-scrollbar-thumb {
      border-radius: 3px;
      box-shadow: inset 0 0 1px rgba(0,0,0,0.5);
      background: ${theme.lowContrastGrey};
   }
   p, .explodingLinkGraph, .embed-container {
      margin: 1.8rem 0;
   }
   a {
      text-decoration: none;
      color: ${theme.mainText};
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
      &:visited {
         color: ${theme.mainText};
      }
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
      font-family: "Proxima Nova", sans-serif;
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
      font-family: "Proxima Nova", sans-serif;
      font-size: ${props => props.theme.smallText};
      &:focus {
         border: 1px solid ${setAlpha(theme.highContrastGrey, 0.4)};
         border-bottom: 1px solid ${theme.highContrastGrey};
         box-shadow: 0 1px 4px ${setAlpha(theme.highContrastGrey, 0.2)};
      }
   }
   select {
      background: none;
      border: 1px solid ${theme.lowContrastGrey};
      border-radius: 3px;
      color: ${theme.mainText};
      padding: .25rem;
      font-size: ${theme.smallText};
      /* These properties control the arrow image */
      /* -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      background-image:  */
      option {
         background: ${theme.background};
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
      font-family: "Proxima Nova", sans-serif;
      cursor: pointer;
      &:hover {
         background: ${setAlpha(theme.lowContrastGrey, 0.1)};
      }
   }
   .embed-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      max-width: 100%;
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
         transform: rotate(360deg);
      }
      to {
         transform: rotate(0deg);
      }
   }
   .tweet {
      margin: 3rem 0;
      ${props => props.theme.desktopBreakpoint} {
         margin: 5rem 1rem;
      }
      &:first-child {
         margin-top: 3rem;
      }
      padding: 0 1.5rem 2rem 1.5rem;
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      border-radius: 0.5rem;
      background: ${props => props.theme.black};
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
      }
      &.retweet {
         .retweeter {
            display: flex;
            align-items: center;
            margin: 0 -1.5rem 1rem -1.5rem;
            padding: 2rem 1rem;
            background: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 30), 0.15)};
            a.retweetLink {
               color: ${props => props.theme.mainText};
               font-weight: 600;
            }
            img.retweetedAvatar {
               border-radius: 50%;
               width: ${props => props.theme.smallHead};
               height: auto;
               margin-right: 1rem;
            }
         }
         .repliedToTweet {
            margin-top: -1rem;
            .tweet {
               border: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
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
      img.embeddedPhoto,
      .embeddedVideo video {
         width: 500px;
         max-width: 100%;
         height: auto;
         margin: 1rem 0;
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
            display: flex;
            align-items: center;
            background: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 30), 0.15)};
            margin: 0;
            padding: 1rem 0;
            border-bottom: none;
            border-radius: 3px 3px 0 0;
         }
         img.quotedTweeterAvatar {
            border-radius: 50%;
            max-width: ${props => props.theme.smallHead};
            height: auto;
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
            img {
               opacity: 1;
               width: ${props => props.theme.smallText};
               ${props => props.theme.desktopBreakpoint} {
                  width: ${props => props.theme.tinyText};
               }
               height: auto;
               margin: 0 1rem 0 0.6rem;
               filter: saturate(0%);
               cursor: pointer;
               transition: filter 0.1s;
               &:hover {
                  filter: saturate(100%);
               }
               &.on {
                  filter: saturate(100%);
                  &:hover {
                     filter: saturate(0%);
                  }
               }
            }
         }
      }
   }
`;

const StyledPage = styled.div`
   position: relative;
   display: grid;
   grid-template-rows: auto 1fr;
   ${props => props.theme.desktopBreakpoint} {
      height: 100vh;
   }
`;

const Page = ({ children }) => (
   <MemberProvider>
      <ThemeProvider theme={theme}>
         <StyledPage id="page">
            <Meta />
            <Header />
            <>
               <GlobalStyle />
               {children}
            </>
         </StyledPage>
      </ThemeProvider>
   </MemberProvider>
);
Page.propTypes = {
   children: PropTypes.node
};
export default Page;
