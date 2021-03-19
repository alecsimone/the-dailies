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
      svg.x.close {
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
      padding: 2rem;
      ${props => props.theme.midScreenBreakpoint} {
         padding: 3rem;
      }
   }
`;

const Modal = () => {
   const { content, setContent } = useContext(ModalContext);

   const clickOutsideDetector = e => {
      if (
         e.target.closest('.modalContainer') == null &&
         !e.target.classList.contains('forgotPasswordLink') // We need this so the forgot password link doesn't trigger this. I think because changing the content of the modal destroys the DOM chain that closest relies on?
      ) {
         console.log('this happened');
         setContent(false);
         window.removeEventListener('click', clickOutsideDetector);
      }
   };
   useEffect(() => {
      if (!content) return;
      window.addEventListener('click', clickOutsideDetector);
      return () => window.removeEventListener('click', clickOutsideDetector);
   }, [clickOutsideDetector, content]);

   if (content === false) {
      return null;
   }
   return (
      <StyledModal>
         <div className="modalContainer">
            <X
               className="close"
               color="darkGrey"
               onClick={() => setContent(false)}
            />
            {content}
         </div>
      </StyledModal>
   );
};

export default Modal;
