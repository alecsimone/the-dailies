import { useMutation } from '@apollo/react-hooks';
import { useState, useRef, useContext } from 'react';
import styled from 'styled-components';
import {
   orderContent,
   changeContentButKeepInFrame,
   sendNewContentPiece,
   ADD_CONTENTPIECE_MUTATION,
   STORE_UNSAVED_CONTENT_MUTATION
} from '../../lib/ContentHandling';
import { MemberContext } from '../Account/MemberProvider';
import { ADD_COMMENT_MUTATION } from './Comments';
import { minimumTranslationDistance } from '../../config';
import ContentPieceComment from './ContentPieceComments';
import RichTextArea from '../RichTextArea';
import TruncCont from './TruncCont';
import CommentsButton from './CommentsButton';
import ArrowIcon from '../Icons/Arrow';
import {
   dynamicallyResizeElement,
   setAlpha,
   setLightness
} from '../../styles/functions';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { SINGLE_TAX_QUERY } from '../../pages/tag';
import X from '../Icons/X';

const StyledSingleContent = styled.div`
   .cardTouchWatcher {
      .cardOverflowWrapper {
         width: 100%;
         overflow: hidden;
         .cardPiecesContainer {
            width: 300%;
            display: flex;
            .previousContentWrapper,
            .currentContentWrapper,
            .nextContentWrapper {
               display: inline-block;
               background: ${props => props.theme.midBlack};
               width: 33.3%;
               margin: 3rem 0;
               padding: 0.8rem calc(${props => props.theme.smallText} + 2.25rem)
                  0.8rem 1.75rem;
               border: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
               border-radius: 3px;
            }
            .currentContentWrapper {
               margin: 3rem 1.5rem;
               /* max-height: 400px; */
               ${props => props.theme.scroll};
               /* touch-action: none; */
               ${props => props.theme.midScreenBreakpoint} {
                  /* max-height: 600px; */
                  margin: 1rem;
               }
            }
            .givesSize {
               height: auto;
            }
            .doesNotGiveSize {
               height: 0;
            }
            .contentArea {
               margin: 0;
               border-radius: 3px;
               .commentsButtonComponentWrapper {
                  position: absolute;
                  right: 1rem;
                  bottom: 0;
               }
               .truncCont .arrow.truncContArrow {
                  margin-left: calc(
                     50% - 0.5rem
                  ); /* That .5rem is pretty arbitrary afaik */
               }
               .commentsControls {
                  .arrow {
                     margin-left: 3rem; /* On this one we're making up for the off-centerness caused by putting padding right to allow space for the comment button */
                  }
               }
               .thingCard {
                  background: ${props => props.theme.midBlack};
               }
            }
         }
      }
   }
   .sliderAndShowFormWrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      .contentSlider {
         display: inline-flex;
         justify-content: center;
         align-items: center;
         svg.arrow {
            width: ${props => props.theme.bigText};
            margin: 0;
            cursor: pointer;
            rect {
               fill: ${props => setLightness(props.theme.mainText, 70)};
            }
            &:hover {
               rect {
                  fill: ${props => props.theme.mainText};
               }
            }
         }
      }
      svg.x {
         width: ${props => props.theme.smallText};
         transform: rotate(45deg);
         &.collapse {
            transform: rotate(0);
         }
         margin-left: 1rem;
         opacity: 0.7;
         cursor: pointer;
         &:hover {
            opacity: 0.9;
         }
      }
   }
   .contentFormWrapper {
      background: ${props => props.theme.midBlack};
      padding-top: 2rem;
      margin-top: 1rem;
      form {
         display: flex;
         flex-wrap: wrap;
         max-width: 900px;
         margin: auto;
         .postButtonWrapper {
            width: 100%;
            /* text-align: right; */
            display: flex;
            justify-content: space-between;
         }
      }
      textarea {
         width: 100%;
         position: relative;
         height: calc(5rem + 4px);
      }
      button {
         margin: 1rem 0;
         padding: 0.6rem;
         font-size: ${props => props.theme.smallText};
         font-weight: 500;
         &.post {
            background: ${props => setAlpha(props.theme.majorColor, 0.8)};
            color: ${props => props.theme.mainText};
            &:hover {
               background: ${props => props.theme.majorColor};
               box-shadow: 0 0 6px
                  ${props => setAlpha(props.theme.majorColor, 0.6)};
            }
         }
      }
   }
`;

