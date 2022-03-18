import { useContext } from 'react';
import styled from 'styled-components';
import { setAlpha } from '../styles/functions';
import { ModalContext } from './ModalProvider';

const StyledSaveOrDiscardContentInterface = styled.div`
   .responses {
      margin-top: 3rem;
      display: flex;
      align-items: center;
      justify-content: space-around;
      button {
         padding: 1rem;
         font-size: ${props => props.theme.bigText};
         &.save {
            background: ${props => setAlpha(props.theme.primaryAccent, 0.75)};
            &:hover {
               background: ${props => props.theme.primaryAccent};
            }
         }
         &.discard {
            background: ${props => setAlpha(props.theme.warning, 0.75)};
            &:hover {
               background: ${props => props.theme.warning};
            }
         }
      }
   }
`;

const SaveOrDiscardContentInterface = ({
   postContent,
   clearUnsavedContentPieceChanges,
   setUnsavedNewContent,
   setEditable
}) => {
   const { setContent } = useContext(ModalContext);

   return (
      <StyledSaveOrDiscardContentInterface>
         <div className="prompt">
            Would you like to save or discard your changes?
         </div>
         <div className="responses">
            <button
               className="save"
               onClick={() => {
                  if (postContent != null) {
                     postContent();
                  }
                  if (setContent != null) {
                     setContent(false);
                  }
                  if (setEditable != null) {
                     setEditable(false);
                  }
               }}
            >
               save
            </button>
            <button
               className="discard"
               onClick={() => {
                  if (clearUnsavedContentPieceChanges != null) {
                     clearUnsavedContentPieceChanges();
                  }
                  if (setUnsavedNewContent != null) {
                     setUnsavedNewContent(null);
                  }
                  if (setEditable != null) {
                     setEditable(false);
                  }
                  if (setContent != null) {
                     setContent(false);
                  }
               }}
            >
               discard
            </button>
         </div>
      </StyledSaveOrDiscardContentInterface>
   );
};

export default SaveOrDiscardContentInterface;
