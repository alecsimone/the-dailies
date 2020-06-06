import styled from 'styled-components';
import { useContext, useEffect } from 'react';
import { ModalContext } from './ModalProvider';
import X from './Icons/X';

const StyledModal = styled.section`
   background: ${props => props.theme.lightBlack};
   position: fixed;
   left: 0;
   top: 0%;
   width: 100vw;
   height: 100vh;
   z-index: 9;
   .modalContainer {
      svg.x {
         position: absolute;
         top: 1rem;
         right: 1rem;
         width: 3rem;
         cursor: pointer;
         opacity: 0.4;
         &:hover {
            opacity: 1;
         }
      }
      position: absolute;
      top: 10%;
      left: 10%;
      width: 80%;
      height: 80%;
      background: ${props => props.theme.deepBlack};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${props => props.theme.smallText};
   }
`;

const Modal = () => {
   const { content, setContent } = useContext(ModalContext);

   useEffect(() => {
      if (!content) return;
      window.addEventListener('click', clickOutsideDetector);
      return () => window.removeEventListener('click', clickOutsideDetector);
   }, [clickOutsideDetector, content]);

   const clickOutsideDetector = e => {
      if (e.target.closest('.modalContainer') == null) {
         setContent(false);
         window.removeEventListener('click', clickOutsideDetector);
      }
   };

   if (content === false) {
      return null;
   }
   return (
      <StyledModal>
         <div className="modalContainer">
            <X color="darkGrey" onClick={() => setContent(false)} />
            {content}
         </div>
      </StyledModal>
   );
};

export default Modal;
