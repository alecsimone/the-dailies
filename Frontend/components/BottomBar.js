import styled from 'styled-components';
import { useState } from 'react';
import { setAlpha, setLightness } from '../styles/functions';

const StyledBottomBar = styled.section`
   width: 100%;
   border-top: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   display: flex;
   position: relative;
   justify-content: stretch;
   ${props => props.theme.mobileBreakpoint} {
      display: none;
   }
   .inputWrapper {
      width: 100%;
      position: absolute;
      height: 8rem;
      max-height: 8rem;
      top: calc(-8rem - 2px);
      left: 0;
      padding: 0 1.5rem;
      background: ${props => props.theme.black};
      transition: all 0.1s;
      z-index: 2;
      &.hidden {
         max-height: 0;
         top: 0;
         overflow: hidden;
      }
      input {
         width: 100%;
         margin-top: 1.75rem;
         padding: 0 2rem;
         height: 4.5rem;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         border-radius: 0;
         font-size: 3rem;
         z-index: 2;
      }
   }
   .bottomBarButton {
      padding: 1.75rem 0;
      flex-grow: 1;
      text-align: center;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      background: ${props => setLightness(props.theme.black, 1)};
      line-height: 1;
      cursor: pointer;
      border-right: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      z-index: 3;
      &:last-child {
         border-right: none;
      }
      &:hover {
         background: ${props => setLightness(props.theme.black, 4)};
      }
   }
`;

const BottomBar = () => {
   const [inputPlaceholder, setInputPlaceholder] = useState('');
   return (
      <StyledBottomBar>
         <div
            className={`inputWrapper${
               inputPlaceholder == false ? ' hidden' : ''
            }`}
         >
            <input type="text" placeholder={inputPlaceholder} />
         </div>
         <div
            className="bottomBarButton"
            onClick={() => {
               setInputPlaceholder(
                  inputPlaceholder === 'Search' ? false : 'Search'
               );
            }}
         >
            S
         </div>
         <div className="bottomBarButton">H</div>
         <div
            className="bottomBarButton"
            onClick={() => {
               setInputPlaceholder(
                  inputPlaceholder === 'Add Post' ? false : 'Add Post'
               );
            }}
         >
            +
         </div>
      </StyledBottomBar>
   );
};
export default BottomBar;
