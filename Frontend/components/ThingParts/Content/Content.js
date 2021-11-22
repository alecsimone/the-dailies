import { useMutation, useQuery } from '@apollo/react-hooks';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Reorder from 'react-reorder';
import {
   ADD_CONTENTPIECE_MUTATION,
   DELETE_CONTENTPIECE_MUTATION,
   EDIT_CONTENTPIECE_MUTATION,
   orderContent,
   REORDER_CONTENT_MUTATION,
   sendNewContentPiece,
   STORE_UNSAVED_CONTENT_MUTATION
} from '../../../lib/ContentHandling';
import { SINGLE_TAX_QUERY } from '../../../pages/tag';
import { SINGLE_THING_QUERY } from '../../../pages/thing';
import { dynamicallyResizeElement, getOneRem } from '../../../styles/functions';
import StyledContent from '../../../styles/StyledContent';
import ArrowIcon from '../../Icons/Arrow';
import X from '../../Icons/X';
import LoadingRing from '../../LoadingRing';
import RichTextArea from '../../RichTextArea';
import Swiper from '../Swiper';
import ContentPiece from './ContentPiece';

const useContentData = (thingID, type) => {
   const contentData = {};
   contentData.content = useSelector(
      state => state.stuff[`${type}:${thingID}`].content
   );
   contentData.contentOrder = useSelector(
      state => state.stuff[`${type}:${thingID}`].contentOrder
   );
   if (type === 'Thing') {
      contentData.copiedInContent = useSelector(
         state => state.stuff[`${type}:${thingID}`].copiedInContent
      );
   } else {
      contentData.copiedInContent = [];
   }
   contentData.unsavedNewContent = useSelector(
      state => state.stuff[`${type}:${thingID}`].unsavedNewContent
   );
   return contentData;
};

