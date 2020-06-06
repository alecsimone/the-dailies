import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from './functions';

const StyledSidebar = styled.section`
   position: fixed;
   max-height: calc(100% - 14rem); /* 8rem is the height of the bottom bar, 6rem is the height of the header */
   ${props => props.theme.scroll};
   z-index: 3;
   ${props => props.theme.mobileBreakpoint} {
      position: relative;
      max-height: none;
   }
   transition: all 0.25s;
   /* background: ${props => setLightness(props.theme.majorColor, 3)}; */
   /* background: ${props =>
      setLightness(setSaturation(props.theme.primaryAccent, 42), 2)}; */
      background: ${props => props.theme.deepBlack};
   border-right: 2px solid
      ${props => setAlpha(props.theme.highContrastGrey, 0.1)};
   display: grid;
   grid-template-rows: auto 1fr;
   ${props => props.theme.desktopBreakpoint} {
      max-width: 600px;
   }
   &.hidden {
      overflow: hidden;
      position: relative;
      .sidebarContainer {
         display: none;
      }
      .sidebarHeader {
         position: relative;
      }
      ${props => props.theme.mobileBreakpoint} {
         max-width: 4rem;
         .sidebarHeader {
            position: absolute;
            right: 0;
         }
      }
   }
   .sidebarHeader {
      position: fixed;
      z-index: 2;
      background: black;
      ${props => props.theme.mobileBreakpoint} {
         position: relative;
      }
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
      padding-top: 4rem; /* Sidebar header is 3rem height + 1rem padding */
      z-index: 1;
      ${props => props.theme.mobileBreakpoint} {
         padding-top: 0;
      }
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
