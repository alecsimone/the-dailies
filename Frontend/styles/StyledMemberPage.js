import styled from 'styled-components';
import { setAlpha } from './functions';

const StyledMemberPage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 100%;
      flex-wrap: wrap;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 25%;
      }
   }
   .myStuffContainer {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
   }
`;
export default StyledMemberPage;
