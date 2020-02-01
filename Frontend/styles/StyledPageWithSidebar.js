import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from './functions';

const StyledPageWithSidebar = styled.section`
   display: flex;
   flex-wrap: wrap;
   @media screen and (min-width: ${props => props.theme.desktopBreakpoint}) {
      flex-wrap: nowrap;
   }
   .sidebar {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 25%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 20%;
      }
   }
   .mainSection {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 75%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      padding: 2rem 0;
      ${props => props.theme.desktopBreakpoint} {
         max-height: 100%;
         overflow: hidden;
         ${props => props.theme.scroll};
         padding: 2rem;
      }
   }
`;

export default StyledPageWithSidebar;
