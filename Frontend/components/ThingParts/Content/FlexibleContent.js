import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { useEffect, useRef, useState } from 'react';
import Reorder from 'react-reorder';
import { contentPieceFields } from '../../../lib/CardInterfaces';
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
import FlexibleContentPiece from './FlexibleContentPiece';

const FlexibleContent = ({ contentType, canEdit, linkedPiece, thingData }) => {
   const {
      id: thingID,
      content,
      copiedInContent,
      contentOrder,
      unsavedNewContent
   } = thingData;
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
            id: thingID,
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
      const newContent = content.filter(
         contentPiece => contentPiece.id !== contentPieceID
      );
      await deleteContentPiece({
         variables: {
            contentPieceID,
            id: thingID,
            type: 'Thing'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteContentPiece: {
               __typename: 'Thing',
               id: thingID,
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
      const indexOfEditedContentPiece = fullContent.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );

      if (fullContent[indexOfEditedContentPiece] == null) {
         console.log('Something has gone terribly wrong. Please try again.');
      }

      const thisPiece = fullContent[indexOfEditedContentPiece];

      fullContent[indexOfEditedContentPiece].content = newContent;

      await editContentPiece({
         variables: {
            contentPieceID,
            content: newContent,
            id: thisPiece.onThing.id, // The piece might be copied from another thing, so we can't assume it has the id of the thing we're viewing,
            type: 'Thing'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editContentPiece: {
               __typename: 'Thing',
               id: thingID,
               content: fullContent
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

   const [currentContentPosition, setCurrentContentPosition] = useState(0);
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
         thingID,
         'Thing',
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
                  <FlexibleContentPiece
                     key={`${thingID}-${contentPiece.id}-${
                        clickToShowComments ? 'cts' : 'ncts'
                     }`}
                     contentType={displayedContentType}
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={contentPiece.id}
                     thingID={thingID}
                     thingData={thingData}
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
         const currentContentPiece = orderedContent[currentContentPosition];

         const [originalContentCheck] = content.filter(
            piece => piece.id === currentContentPiece.id
         );
         const isOriginalContent = originalContentCheck != null;

         if (currentContentPiece != null) {
            contentElements = (
               <div
                  key={currentContentPiece.id}
                  className={reordering ? 'reordering' : 'locked'}
               >
                  <FlexibleContentPiece
                     key={`${thingID}-${currentContentPiece.id}-${
                        clickToShowComments ? 'cts' : 'ncts'
                     }`}
                     contentType={displayedContentType}
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={currentContentPiece.id}
                     thingID={thingID}
                     thingData={thingData}
                     votes={currentContentPiece.votes}
                     unsavedContent={currentContentPiece.unsavedNewContent}
                     comments={currentContentPiece.comments}
                     rawContentString={currentContentPiece.content}
                     onThing={currentContentPiece.onThing}
                     isCopied={!isOriginalContent}
                     copiedToThings={currentContentPiece.copiedToThings}
                     editContentPiece={editPiece}
                     deleteContentPiece={deletePiece}
                     reordering={reordering}
                     setReordering={setReordering}
                     highlighted={linkedPiece === currentContentPiece.id}
                     zIndex={orderedContent.length} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
                     truncContExpanded={truncContExpanded}
                     setTruncContExpanded={setTruncContExpanded}
                  />
               </div>
            );
         }
      }
   }

   if (process.browser && canEdit && reordering) {
      contentElements = (
         <Reorder
            reorderId={thingID}
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
                     id: thingID,
                     type: 'Thing',
                     oldPosition,
                     newPosition
                  },
                  optimisticResponse: {
                     reorderContent: {
                        __typename: 'Thing',
                        id: thingID,
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
            {displayedContentType === 'single' && (
               <div className="sliderAndShowFormWrapper">
                  {fullContent.length > 1 && (
                     <div className="contentSlider">
                        {currentContentPosition > 0 && (
                           <ArrowIcon
                              onClick={() =>
                                 setCurrentContentPosition(
                                    currentContentPosition - 1
                                 )
                              }
                              pointing="left"
                           />
                        )}
                        <span
                           className={`sliderText${
                              currentContentPosition === 0 ? ' noLeft' : ''
                           }${
                              currentContentPosition + 1 === fullContent.length
                                 ? ' noRight'
                                 : ''
                           }`}
                        >
                           {currentContentPosition + 1} / {fullContent.length}
                        </span>
                        {currentContentPosition + 1 < fullContent.length && (
                           <ArrowIcon
                              onClick={() =>
                                 setCurrentContentPosition(
                                    currentContentPosition + 1
                                 )
                              }
                              pointing="right"
                           />
                        )}
                     </div>
                  )}
               </div>
            )}
            <div className="expansionControls">
               <X
                  onClick={() =>
                     setShowingAddContentForm(!showingAddContentForm)
                  }
                  className={`showAddContentForm ${
                     showingAddContentForm ? 'collapse' : 'expand'
                  }`}
                  color="mainText"
               />
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
            </div>
            {canEdit && showingAddContentForm && (
               <RichTextArea
                  text=""
                  postText={sendNewContentPieceHandler}
                  placeholder="Add content"
                  buttonText="add"
                  id={`${thingID}-content`}
                  inputRef={inputRef}
                  unsavedChangesHandler={unsavedChangesHandler}
                  unsavedContent={unsavedNewContent}
               />
            )}
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

export default React.memo(FlexibleContent, (prev, next) => {
   if (prev.contentType !== next.contentType) return false;
   if (prev.canEdit !== next.canEdit) return false;
   if (prev.linkedPiece !== next.linkedPiece) return false;

   const prevData = prev.thingData;
   const nextData = next.thingData;

   // At this level, we only need to rerender if the number of content pieces changes
   if (prevData.thingID !== nextData.thingID) return false;
   if (prevData.content?.length !== nextData.content?.length) return false;
   if (prevData.copiedInContent?.length !== nextData.copiedInContent?.length)
      return false;
   if (prevData.contentOrder !== nextData.contentOrder) return false;
   if (prevData.unsavedNewContent !== nextData.unsavedNewContent) return false;
});
