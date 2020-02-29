import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from './functions';

const StyledPageWithSidebar = styled.section`
   display: flex;
   flex-wrap: wrap;
   ${props => props.theme.scroll};
   ${props => props.theme.mobileBreakpoint} {
      flex-wrap: nowrap;
      overflow: hidden;
   }
   align-content: flex-start;
   max-height: 100%;
   .sidebar {
      flex-basis: 100%;
      ${props => props.theme.mobileBreakpoint} {
         flex-basis: 40%;
         max-height: 100%;
         overflow: hidden;
         ${props => props.theme.scroll};
      }
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 30%;
      }
      ${props => props.theme.midScreenBreakpoint} {
         flex-basis: 25%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 20%;
      }
   }
   .mainSection {
      flex-basis: 100%;
      max-width: 100%;
      padding: 2rem 0;
      &.thing {
         padding: 0;
      }
      ${props => props.theme.mobileBreakpoint} {
         padding: 2rem 0;
         flex-basis: 60%;
      }
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 70%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      ${props => props.theme.mobileBreakpoint} {
         max-height: 100%;
         overflow: hidden;
         ${props => props.theme.scroll};
         padding: 2rem 3rem;
      }
   }
`;

export default StyledPageWithSidebar;
