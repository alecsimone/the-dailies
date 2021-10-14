import { useState, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import LinkIcon from '../Icons/Link';
import EditThis from '../Icons/EditThis';
import TrashIcon from '../Icons/Trash';
import CommentsButton from './CommentsButton';
import { home } from '../../config';
import ReorderIcon from '../Icons/Reorder';
import X from '../Icons/X';
import CopyContentInterface from './CopyContentInterface';
import VoteBar from './VoteBar';
import {
   changeContentButKeepInFrame,
   UNLINK_CONTENTPIECE_MUTATION
} from '../../lib/ContentHandling';
import { ModalContext } from '../ModalProvider';
import { setAlpha } from '../../styles/functions';

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

const ContentPieceButtons = ({
   canEdit,
   editable,
   hasShownComments,
   setHasShownComments,
   commentCount,
   clickToShowComments,
   showingComments,
   setShowingComments,
   thingID,
   pieceID,
   voters,
   isCopied,
   fullThingData,
   deleteContentPiece,
   reordering,
   setReordering,
   rawContentString,
   editContentInputRef,
   clearUnsavedContentPieceChanges,
   setUnsavedNewContent,
   setEditableHandler,
   contentContainerRef,
   postContent
}) => {
   const [copied, setCopied] = useState(false);

   const [showingAddToBox, setShowingAddToBox] = useState(false);

   const { midScreenBPWidthRaw } = useContext(ThemeContext);

   const [unlinkContentPiece] = useMutation(UNLINK_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const { setContent } = useContext(ModalContext);

   const saveOrDiscardContentInterface = (
      <StyledSaveOrDiscardContentInterface>
         <div className="prompt">
            Would you like to save or discard your changes?
         </div>
         <div className="responses">
            <button
               className="save"
               onClick={() => {
                  postContent();
                  setContent(false);
               }}
            >
               save
            </button>
            <button
               className="discard"
               onClick={() => {
                  clearUnsavedContentPieceChanges();
                  setUnsavedNewContent(null);
                  setEditableHandler(!editable);
                  setContent(false);
               }}
            >
               discard
            </button>
         </div>
      </StyledSaveOrDiscardContentInterface>
   );

   return (
      <div
         className={`buttons buttonsContainer contentButtons ${
            editable ? 'allButtons' : 'someButtons'
         }`}
      >
         <div
            className="buttonWrapper"
            onClick={async () => {
               await navigator.clipboard
                  .writeText(`${home}/thing?id=${thingID}&piece=${pieceID}`)
                  .catch(err => {
                     alert(err.message);
                  });
               setCopied(true);
               setTimeout(() => setCopied(false), 3000);
            }}
         >
            {copied ? 'copied' : <LinkIcon className="directLink buttons" />}
         </div>
         <div
            className="buttonWrapper"
            onClick={() => {
               setHasShownComments(true);
               let scrollingContainer;
               if (
                  commentCount > 0 &&
                  process.browser &&
                  window.innerWidth > midScreenBPWidthRaw &&
                  fullThingData.__typename !== 'Tag' &&
                  !hasShownComments &&
                  !clickToShowComments
               ) {
                  if (!hasShownComments) {
                     // If we're on a big screen and this piece has comments, they're already going to be showing the first time we click this button, but showingComments will be false. So we're just going to setHasShownComments to true, which will make false the condition that shows them by default. showingComments will already be false, so we don't need to change it.
                     return;
                  }
                  // On big screens, the scrollingContainer is .content
                  scrollingContainer = document.querySelector('.content');
               } else {
                  // On small screens, the scrollingContainer is .threeColumns
                  scrollingContainer = document.querySelector('.threeColumns');
               }
               changeContentButKeepInFrame(
                  contentContainerRef.current,
                  scrollingContainer,
                  () => setShowingComments(!showingComments)
               );
            }}
         >
            <div className="commentButton">
               <CommentsButton
                  count={commentCount < 100 ? commentCount : '+'}
               />
            </div>
         </div>
         <div className="buttonWrapper votebarWrapper">
            <VoteBar
               id={pieceID}
               votes={voters}
               key={`votebar-${pieceID}`}
               type="ContentPiece"
               mini
            />
         </div>
         {editable && !isCopied && (
            <div
               className="buttonWrapper"
               onClick={() => deleteContentPiece(pieceID)}
            >
               <TrashIcon
                  className="delete buttons"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
         {editable && isCopied && (
            <div
               className="buttonWrapper"
               onClick={() => {
                  if (
                     confirm(
                        'This content piece was copied from a different thing, so this action will only unlink it from this thing, not delete it. It will still exist in its original location, as well as any other places it might have been copied to.'
                     )
                  ) {
                     const unlinkParameterObject = {
                        variables: {
                           contentPieceID: pieceID,
                           thingID
                        }
                     };
                     if (fullThingData.__typename === 'Thing') {
                        const oldCopiedContent = fullThingData.copiedInContent;
                        const newCopiedContent = oldCopiedContent.filter(
                           piece => piece.id !== pieceID
                        );
                        const newThingData = {
                           ...fullThingData,
                           copiedInContent: newCopiedContent
                        };
                        unlinkParameterObject.optimisticResponse = {
                           __typename: 'Mutation',
                           unlinkContentPiece: newThingData
                        };
                     }
                     unlinkContentPiece(unlinkParameterObject);
                  }
               }}
            >
               <X
                  className="delete buttons unlink"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
         {editable && (
            <div
               className="buttonWrapper"
               onClick={() => {
                  setShowingAddToBox(!showingAddToBox);
                  if (!showingAddToBox) {
                     window.setTimeout(() => {
                        const thisAddToInterface = document.querySelector(
                           `#addToInterface_${pieceID}`
                        );
                        const thisInput = thisAddToInterface.querySelector(
                           'input.searchBox'
                        );
                        thisInput.focus();
                     }, 1);
                  }
               }}
            >
               <div className="addToContainer">
                  <X
                     color="mainText"
                     className={`addTo buttons${
                        showingAddToBox ? ' open' : ''
                     }`}
                  />
                  {showingAddToBox && (
                     <CopyContentInterface
                        id={pieceID}
                        thingID={thingID}
                        setShowingAddToBox={setShowingAddToBox}
                     />
                  )}
               </div>
            </div>
         )}
         {editable && (
            <div
               className="buttonWrapper"
               onClick={e => {
                  e.preventDefault();
                  if (
                     reordering ||
                     rawContentString === editContentInputRef.current.value ||
                     confirm(
                        'Are you sure you want to reorder the content? Any unsaved changes will be lost.'
                     )
                  ) {
                     setReordering(!reordering);
                  }
               }}
            >
               <ReorderIcon
                  className={`reorder buttons${
                     reordering ? ' reordering' : ''
                  }`}
               />
            </div>
         )}
         {canEdit && (
            <div
               className="buttonWrapper"
               onClick={() => {
                  if (!editable) {
                     setEditableHandler(true);
                     return;
                  }
                  if (rawContentString !== editContentInputRef.current.value) {
                     setContent(saveOrDiscardContentInterface);
                     return;
                  }
                  clearUnsavedContentPieceChanges();
                  setUnsavedNewContent(null);
                  setEditableHandler(!editable);
               }}
            >
               <EditThis
                  className="edit buttons"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
      </div>
   );
};

export default ContentPieceButtons;