const Content = ({ contentType, canEdit, linkedPiece, stuffID, type }) => {
   const {
      content,
      copiedInContent,
      contentOrder,
      unsavedNewContent
   } = useContentData(stuffID, type);
   // First we'll set up our mutation hooks
   const [storeUnsavedThingChanges] = useMutation(
      STORE_UNSAVED_CONTENT_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const unsavedChangesHandler = async e => {
      await storeUnsavedThingChanges({
         variables: {
            id: stuffID,
            unsavedContent: e.target.value
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   const [addContentPiece] = useMutation(ADD_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const [deleteContentPiece] = useMutation(DELETE_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const deletePiece = async contentPieceID => {
      if (!confirm('Are you sure you want to delete that?')) {
         return;
      }

      const contentCopy = JSON.parse(JSON.stringify(fullContent));
      const indexOfEditedContentPiece = contentCopy.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );
      const thisPiece = contentCopy[indexOfEditedContentPiece];

      const newContent = contentCopy.filter(
         contentPiece => contentPiece.id !== contentPieceID
      );

      let thisPieceStuffID; // The piece might be copied from another thing, so we can't assume it has the id of the thing/tag we're viewing,
      if (thisPiece.onThing != null) {
         thisPieceStuffID = thisPiece.onThing.id;
      } else if (thisPiece.onTag != null) {
         thisPieceStuffID = thisPiece.onTag.id;
      } else {
         return;
      }

      await deleteContentPiece({
         variables: {
            contentPieceID,
            id: thisPieceStuffID,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteContentPiece: {
               __typename: type,
               id: thisPieceStuffID,
               content: newContent
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   const [editContentPiece] = useMutation(EDIT_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const editPiece = async (contentPieceID, newContent) => {
      const contentCopy = JSON.parse(JSON.stringify(fullContent));
      const indexOfEditedContentPiece = contentCopy.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );

      if (contentCopy[indexOfEditedContentPiece] == null) {
         console.log('Something has gone terribly wrong. Please try again.');
      }

      const thisPiece = contentCopy[indexOfEditedContentPiece];

      contentCopy[indexOfEditedContentPiece].content = newContent;

      let thisPieceStuffID;
      if (thisPiece.onThing != null) {
         thisPieceStuffID = thisPiece.onThing.id; // The piece might be copied from another thing, so we can't assume it has the id of the thing we're viewing,
      } else if (thisPiece.onTag != null) {
         thisPieceStuffID = thisPiece.onTag.id;
      } else {
         return;
      }

      await editContentPiece({
         variables: {
            contentPieceID,
            content: newContent,
            id: thisPieceStuffID,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editContentPiece: {
               __typename: type,
               id: thisPieceStuffID,
               content: contentCopy
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   const [reorderContent] = useMutation(REORDER_CONTENT_MUTATION, {
      onError: err => alert(err.message)
   });
   const [reordering, setReordering] = useState(false);

   const [showingAddContentForm, setShowingAddContentForm] = useState(
      contentType === 'full' ||
         (content.length === 0 && copiedInContent.length === 0)
   ); // If there's no content, we want to show the add content form. Otherwise we only show it by default if we're showing all the content

   const [displayedContentType, setDisplayedContentType] = useState(
      contentType
   );

   // This ref will be used to represent this component. We'll use it to determine the width of the component and whether we want to show comments side by side with content or if a button toggles between them
   const thisComponentRef = useRef(null);
   const [clickToShowComments, setClickToShowComments] = useState(null);
   useEffect(() => {
      const oneRem = getOneRem();
      const threshold = 100 * oneRem;
      if (thisComponentRef?.current?.clientWidth > threshold) {
         setClickToShowComments(false);
      } else {
         setClickToShowComments(true);
      }
   });

   // This ref will be passed down to the RichTextArea that sits at the bottom of content and allows members to add a new content piece, and we'll use it to get the value for our sendNewContentPiece mutation
   const inputRef = useRef(null);

   const sendNewContentPieceHandler = () => {
      sendNewContentPiece(
         inputRef,
         content,
         dynamicallyResizeElement,
         addContentPiece,
         stuffID,
         type,
         SINGLE_THING_QUERY,
         SINGLE_TAX_QUERY
      );
   };

   const [truncContExpanded, setTruncContExpanded] = useState(false);

   if ((content == null || content.length === 0) && !canEdit) return null;

   let contentElements;
   let orderedContent;
   let fullContent;
   if (content) {
      if (copiedInContent != null && copiedInContent.length > 0) {
         fullContent = content.concat(copiedInContent);
      } else {
         fullContent = content;
      }
      orderedContent = orderContent(fullContent, contentOrder);
      if (displayedContentType === 'full') {
         contentElements = orderedContent.map((contentPiece, index) => {
            const [originalContentCheck] = content.filter(
               piece => piece.id === contentPiece.id
            );
            const isOriginalContent = originalContentCheck != null;
            return (
               <div
                  key={contentPiece.id}
                  className={reordering ? 'reordering' : 'locked'}
               >
                  <ContentPiece
                     key={`${stuffID}-${contentPiece.id}-${
                        clickToShowComments ? 'cts' : 'ncts'
                     }`}
                     contentType={displayedContentType}
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={contentPiece.id}
                     stuffID={stuffID}
                     stuffType={type}
                     votes={contentPiece.votes}
                     unsavedContent={contentPiece.unsavedNewContent}
                     comments={contentPiece.comments}
                     rawContentString={contentPiece.content}
                     onThing={contentPiece.onThing}
                     isCopied={!isOriginalContent}
                     copiedToThings={contentPiece.copiedToThings}
                     editContentPiece={editPiece}
                     deleteContentPiece={deletePiece}
                     reordering={reordering}
                     setReordering={setReordering}
                     highlighted={linkedPiece === contentPiece.id}
                     zIndex={orderedContent.length - index} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
                  />
               </div>
            );
         });
      }
      if (displayedContentType === 'single') {
         const contentElementsArray = orderedContent.map(piece => {
            const [originalContentCheck] = content.filter(
               contentPiece => piece.id === contentPiece.id
            );
            const isOriginalContent = originalContentCheck != null;

            return (
               <div
                  key={piece.id}
                  className={reordering ? 'reordering' : 'locked'}
               >
                  <ContentPiece
                     key={`${stuffID}-${piece.id}-${
                        clickToShowComments ? 'cts' : 'ncts'
                     }`}
                     contentType={displayedContentType}
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={piece.id}
                     stuffID={stuffID}
                     stuffType={type}
                     votes={piece.votes}
                     unsavedContent={piece.unsavedNewContent}
                     comments={piece.comments}
                     rawContentString={piece.content}
                     onThing={piece.onThing}
                     isCopied={!isOriginalContent}
                     copiedToThings={piece.copiedToThings}
                     editContentPiece={editPiece}
                     deleteContentPiece={deletePiece}
                     reordering={reordering}
                     setReordering={setReordering}
                     highlighted={linkedPiece === piece.id}
                     zIndex={orderedContent.length} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
                     truncContExpanded={truncContExpanded}
                     setTruncContExpanded={setTruncContExpanded}
                  />
               </div>
            );
         });
         contentElements = <Swiper elementsArray={contentElementsArray} />;
      }
   }

   if (process.browser && canEdit && reordering) {
      contentElements = (
         <Reorder
            reorderId={stuffID}
            touchHoldTime={250}
            placeholderClassName="placeholder"
            draggedClassName="dragged"
            onReorder={async (e, oldPosition, newPosition, reorderId, f) => {
               let order;
               if (contentOrder != null) {
                  order = [];
                  contentOrder.forEach(id => {
                     const [piece] = content.filter(
                        contentPiece => contentPiece.id === id
                     );
                     if (piece != null) {
                        order.push(id);
                     }
                  });
                  content.forEach(contentPiece => {
                     if (contentOrder.includes(contentPiece.id)) {
                        return;
                     }
                     order.push(contentPiece.id);
                  });
               } else {
                  order = content.map(content => content.id);
               }
               order.splice(newPosition, 0, order.splice(oldPosition, 1)[0]);
               await reorderContent({
                  variables: {
                     id: stuffID,
                     type: 'Thing',
                     oldPosition,
                     newPosition
                  },
                  optimisticResponse: {
                     reorderContent: {
                        __typename: 'Thing',
                        id: stuffID,
                        content,
                        contentOrder: order
                     }
                  }
               }).catch(err => {
                  alert(err.message);
               });
            }}
         >
            {contentElements}
         </Reorder>
      );
   }

   if (clickToShowComments == null) {
      return (
         <div ref={thisComponentRef}>
            <LoadingRing />
         </div>
      );
   }

   return (
      <StyledContent className="content" ref={thisComponentRef}>
         <div className="contentSectionWrapper">
            {contentElements}
            {canEdit && showingAddContentForm && (
               <RichTextArea
                  text=""
                  postText={sendNewContentPieceHandler}
                  placeholder="Add content"
                  buttonText="add"
                  id={`${stuffID}-content`}
                  inputRef={inputRef}
                  unsavedChangesHandler={unsavedChangesHandler}
                  unsavedContent={unsavedNewContent}
                  alwaysShowExtras={false}
               />
            )}
            <div className="expansionControls">
               {canEdit && (
                  <X
                     onClick={() =>
                        setShowingAddContentForm(!showingAddContentForm)
                     }
                     className={`showAddContentForm ${
                        showingAddContentForm ? 'collapse' : 'expand'
                     }`}
                     color="mainText"
                  />
               )}
               {content.length > 0 && (
                  <ArrowIcon
                     pointing={displayedContentType === 'full' ? 'up' : 'down'}
                     onClick={() => {
                        if (displayedContentType === 'full') {
                           setDisplayedContentType('single');
                           if (
                              inputRef.current.value === '' ||
                              inputRef.current.value == null
                           ) {
                              setShowingAddContentForm(false);
                           }
                        }
                        if (displayedContentType === 'single') {
                           setDisplayedContentType('full');
                           setShowingAddContentForm(true);
                        }
                     }}
                  />
               )}
            </div>
            {canEdit && content.length > 1 && displayedContentType === 'full' && (
               <button
                  type="button"
                  className="reorder"
                  onClick={() => setReordering(!reordering)}
               >
                  {reordering ? 'Lock Content' : 'Reorder Content'}
               </button>
            )}
         </div>
      </StyledContent>
   );
};

export default React.memo(Content);
