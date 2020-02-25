import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from './functions';

const StyledSidebar = styled.section`
   &.hidden {
      overflow: hidden;
      position: relative;
      .sidebarContainer {
         display: none;
      }
      ${props => props.theme.mobileBreakpoint} {
         max-width: 4rem;
         .sidebarHeader {
            position: absolute;
            right: 0;
         }
      }
   }
   transition: all 0.25s;
   background: ${props => setLightness(props.theme.majorColor, 3)};
   border-right: 2px solid
      ${props => setAlpha(props.theme.highContrastGrey, 0.1)};
   position: relative;
   display: grid;
   grid-template-rows: auto 1fr;
   ${props => props.theme.desktopBreakpoint} {
      max-width: 600px;
   }
   .sidebarHeader {
      display: flex;
      width: 100%;
      line-height: 0;
      .headerTab {
         &:last-child {
            /* border-right: none; */
            border-right: 1px solid
               ${props => setAlpha(props.theme.mainText, 0.1)};
         }
         flex-grow: 1;
         text-align: center;
         border: 3px solid ${props => setAlpha(props.theme.mainText, 0.1)};
         border-top: none;
         border-left: none;
         padding: 0.5rem 0;
         font-size: 3rem;
         cursor: pointer;
         svg,
         img {
            height: 3rem;
            width: auto;
            opacity: 0.75;
         }
         &.selected {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         }
         &:hover {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
         }
         &.toggle {
            max-width: 6rem;
            ${props => props.theme.mobileBreakpoint} {
               max-width: 4rem;
            }
            font-weight: 700;
            color: ${props => props.theme.lowContrastGrey};
            padding: 0;
            svg {
               height: 4rem;
            }
         }
         &.Me img,
         &.Me svg,
         &.Member img,
         &.Member svg {
            border-radius: 100%;
         }
      }
   }
   .sidebarContainer {
      position: relative;
      .sidebarContent {
         ${props => props.theme.mobileBreakpoint} {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            max-height: 100%;
         }
         ${props => props.theme.scroll};
      }
      p.emptyThings {
         padding: 0 3rem;
      }
   }
`;

export default StyledSidebar;
