import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from './functions';

const StyledSidebar = styled.section`
   &.hidden {
      max-width: 3rem;
      overflow: hidden;
      position: relative;
      .sidebarHeader {
         position: absolute;
         right: 0;
      }
      .sidebarContainer {
         display: none;
      }
   }
   transition: all 0.25s;
   background: ${props =>
      setLightness(setSaturation(props.theme.primaryAccent, 60), 4)};
   border-right: 2px solid
      ${props => setAlpha(props.theme.highContrastGrey, 0.1)};
   position: relative;
   max-height: 100%;
   max-width: 600px;
   display: grid;
   grid-template-rows: auto 1fr;
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
         padding: 0.5rem;
         font-size: 3rem;
         cursor: pointer;
         img {
            height: 3rem;
            width: auto;
            opacity: 0.75;
            &[alt] {
               line-height: 1;
            }
         }
         &.selected {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         }
         &:hover {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
         }
         &.toggle {
            max-width: 3rem;
            line-height: 1;
            font-weight: 700;
            color: ${props => props.theme.lowContrastGrey};
         }
         &.Me img,
         &.Member img {
            border-radius: 100%;
         }
      }
   }
   .sidebarContainer {
      position: relative;
      .sidebarContent {
         padding: 2rem;
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         max-height: 100%;
         ${props => props.theme.scroll};
      }
   }
`;

export default StyledSidebar;
