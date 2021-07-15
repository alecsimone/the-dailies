import React, { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import FeaturedImage from '../ThingParts/FeaturedImage';
import TruncCont from '../ThingParts/TruncCont';
import ContentPieceComments from '../ThingParts/ContentPieceComments';
import RichTextArea from '../RichTextArea';
import Taxes from '../ThingParts/Taxes';
import { setAlpha, setLightness } from '../../styles/functions';
import {
   orderContent,
   changeContentButKeepInFrame
} from '../../lib/ContentHandling';
import AuthorLink from '../ThingParts/AuthorLink';
import VoteBar from '../ThingParts/VoteBar';
import TimeAgo from '../TimeAgo';
import ArrowIcon from '../Icons/Arrow';
import CommentsButton from '../ThingParts/CommentsButton';
import { MemberContext } from '../Account/MemberProvider';
import { ADD_COMMENT_MUTATION } from '../ThingParts/Comments';
import CardGenerator from './CardGenerator';
import { minimumTranslationDistance } from '../../config';
import ThingMeta from '../ThingParts/ThingMeta';
import TaxBox from '../ThingParts/TaxBox';

const StyledThingCard = styled.article`
   position: relative;
   display: block;
   width: 100%;
   max-width: 1200px;
   padding: 0 1.5rem;
   background: ${props => props.theme.lightBlack};
   box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.deepBlack, 0.4)};
   &:hover {
      background: ${props => setLightness(props.theme.lightBlack, 8.5)};
      box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.midBlack, 0.4)};
   }
   ${props => props.theme.mobileBreakpoint} {
      border-radius: 3px;
      padding: 0 2.5rem 1.25rem;
   }
   a:hover {
      text-decoration: none;
   }
   img, video {
      max-width: 100%;
   }
   .featuredImage {
      width: calc(100% + 3rem);
      margin: 0 -1.5rem;
      padding: 2rem 1.5rem;
      ${props => props.theme.mobileBreakpoint} {
         width: calc(100% + 5rem);
         margin: 0 -2.5rem;
         padding: 2rem 2.5rem;
      }
      h3 {
         /* color: ${props => setAlpha(props.theme.mainText, 0.9)}; */
         font-weight: 500;
         font-size: ${props => props.theme.bigText};
         line-height: 1.2;
         &:hover {
            text-decoration: underline;
         }
      }
      .featuredImageWrapper {
         max-width: 100%;
         margin: 0;
      }
      img.featured,
      video {
         width: 100%;
         max-height: 30rem;
         object-fit: contain;
         margin-top: 2.5rem;
      }
      img.featuredImage {
         object-fit: cover;
      }
      video {
         object-fit: contain;
      }
      .tweet {
         /* max-height: 50rem; */
         margin-top: 2.5rem;
         ${props => props.theme.scroll};
         .tweet {
            max-height: none;
         }
      }
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
         margin-left: calc(50% - .5rem); /* That .5rem is pretty arbitrary afaik */
      }
      .commentsControls {
         .arrow {
            margin-left: 3rem /* On this one we're making up for the off-centerness caused by putting padding right to allow space for the comment button */
         }
      }
      .thingCard {
         background: ${props => props.theme.midBlack};
      }

   }
   .meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      color: ${props => props.theme.lowContrastGrey};
      margin-top: 1.5rem;
      .meta-left {
         display: inline-flex;
         align-items: center;
         margin-right: 2rem;
         a,
         a:visited {
            color: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
            line-height: 0;
            &:hover {
               color: ${props => setLightness(props.theme.majorColor, 50)};
               text-decoration: none;
            }
         }
         .thingMeta {
            margin: 0;
            padding: 0;
         }
         .authorBlock {
            display: inline-flex;
            align-items: center;
            margin-right: 1rem;
            cursor: pointer;
            .authorLink {
               margin-bottom: 2px;
            }
            .authorImg {
               width: ${props => props.theme.smallText};;
               height: ${props => props.theme.smallText};;
               border-radius: 100%;
               margin-right: 1rem;
            }
         }
         span.privacy {
            margin-left: 1rem;
         }
      }
      .meta-right {
         display: inline-block;
         .tags {
            color: ${props => props.theme.mainText};
            a, a:visited {
               &:hover {
                  text-decoration: underline;
               }
            }
         }
         .taxboxContainer {
            margin-top: 0;
         }
      }
      .meta-left, .meta-right {
         margin-bottom: 1rem;
      }
   }
   .cardTouchWatcher {
      .cardOverflowWrapper {
         width: 100%;
         overflow: hidden;
         .cardPiecesContainer {
            width: 300%;
            display: flex;
            .previousContentWrapper, .currentContentWrapper, .nextContentWrapper {
               display: inline-block;
               background: ${props => props.theme.midBlack};
               width: 33.3%;
               margin: 3rem 0;
               padding: .8rem calc(${props =>
                  props.theme.smallText} + 2.25rem) .8rem 1.75rem;
               border: 1px solid ${props =>
                  setAlpha(props.theme.lowContrastGrey, 0.25)};
               border-radius: 3px;
            }
            .currentContentWrapper {
               margin: 3rem 1.5rem;
               /* max-height: 400px; */
               ${props => props.theme.scroll};
               /* touch-action: none; */
               ${props => props.theme.midScreenBreakpoint} {
                  /* max-height: 600px; */
                  margin: 1rem
               }
            }
            .givesSize {
               height: auto;
            }
            .doesNotGiveSize {
               height: 0;
            }
         }
      }
   }
   .contentSlider {
      display: flex;
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
   .votebar {
      width: calc(100% + 3rem);
      margin: 1rem -1.5rem 0;
   }
   #arrowWrapper {
      svg.arrow {
         width: ${props => props.theme.smallHead};
         display: block;
         margin: 1rem auto 0;
      }
   }
`;

const ThingCardContext = React.createContext();

const ThingCard = ({ data, setExpanded, borderSide }) => {
   const {
      id,
      featuredImage,
      color,
      author,
      privacy,
      content,
      copiedInContent,
      contentOrder,
      partOfTags: tags,
      votes,
      summary,
      createdAt
   } = data;

   const [contentSliderPosition, setContentSliderPosition] = useState(0);
   const currentContentWrapperRef = useRef(null);

   const [showingComments, setShowingComments] = useState(false);
   const [touchStart, setTouchStart] = useState(0);
   const [touchStartY, setTouchStartY] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   const { lowContrastGrey, midScreenBPWidthRaw } = useContext(ThemeContext);
   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (me.id === author.id) {
      canEdit = true;
   }
   if (me.role === 'Admin' || me.role === 'Editor') {
      canEdit = true;
   }

   // First let's make our array of the orderedContent so we can add comments to it when we need to
   let fullContent;
   if (copiedInContent != null && copiedInContent.length > 0) {
      fullContent = content.concat(copiedInContent);
   } else {
      fullContent = content;
   }
   const contentArray = orderContent(fullContent, contentOrder);
   const contentPossiblyWithSummaryArray = [...contentArray];
   if (
      summary != null &&
      summary !== '' &&
      !contentPossiblyWithSummaryArray.includes(summary)
   ) {
      contentPossiblyWithSummaryArray.unshift(summary);
   }

   // We need an object whose properties are the ids of all the content pieces on this thing, each of which starts out with an empty string, and put that in state for the comment text
   const contentCommentsObject = {};
   content.forEach(piece => {
      contentCommentsObject[piece.id] = '';
   });
   const [commentTextObject, setCommentTextObject] = useState(
      contentCommentsObject
   );

   // This ref will be passed down to the RichTextArea that will be in the comments section for content pieces, and we'll use it to get the value of that textarea for our postNewComment mutation
   const commentInputRef = useRef(null);

   // Then we need a function to switch an individual value in that object
   const handleCommentChanges = (pieceID, newValue) => {
      setCommentTextObject(prevState => ({
         ...prevState,
         [pieceID]: newValue
      }));
   };

   const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      onError: err => alert(err.message)
   });

   if (data == null || content == null) {
      return <CardGenerator id={id} cardType="regular" />;
   }

   const handleContentScrolling = newIndex => {
      currentContentWrapperRef.current.scrollTop = 0;

      const contentDiv = document.querySelector('.content');
      const threeColumns = document.querySelector('.threeColumns');

      let scrollingContainer;
      const contentStyles = getComputedStyle(contentDiv);
      if (contentStyles.overflowY === 'auto') {
         // On the homepage (and I think search and tag pages, but I haven't confirmed that yet), the scrolling element is content styles, but if we're looking at a thing card embedded within a thing, then the scrolling element is contentDiv. Here we're basically checking if the content node scrolls, and if it does we're assuming that's the one we want.
         scrollingContainer = contentDiv;
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

   // And finally a function to send new comments to the server
   const postNewComment = async () => {
      const pieceID = contentPossiblyWithSummaryArray[contentSliderPosition].id;
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

      contentPossiblyWithSummaryArray[contentSliderPosition].comments.push(
         newComment
      );

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
               comments:
                  contentPossiblyWithSummaryArray[contentSliderPosition]
                     .comments
            }
         }
      }).catch(err => {
         alert(err.message);
      });
      inputElement.value = ''; // We need to clear the input after commenting
      // TODO: Add the update function a la Comments.js line 192
   };

   let highlightColor = lowContrastGrey;
   if (color != null) {
      highlightColor = color;
   }

   let translation = touchEnd - touchStart;
   if (
      contentSliderPosition === 0 &&
      translation > minimumTranslationDistance * -1
   ) {
      translation = 0;
   }
   if (
      contentSliderPosition + 1 === contentPossiblyWithSummaryArray.length &&
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
      <ContentPieceComments
         comments={
            contentPossiblyWithSummaryArray[contentSliderPosition]?.comments !=
            null
               ? contentPossiblyWithSummaryArray[contentSliderPosition].comments
               : []
         }
         id={contentPossiblyWithSummaryArray[contentSliderPosition]?.id}
         key={contentPossiblyWithSummaryArray[contentSliderPosition]?.id}
         input={
            <RichTextArea
               text={
                  commentTextObject[
                     (contentPossiblyWithSummaryArray[contentSliderPosition]
                        ?.id)
                  ]
               }
               postText={postNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={id}
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
            <TruncCont
               cont={contentPossiblyWithSummaryArray[contentSliderPosition]}
               limit={280}
            />
         )}
         {(contentSliderPosition > 0 || summary == null || summary === '') && (
            <div className="commentsButtonComponentWrapper">
               <CommentsButton
                  onClick={() => setShowingComments(!showingComments)}
                  count={
                     contentPossiblyWithSummaryArray[contentSliderPosition]
                        ?.comments?.length != null
                        ? contentPossiblyWithSummaryArray[contentSliderPosition]
                             ?.comments?.length
                        : 0
                  }
               />
            </div>
         )}
      </div>
   );

   const contentArea = (
      <div
         className="cardTouchWatcher"
         key={id}
         onTouchStart={e => {
            e.stopPropagation();
            setTouchStart(e.touches[0].clientX);
            setTouchStartY(e.touches[0].clientY);
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchMove={e => {
            e.stopPropagation();

            // Not using this as it loses the native touch scroll function's flick ability, and the native behavior isn't so bad now that I've made this part scroll instead of the whole page
            // if (translation === 0) {
            //    const touchWatcher = e.target.closest(
            //       '.currentContentWrapper'
            //    );
            //    const initialScroll = touchWatcher.scrollTop;
            //    const scrollDistance = touchStartY - e.touches[0].clientY;
            //    const newScroll = initialScroll + scrollDistance;
            //    touchWatcher.scrollTop = newScroll;
            //    setTouchStartY(e.touches[0].clientY);
            // }

            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchEnd={e => {
            e.stopPropagation();
            if (
               touchEnd - touchStart < -111 &&
               contentSliderPosition + 1 <
                  contentPossiblyWithSummaryArray.length
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
                        cont={
                           contentPossiblyWithSummaryArray[
                              contentSliderPosition - 1
                           ]
                        }
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
                        contentSliderPosition + 1 ===
                           contentPossiblyWithSummaryArray.length &&
                        contentPossiblyWithSummaryArray.length > 1
                           ? '1'
                           : '0'
                     }rem))`
                  }}
                  ref={currentContentWrapperRef}
               >
                  {contentElement}
               </div>
               {contentSliderPosition + 1 <
                  contentPossiblyWithSummaryArray.length && (
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
                        cont={
                           contentPossiblyWithSummaryArray[
                              contentSliderPosition + 1
                           ]
                        }
                        limit={280}
                     />
                  </div>
               )}
            </div>
         </div>
      </div>
   );

   let contentSlider;
   if (contentPossiblyWithSummaryArray.length > 0) {
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
            {contentSliderPosition + 1} /{' '}
            {contentPossiblyWithSummaryArray.length}
            {contentSliderPosition + 1 <
               contentPossiblyWithSummaryArray.length && (
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
      <ThingCardContext.Provider value={data}>
         <StyledThingCard
            className="regularThingCard thingCard"
            style={{
               [borderSide === 'left'
                  ? 'borderLeft'
                  : 'borderTop']: `0.5rem solid ${highlightColor}`
            }}
         >
            {!featuredImage?.toLowerCase().includes('twitter.com') && (
               <Link href={{ pathname: '/thing', query: { id } }}>
                  <a>
                     <FeaturedImage
                        context={ThingCardContext}
                        key={`${id}-FeaturedImage`}
                        titleLimit={120}
                        canEdit={false}
                     />
                  </a>
               </Link>
            )}
            {featuredImage?.toLowerCase().includes('twitter.com') && (
               <FeaturedImage
                  context={ThingCardContext}
                  key={`${id}-FeaturedImage`}
                  titleLimit={120}
                  canEdit={false}
                  titleLink={{ pathname: '/thing', query: { id } }}
               />
            )}

            {contentPossiblyWithSummaryArray.length > 0 && contentArea}
            {contentPossiblyWithSummaryArray.length > 1 && contentSlider}
            <div className="meta">
               <div className="meta-left">
                  <ThingMeta
                     key={`${id}-ThingMeta`}
                     canEdit={canEdit}
                     context={ThingCardContext}
                  />
               </div>
               <div className="meta-right">
                  <TaxBox
                     key={`${id}-TagBox`}
                     canEdit={canEdit}
                     personal={false}
                     context={ThingCardContext}
                  />
               </div>
            </div>
            <VoteBar votes={votes} id={id} type="Thing" />
            {setExpanded != null && (
               <div id="arrowWrapper">
                  <ArrowIcon
                     pointing="up"
                     onClick={e => {
                        e.stopPropagation();
                        setExpanded(false);
                     }}
                  />
               </div>
            )}
         </StyledThingCard>
      </ThingCardContext.Provider>
   );
};
ThingCard.propTypes = {
   data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
      author: PropTypes.object,
      privacy: PropTypes.string,
      content: PropTypes.arrayOf(PropTypes.object),
      partOfTags: PropTypes.arrayOf(PropTypes.object),
      createdAt: PropTypes.string
   })
};

export default ThingCard;
