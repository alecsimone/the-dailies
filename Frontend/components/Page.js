import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Meta from './Meta';
import Header from './Header';
import MemberProvider from './MemberProvider';

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
   secondaryAccent40: 'hsla(42, 79%, 80%, .4)',
   secondaryAccentGlow: 'hsl(42, 100%, 100%, .1)',
   highContrastSecondaryAccent: 'hsla(42, 95%, 75%, .9)',

   lowContrastGrey: 'hsl(30, 10%, 33%)',
   veryLowContrastGrey: 'hsla(30, 10%, 33%, .5)',

   lowContrastCoolGrey: 'hsla(210, 15%, 48%, .6)',
   solidLowContrastCoolGrey: 'hsl(210, 25%, 25%)',
   veryLowContrastCoolGrey: 'hsla(210, 15%, 48%, .1)',
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
      background: ${theme.veryLowContrastCoolGrey};
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
      border: none;
      border-radius: 3px;
      border-bottom: 1px solid ${theme.highContrastGrey};
      box-sizing: border-box;
      padding: 1rem 1rem calc(1rem - 1px) 1rem;
      font-family: "Proxima Nova", sans-serif;
      &:focus {
         border: 1px solid ${theme.lowContrastGrey};
         border-bottom: 1px solid ${theme.highContrastGrey};
         padding: calc(1rem - 1px) calc(1rem - 1px) calc(1rem - 1px) calc(1rem - 1px);
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
         background: ${theme.veryLowContrastCoolGrey};
      }
   }
`;

const StyledPage = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 94%;
   }
   margin: 2rem auto;
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
