import { useState, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';
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
import LockIcon from '../Icons/Lock';
import PrivacyInterface from './PrivacyInterface';
import SaveOrDiscardContentInterface from '../SaveOrDiscardContentInterface';

const ContentPieceButtons = ({
   canEdit,
   editable,
   hasShownComments,
   setHasShownComments,
   commentCount,
   clickToShowComments,
   showingComments,
   setShowingComments,
   stuffID,
   stuffType,
   pieceID,
   voters,
   isCopied,
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
   const stuffData = useSelector(
      state => state.stuff[`${stuffType}:${stuffID}`]
   );

   const piecePrivacy = useSelector(
      state => state.stuff[`ContentPiece:${pieceID}`].privacy
   );

   const privacy = piecePrivacy != null ? piecePrivacy : stuffData.privacy;

   const [copied, setCopied] = useState(false);

   const [showingAddToBox, setShowingAddToBox] = useState(false);
   const [showingPrivacyInterface, setShowingPrivacyInterface] = useState(
      false
   );

   const { midScreenBPWidthRaw } = useContext(ThemeContext);

   const [unlinkContentPiece] = useMutation(UNLINK_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const { setContent } = useContext(ModalContext);

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
                  .writeText(`${home}/thing?id=${stuffID}&piece=${pieceID}`)
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
                  stuffData.__typename !== 'Tag' &&
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
               thingID={stuffID}
               key={`votebar-${pieceID}`}
               type="ContentPiece"
               votes={voters}
               mini
            />
         </div>
         {editable && !isCopied && stuffType === 'Thing' && (
            <div
               className="buttonWrapper"
               onClick={e => {
                  if (e.target.closest('.privacyInterface') != null) return;
                  setShowingPrivacyInterface(!showingPrivacyInterface);
               }}
            >
               <LockIcon className="privacy buttons" privacy={privacy} />
               {showingPrivacyInterface && (
                  <div className="privacyInterfaceWrapper">
                     <PrivacyInterface
                        canEdit={canEdit}
                        id={pieceID}
                        type="ContentPiece"
                        key={`privacy-${stuffID}`}
                     />
                  </div>
               )}
            </div>
         )}
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
                           thingID: stuffID
                        }
                     };
                     if (stuffData.__typename === 'Thing') {
                        const oldCopiedContent = stuffData.copiedInContent;
                        const newCopiedContent = oldCopiedContent.filter(
                           piece => piece.id !== pieceID
                        );
                        const newThingData = {
                           ...stuffData,
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
               onClick={e => {
                  if (
                     e.target.closest('.addToInterface') != null &&
                     showingAddToBox
                  )
                     return;
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
                        thingID={stuffID}
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
                     setContent(
                        <SaveOrDiscardContentInterface
                           postContent={postContent}
                           clearUnsavedContentPieceChanges={
                              clearUnsavedContentPieceChanges
                           }
                           setUnsavedNewContent={setUnsavedNewContent}
                           setEditable={setEditableHandler}
                        />
                     );
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