const SingleContentSlider = ({
   canEdit,
   expanded,
   thingID,
   content,
   copiedInContent,
   contentOrder,
   unsavedNewContent
}) => {
   const [showingAddContentForm, setShowingAddContentForm] = useState(expanded);

   const [contentSliderPosition, setContentSliderPosition] = useState(0);
   const currentContentWrapperRef = useRef(null);

   const [showingComments, setShowingComments] = useState(false);

   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   const { me } = useContext(MemberContext);

   // First we'll make an array of the orderedContent, which we can add comments to when the time comes
   let fullContent;
   if (copiedInContent != null && copiedInContent.length > 0) {
      fullContent = content.concat(copiedInContent);
   } else {
      fullContent = content;
   }
   const contentArray = orderContent(fullContent, contentOrder);

   // We'll need an object whose properties are the ids of all the content pieces on this thing, each of which starts out with an empty string, which we'll put in state. We'll use this to store the text of any potential new comments the user might be adding
   const contentCommentsObject = {};
   content.forEach(piece => {
      contentCommentsObject[piece.id] = '';
   });
   const [commentTextObject, setCommentTextObject] = useState(
      contentCommentsObject
   );

   // We'll need a ref to pass down to the RichTextArea for adding new content. We'll use it to get the value of that textarea for our sendNewContentPiece mutation
   const inputRef = useRef(null);

   // Then we'll need a ref to pass down to the RichTextArea which will be in the comments section for our content pieces. We'll use it to get the value of that textarea for our postNewComment mutation
   const commentInputRef = useRef(null);

   // We'll use this function to switch the individual values in that object
   const handleCommentChanges = (pieceID, newValue) => {
      setCommentTextObject(prevState => ({
         ...prevState,
         [pieceID]: newValue
      }));
   };

   const [addContentPiece] = useMutation(ADD_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const [storeUnsavedThingChanges] = useMutation(
      STORE_UNSAVED_CONTENT_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      onError: err => alert(err.message)
   });

   // We also need a function to send new comments to the server
   const postNewComment = async () => {
      const pieceID = contentArray[contentSliderPosition].id;
      const now = new Date();
      const inputElement = commentInputRef.current;
      const newCommentText = inputElement.value;
      if (newCommentText.trim() === '') {
         alert("You can't add a blank comment. Please write something first.");
      }

      const newComment = {
         __typename: 'Comment',
         author: {
            __typename: 'Member',
            avatar: me.avatar,
            displayName: me.displayName,
            id: me.id,
            rep: me.rep
         },
         comment: newCommentText,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         votes: [],
         updatedAt: now.toISOString()
      };

      contentArray[contentSliderPosition].comments.push(newComment);

      handleCommentChanges(pieceID, '');
      await addComment({
         variables: {
            comment: newCommentText,
            id: pieceID,
            type: 'ContentPiece'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addComment: {
               __typename: 'ContentPiece',
               id: pieceID,
               comments: contentArray[contentSliderPosition].comments
            }
         }
      }).catch(err => {
         alert(err.message);
      });
      inputElement.value = ''; // We need to clear the input after commenting
      // TODO: Add the update function a la Comments.js line 192
   };

   // And a handler for the sendNewContentPiece function
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

   const handleContentScrolling = newIndex => {
      currentContentWrapperRef.current.scrollTop = 0;

      const contentDiv = document.querySelector('.content');
      const mainSection = document.querySelector('.mainSection');
      const threeColumns = document.querySelector('.threeColumns');

      // We need to figure out what the container within threeColumns is. As far as I know, it should be either mainSection or content, so we're going to check which one exists and use that.
      const container = contentDiv == null ? mainSection : contentDiv;

      let scrollingContainer;
      const contentStyles = getComputedStyle(container);
      if (contentStyles.overflowY === 'auto') {
         // On the homepage (and I think search and tag pages, but I haven't confirmed that yet), the scrolling element is content styles, but if we're looking at a thing card embedded within a thing, then the scrolling element is contentDiv. Here we're basically checking if the content node scrolls, and if it does we're assuming that's the one we want.
         scrollingContainer = container;
      } else {
         // Note we're still not handling looking at a thing within the my things sidebar. Will have to add that later.
         scrollingContainer = threeColumns;
      }

      changeContentButKeepInFrame(
         currentContentWrapperRef.current,
         scrollingContainer,
         () => setContentSliderPosition(newIndex)
      );
   };

   let translation = touchEnd - touchStart;

   // We don't want to start translating until they've swiped past a certain minimum amount, or else the swipe function will feel too wobbly.
   if (
      contentSliderPosition === 0 &&
      translation > minimumTranslationDistance * -1
   ) {
      translation = 0;
   }
   if (
      contentSliderPosition + 1 === contentArray.length &&
      translation < minimumTranslationDistance
   ) {
      translation = 0;
   }
   if (
      translation > minimumTranslationDistance * -1 &&
      translation < minimumTranslationDistance
   ) {
      translation = 0;
   }

   const commentsElement = (
      <ContentPieceComment
         comments={
            contentArray[contentSliderPosition]?.comments != null
               ? contentArray[contentSliderPosition].comments
               : []
         }
         id={contentArray[contentSliderPosition]?.id}
         key={contentArray[contentSliderPosition]?.id}
         input={
            <RichTextArea
               text={
                  commentTextObject[(contentArray[contentSliderPosition]?.id)]
               }
               postText={postNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={thingID}
               inputRef={commentInputRef}
            />
         }
      />
   );

   const contentElement = (
      <div className="contentArea">
         {showingComments ? (
            commentsElement
         ) : (
            <TruncCont cont={contentArray[contentSliderPosition]} limit={280} />
         )}
         <div className="commentsButtonComponentWrapper">
            <CommentsButton
               onClick={() => setShowingComments(!showingComments)}
               count={
                  contentArray[contentSliderPosition]?.comments?.length != null
                     ? contentArray[contentSliderPosition]?.comments?.length
                     : 0
               }
            />
         </div>
      </div>
   );

   const contentArea = (
      <div
         className="cardTouchWatcher"
         key={thingID}
         onTouchStart={e => {
            e.stopPropagation();
            setTouchStart(e.touches[0].clientX);
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchMove={e => {
            e.stopPropagation();
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchEnd={e => {
            e.stopPropagation();
            if (
               touchEnd - touchStart < -111 &&
               contentSliderPosition + 1 < contentArray.length
            ) {
               handleContentScrolling(contentSliderPosition + 1);
               setShowingComments(false);
            }
            if (touchEnd - touchStart > 111 && contentSliderPosition > 0) {
               handleContentScrolling(contentSliderPosition - 1);
               setShowingComments(false);
            }
            setTouchStart(0);
            setTouchEnd(0);
         }}
      >
         <div className="cardOverflowWrapper">
            <div className="cardPiecesContainer">
               {contentSliderPosition > 0 && (
                  <div
                     className={`previousContentWrapper${
                        translation <= 0 ? ' doesNotGiveSize' : ' givesSize'
                     }`}
                     style={{
                        transform: `translateX(calc(${translation}px - 100% - 2rem))`
                     }}
                  >
                     <TruncCont
                        cont={contentArray[contentSliderPosition - 1]}
                        limit={280}
                     />
                  </div>
               )}
               <div
                  className="currentContentWrapper"
                  style={{
                     transform: `translateX(calc(${translation}px - ${
                        contentSliderPosition > 0 ? '1' : '2'
                     }rem - ${contentSliderPosition > 0 ? '100' : '0'}% - ${
                        contentSliderPosition + 1 === contentArray.length &&
                        contentArray.length > 1
                           ? '1'
                           : '0'
                     }rem))`
                  }}
                  ref={currentContentWrapperRef}
               >
                  {contentElement}
               </div>
               {contentSliderPosition + 1 < contentArray.length && (
                  <div
                     className={`nextContentWrapper${
                        translation >= 0 ? ' doesNotGiveSize' : ' givesSize'
                     }`}
                     style={{
                        transform: `translateX(calc(${translation}px - ${
                           contentSliderPosition > 0 ? '100' : '0'
                        }%))`
                     }}
                  >
                     <TruncCont
                        cont={contentArray[contentSliderPosition + 1]}
                        limit={280}
                     />
                  </div>
               )}
            </div>
         </div>
      </div>
   );

   let contentSlider;
   if (contentArray.length > 0) {
      contentSlider = (
         <div className="contentSlider">
            {contentSliderPosition > 0 && (
               <ArrowIcon
                  pointing="left"
                  onClick={() => {
                     handleContentScrolling(contentSliderPosition - 1);
                     setShowingComments(false);
                  }}
               />
            )}
            {contentSliderPosition + 1} / {contentArray.length}
            {contentSliderPosition + 1 < contentArray.length && (
               <ArrowIcon
                  pointing="right"
                  onClick={() => {
                     handleContentScrolling(contentSliderPosition + 1);
                     setShowingComments(false);
                  }}
               />
            )}
         </div>
      );
   }

   return (
      <StyledSingleContent>
         {contentArray.length > 0 && contentArea}
         {(expanded !== true || contentArray.length > 1) && (
            <div className="sliderAndShowFormWrapper">
               {contentArray.length > 1 && contentSlider}
               <X
                  onClick={() =>
                     setShowingAddContentForm(!showingAddContentForm)
                  }
                  className={`showAddContentForm ${
                     showingAddContentForm ? 'collapse' : 'expand'
                  }`}
                  color="mainText"
               />
            </div>
         )}
         {canEdit && showingAddContentForm && (
            <div className="contentFormWrapper">
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
            </div>
         )}
      </StyledSingleContent>
   );
};

export default SingleContentSlider;
