import { useMutation } from '@apollo/react-hooks';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import stickifier, { getIntPxFromStyleString } from '../../../lib/stickifier';
import { SINGLE_TAX_QUERY } from '../../../pages/tag';
import { SINGLE_THING_QUERY } from '../../../pages/thing';
import { dynamicallyResizeElement, getOneRem } from '../../../styles/functions';
import StyledContent from '../../../styles/StyledContent';
import ArrowIcon from '../../Icons/Arrow';
import X from '../../Icons/X';
import LoadingRing from '../../LoadingRing';
import RichTextArea from '../../RichTextArea';
import FlexibleContentPiece from './FlexibleContentPiece';

const FlexibleContent = ({
   contentType,
   fullThingData,
   canEdit,
   linkedPiece,
   thingID,
   content,
   copiedInContent,
   contentOrder,
   unsavedNewContent
}) => {
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
   );

   const [displayedContentType, setDisplayedContentType] = useState(
      contentType
   );

   // This ref will be used to represent this component. We'll use it to determine the width of the component and whether we want to show comments side by side with content or if a button toggles between them
   const thisComponentRef = useRef(null);
   const [clickToShowComments, setClickToShowComments] = useState(null);
   useEffect(() => {
      const oneRem = getOneRem();
      const threshold = 96 * oneRem;
      if (thisComponentRef.current.clientWidth > threshold) {
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

   // This ref is going to hold all the data we need for making the buttons and comments sticky. Things that don't change are populated in an effect that runs on the first render only, and everything else is populated in the stickifier function, which will be attached to a scroll listener by that same effect.
   const stickingData = useRef({
      blocksArray: []
   });

   const stickifierHandler = () => {
      // We need this little function so we can pass a parameter to stickifier when it's called by the scroll listener, and we can't just use an arrow function in the listener because then we can't remove it
      stickifier(stickingData);
   };

   // Add the stickifier listeners
   useLayoutEffect(() => {
      console.log('The stickifier data effect is running!');
      // First we'll collect all the content blocks. If there aren't any, we don't have anything to stick to, so we can return without doing anything (i.e. adding the listener)
      const blocks = thisComponentRef.current.querySelectorAll('.contentBlock');
      if (blocks.length === 0) return;

      // If we do have some blocks, we need to figure out what the scrolling parent is for our current view, because that could change depending on a few factors
      const thisElement = thisComponentRef.current;
      let currentParent = thisElement.parentElement;
      let scrollingParent = null;
      while (scrollingParent == null && currentParent != null) {
         const currentParentStyle = window.getComputedStyle(currentParent);
         if (currentParentStyle.overflowY === 'auto') {
            scrollingParent = currentParent;
         } else {
            currentParent = currentParent.parentElement;
         }
      }

      // Then we add a listener to it so we can run the handler on scroll to keep the buttons in place
      scrollingParent.addEventListener('scroll', stickifierHandler);

      // And put it in our stickingData so we can use it in the stickifier function
      stickingData.current.scroller = scrollingParent;

      // We'll add the blocks to the stickifier data so we can loop through them in the actual stickifier function
      stickingData.current.blocksArray = blocks;

      // We'll use the first block as a sample
      const firstBlock = blocks[0];
      const firstBlockRect = firstBlock.getBoundingClientRect();

      // We need to get the number of pixels between the top of the actual content and the top of the content block, and then we need to account for any padding within the actual content
      // First we figure out the distance between the two tops
      const theActualContent = firstBlock.querySelector('.theActualContent');
      const actualContentRect = theActualContent.getBoundingClientRect();
      const topDifference = firstBlockRect.top - actualContentRect.top;

      // Then we find the padding on actual content
      const actualContentStyle = window.getComputedStyle(theActualContent);
      const actualContentPaddingTopString = actualContentStyle.paddingTop;
      const actualContentPaddingTopRaw = actualContentPaddingTopString.substring(
         0,
         actualContentPaddingTopString.length - 2
      );
      const blockPaddingTop = parseInt(actualContentPaddingTopRaw);

      // And we put that combined value into our stickingData
      stickingData.current.blockPaddingTop = blockPaddingTop + topDifference;

      // Then we need to get the total offset of the firstBlock by tallying up the offsetTops of all its offsetParents
      let parentOffset = 0;
      let nextParent = firstBlock.offsetParent;
      while (nextParent != null) {
         parentOffset += nextParent.offsetTop;
         nextParent = nextParent.offsetParent;
      }
      stickingData.current.parentOffset = parentOffset;

      // We also might need to account for a difference in left positioning on the buttons (currently this is because of a negative margin on the buttons)
      const buttons = firstBlock.querySelector('.newcontentButtons');
      const buttonsStyle = window.getComputedStyle(buttons);
      const buttonsMarginLeftRaw = buttonsStyle.marginLeft;
      const buttonsMarginLeft = getIntPxFromStyleString(buttonsMarginLeftRaw);
      stickingData.current.leftAdjustment = buttonsMarginLeft;

      // We need to run the handler once here so that the edit buttons will be properly placed before the first scroll
      stickifier(stickingData);

      // Then we'll add a function to remove our listener when this component unmounts
      return () => {
         scrollingParent.removeEventListener('scroll', stickifierHandler);
      };

      const blockPaddingLeftString = window.getComputedStyle(firstBlock)
         .paddingLeft;
      const blockPaddingLeftRaw = blockPaddingLeftString.substring(
         0,
         blockPaddingLeftString.length - 2
      );
      const blockPaddingLeft = parseInt(blockPaddingLeftRaw);
      stickingData.current.blockPaddingLeft = blockPaddingLeft;

      // Do the same for the contentPiece
      const piece = firstBlock.querySelector('.contentPiece');
      const piecePaddingString = window.getComputedStyle(piece).paddingTop;
      const piecePaddingRaw = piecePaddingString.substring(
         0,
         piecePaddingString.length - 2
      );
      const piecePadding = parseInt(piecePaddingRaw);
      stickingData.current.piecePadding = piecePadding;

      return () => {
         mainSection.removeEventListener('scroll', stickifierHandler);
         threeColumns.removeEventListener('scroll', stickifierHandler);
      };
   }, [stickifierHandler]);

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
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={contentPiece.id}
                     thingID={thingID}
                     votes={contentPiece.votes}
                     unsavedContent={contentPiece.unsavedNewContent}
                     comments={contentPiece.comments}
                     rawContentString={contentPiece.content}
                     onThing={contentPiece.onThing}
                     isCopied={!isOriginalContent}
                     copiedToThings={contentPiece.copiedToThings}
                     stickifierData={stickingData}
                     editContentPiece={editPiece}
                     deleteContentPiece={deletePiece}
                     reordering={reordering}
                     setReordering={setReordering}
                     highlighted={linkedPiece === contentPiece.id}
                     fullThingData={fullThingData}
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
                     clickToShowComments={clickToShowComments}
                     canEdit={canEdit}
                     pieceID={currentContentPiece.id}
                     thingID={thingID}
                     votes={currentContentPiece.votes}
                     unsavedContent={currentContentPiece.unsavedNewContent}
                     comments={currentContentPiece.comments}
                     rawContentString={currentContentPiece.content}
                     onThing={currentContentPiece.onThing}
                     isCopied={!isOriginalContent}
                     copiedToThings={currentContentPiece.copiedToThings}
                     stickifierData={stickingData}
                     editContentPiece={editPiece}
                     deleteContentPiece={deletePiece}
                     reordering={reordering}
                     setReordering={setReordering}
                     highlighted={linkedPiece === currentContentPiece.id}
                     fullThingData={fullThingData}
                     zIndex={orderedContent.length} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
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

export default FlexibleContent;
