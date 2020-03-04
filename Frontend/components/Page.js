import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import Meta from './Header/Meta';
import Header from './Header/Header';
import BottomBar from './BottomBar';
import MemberProvider from './Account/MemberProvider';
import { setAlpha, setLightness, setSaturation } from '../styles/functions';

const theme = {
   tinyText: '1.25rem',
   miniText: '1.7rem',
   smallText: '2rem',
   bigText: '2.5rem',
   smallHead: '4rem',
   bigHead: '5rem',

   deepBlack: 'hsl(30, 1%, 1%)',
   midBlack: 'hsl(30, 1%, 4%)',
   lightBlack: 'hsl(210, 20%, 8%)',

   mainText: 'hsl(210, 3%, 80%)',
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

   midScreenBPWidth: '1440px',
   midScreenBPWidthRaw: 1440,
   midScreenBreakpoint: '@media screen and (min-width: 1440px)',

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
      background: ${setLightness(setSaturation(theme.majorColor, 90), 9)};
      /* background: ${setLightness(theme.primaryAccent, 3)}; */
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      box-sizing: border-box;
      font-size: 8px;
      ${theme.scroll};
      ${props => props.theme.bigScreenBreakpoint} {
         font-size: 10px;
      }
      ${props => props.theme.massiveScreenBreakpoint} {
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
      font-family: "Proxima Nova", sans-serif;
      cursor: pointer;
      &:hover {
         background: ${setAlpha(theme.lowContrastGrey, 0.1)};
      }
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
      &.threaded {
         margin: 0;
         border-radius: 0;
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
      padding: 0 1.5rem 2rem 1.5rem;
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
   display: grid;
   grid-template-rows: auto 1fr auto;
   height: 100vh;
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
            <BottomBar />
         </StyledPage>
      </ThemeProvider>
   </MemberProvider>
);
Page.propTypes = {
   children: PropTypes.node
};
export default Page;
