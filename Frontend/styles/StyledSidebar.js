import styled from 'styled-components';
import { setAlpha } from './functions';

const StyledSidebar = styled.section`
   background: hsla(30, 5%, 5%, 0.9);
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
         padding: 1rem;
         font-size: ${props => props.theme.bigText};
         cursor: pointer;
         &.selected {
            background: ${props =>
               setAlpha(props.theme.lowContrastCoolGrey, 0.1)};
         }
         &:hover {
            background: ${props =>
               setAlpha(props.theme.lowContrastCoolGrey, 0.05)};
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
         overflow-y: auto;
         scrollbar-color: #262626 black;
         scrollbar-width: thin;
      }
   }
`;

export default StyledSidebar;
