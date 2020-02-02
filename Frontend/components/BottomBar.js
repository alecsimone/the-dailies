import styled from 'styled-components';
import { setAlpha, setLightness } from '../styles/functions';

const StyledBottomBar = styled.section`
   width: 100%;
   background: ${props => setLightness(props.theme.black, 1)};
   border-top: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   display: flex;
   justify-content: stretch;
   ${props => props.theme.mobileBreakpoint} {
      display: none;
   }
   .bottomBarButton {
      padding: 1.75rem 0;
      flex-grow: 1;
      text-align: center;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      line-height: 1;
      cursor: pointer;
      border-right: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      &:last-child {
         border-right: none;
      }
      &:hover {
         background: ${props => setLightness(props.theme.black, 4)};
      }
   }
`;

const BottomBar = () => {
   const a = '0';
   return (
      <StyledBottomBar>
         <div className="bottomBarButton">S</div>
         <div className="bottomBarButton">H</div>
         <div className="bottomBarButton">+</div>
      </StyledBottomBar>
   );
};
export default BottomBar;
