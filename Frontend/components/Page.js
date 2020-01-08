import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Meta from './Header/Meta';
import Header from './Header/Header';
import Sidebar from './Sidebar';
import MemberProvider from './Account/MemberProvider';
import { setAlpha } from '../styles/functions';

const theme = {
   tinyText: '1.25rem',
   smallText: '2rem',
   bigText: '2.5rem',
   smallHead: '4rem',
   bigHead: '5rem',

   background: 'hsl(216, 24%, 5%)',
   mainText: 'hsla(33, 17%, 88%, .9)',
   solidMainText: 'hsl(33, 17%, 88%)',

   majorColor: 'hsl(210, 100%, 40%)',
   lightMajorColor: 'hsla(210, 100%, 70%, .9)',
   majorColorGlass: 'hsla(210, 100%, 60%, .15)',

   primaryAccent: 'hsl(120, 100%, 25%)',

   secondaryAccent: 'hsl(42, 79%, 64%)',
   secondaryAccentGlow: 'hsl(42, 100%, 100%, .1)',
   highContrastSecondaryAccent: 'hsla(42, 95%, 75%, .9)',

   lowContrastGrey: 'hsl(30, 10%, 33%)',

   lowContrastCoolGrey: 'hsla(210, 15%, 48%, .6)',
   solidLowContrastCoolGrey: 'hsl(210, 25%, 25%)',
   superLowContrastCoolTint: 'hsla(210, 40%, 40%, 0.07)',

   highContrastGrey: 'hsla(28, 9%, 64%, .9)'
};

const GlobalStyle = createGlobalStyle`
   html {
      background: ${theme.background};
      color: ${theme.mainText};
      font-family: "Proxima Nova", sans-serif;
      box-sizing: border-box;
      font-size: 8px;
      scrollbar-color: #262626 black;
      scrollbar-width: thin;
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
      font-weight: 400;
   }
   body::-webkit-scrollbar {
      width: .5rem;
      background: ${theme.background};
   }
   body::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
   }
   body::-webkit-scrollbar-thumb {
      border-radius: 3px;
      -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.5);
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
      border-bottom: 1px solid ${theme.highContrastGrey};
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
         background: ${setAlpha(theme.lowContrastCoolGrey, 0.1)};
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
`;

const StyledPage = styled.div`
   position: relative;
   display: grid;
   grid-template-rows: auto 1fr;
   height: 100vh;
`;

const Page = props => (
   <MemberProvider>
      <ThemeProvider theme={theme}>
         <StyledPage id="page">
            <Meta />
            <Header />
            <>
               <GlobalStyle />
               {props.children}
            </>
         </StyledPage>
      </ThemeProvider>
   </MemberProvider>
);
export default Page;
