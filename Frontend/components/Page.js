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

   scroll: {
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'hsl(210, 10%, 30%) hsla(345, 25%, 2%, 1)'
   },
   spin: {
      animationName: 'spin',
      animationDuration: '750ms',
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
      ${props => props.theme.scroll};
      @media screen and (min-width: 800px) {
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
   a {
      text-decoration: none;
      color: ${theme.mainText};
      :visited {
         color: ${theme.mainText};
      }
      :hover {
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
            transform: rotate(-360deg);
         }
      }
`;

const StyledPage = styled.div`
   position: relative;
   display: grid;
   grid-template-rows: auto 1fr;
   @media screen and (min-width: 800px) {
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
