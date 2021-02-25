import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Comment from './Comment';
import ArrowIcon from '../Icons/Arrow';
import { setLightness, setAlpha } from '../../styles/functions';

const StyledContentPieceComment = styled.div`
   width: 100%;
   padding: 0;
   ${props => props.theme.midScreenBreakpoint} {
      padding: 0 2rem;
   }
   &.expanded,
   &.full {
      .commentsContainer {
         max-height: 40rem;
         overflow: hidden;
         ${props => props.theme.scroll};
         .comment .votebar {
            width: calc(100% - 2rem);
         }
      }
   }
   .commentsContainer {
      .comment {
         max-width: 900px;
      }
      &.collapsed {
         .commentMeta,
         .buttons,
         .replyContainer,
         .newCommentArea {
            display: none;
         }
         .newCommentArea.noComments {
            display: block;
            form.richTextArea {
               margin-top: 0;
            }
         }
         .comment {
            position: relative;
            padding: 1rem;
            margin: 1rem 0;
            cursor: pointer;
            max-height: 10rem;
            overflow: hidden;
            transition: all 0.2s;
            .commentAndAuthorContainer {
               margin-top: -1rem;
               padding-right: 0;
            }
            img.avatar {
               width: ${props => props.theme.smallText};
               min-width: ${props => props.theme.smallText};
               height: ${props => props.theme.smallText};
            }
            &:hover {
               background: ${props => props.theme.lightBlack};
               &:before {
                  background: linear-gradient(
                     transparent 7rem,
                     ${props => props.theme.lightBlack} 9.25rem
                  );
               }
            }
            &:before {
               content: '';
               width: 100%;
               height: 100%;
               position: absolute;
               left: 0;
               top: 0;
               background: linear-gradient(
                  transparent 7rem,
                  ${props => props.theme.midBlack} 9.25rem
               );
               transition: all none;
            }
         }
         .moreCommentsCount {
            font-size: ${props => props.theme.miniText};
            text-align: center;
            line-height: 1;
            cursor: pointer;
         }
      }
      &.expanded {
         .comment {
            cursor: pointer;
            .replyContainer {
               text-align: center;
               font-size: ${props => props.theme.tinyText};
               line-height: 1;
               padding-top: 1rem;
               margin-bottom: -1rem;
               .comment {
                  display: none;
               }
            }
            .buttons {
               display: none;
            }
            &:hover {
               background: ${props => props.theme.lightBlack};
            }
         }
         .newCommentArea {
            form.richTextArea {
               margin: 2rem 0 0;
               textarea {
                  min-height: 5.75rem;
               }
            }
         }
      }
      &.full {
         .replyCount,
         .newCommentArea {
            display: none;
         }
      }
   }
   .commentsControls {
      display: flex;
      align-items: center;
      justify-content: space-around;
      .siblingSlider {
         display: flex;
         align-items: center;
         svg.siblingSliderArrow {
            width: ${props => props.theme.bigText};
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
      svg.commentDisplayControlArrow {
         display: block;
         cursor: pointer;
         height: ${props => props.theme.bigHead};
         transition: all 0.2s;
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
   form {
      display: flex;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 4rem auto 0;
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
`;

const ContentPieceComment = ({ comments, id, input }) => {
   const [commentView, setCommentView] = useState('collapsed'); // We have 3 view states: collapsed, expanded, and full. Collapsed is supposed to be the default.
   const [selectedComment, setSelectedComment] = useState(false);
   const containerRef = useRef(null);

   const topLevelComments = comments.filter(comment => comment.replyTo == null);

   let commentElements;
   let siblingSlider;
   if (commentView === 'collapsed' || commentView === 'expanded') {
      // If the view is collapsed or expanded, we're going to show a list of comments. At the end of this conditional, we'll limit the number for collapsed view.
      commentElements = topLevelComments.map(comment => (
         <div
            className="commentWrapper"
            key={comment.id}
            onClick={() => {
               setCommentView('full');
               containerRef.current.scrollTop = 0;
               setSelectedComment(comment.id);
            }}
         >
            <Comment
               comment={comment}
               comments={comments}
               key={comment.id}
               type="ContentPiece"
               id={id}
            />
         </div>
      ));
   } else if (commentView === 'full') {
      // If the view is full, we're going to show only the selected comment
      const [selectedCommentData] = comments.filter(
         comment => comment.id === selectedComment
      );
      if (selectedCommentData != null) {
         commentElements = (
            <div className="commentWrapper">
               <Comment
                  comment={selectedCommentData}
                  comments={comments}
                  key={selectedCommentData.id}
                  type="ContentPiece"
                  id={id}
                  selectComment={setSelectedComment}
               />
            </div>
         );
      } else {
         setCommentView('collapsed');
         containerRef.current.scrollTop = 0;
         return null;
      }

      let siblingComments;
      if (selectedCommentData.replyTo == null) {
         // If this isn't a reply, then its siblings are the other top level comments
         siblingComments = topLevelComments;
      } else {
         // Otherwise we get the full data from our master comment list to find the siblings
         const parentCommentBasicData = selectedCommentData.replyTo;
         const parentCommentID = parentCommentBasicData.id;
         const [parentComment] = comments.filter(
            comment => comment.id === parentCommentID
         );
         siblingComments = parentComment.replies;
      }

      if (siblingComments.length > 1) {
         // If there are siblings, we build a nav to move between them
         const thisCommentIndex = siblingComments.findIndex(
            comment => comment.id === selectedCommentData.id
         );
         siblingSlider = (
            <div className="siblingSlider">
               {thisCommentIndex > 0 && (
                  <ArrowIcon
                     className="siblingSliderArrow"
                     pointing="left"
                     onClick={() =>
                        setSelectedComment(
                           siblingComments[thisCommentIndex - 1].id
                        )
                     }
                  />
               )}
               {thisCommentIndex + 1} / {siblingComments.length}
               {thisCommentIndex + 1 < siblingComments.length && (
                  <ArrowIcon
                     className="siblingSliderArrow"
                     pointing="right"
                     onClick={() =>
                        setSelectedComment(
                           siblingComments[thisCommentIndex + 1].id
                        )
                     }
                  />
               )}
            </div>
         );
      }
   }
   if (commentView === 'collapsed') {
      commentElements = commentElements.filter((comment, index) => index < 3);
   }
   let arrowDirection;
   if (commentView === 'collapsed') {
      arrowDirection = 'down'; // to expand
   } else if (commentView === 'expanded') {
      arrowDirection = 'up'; // to collapse
   } else if (commentView === 'full') {
      arrowDirection = 'right'; // to go back
   }

   return (
      <StyledContentPieceComment className={`commentsArea ${commentView}`}>
         <div className={`commentsContainer ${commentView}`} ref={containerRef}>
            {commentElements}
            {commentView === 'collapsed' && topLevelComments.length > 3 && (
               <div
                  className="moreCommentsCount"
                  onClick={() => setCommentView('expanded')}
               >
                  {topLevelComments.length - 3} more threads
               </div>
            )}
            <div
               className={
                  comments.length > 0
                     ? 'newCommentArea'
                     : 'newCommentArea noComments'
               }
            >
               {input}
            </div>
         </div>
         {comments.length > 0 && (
            <div className="commentsControls">
               <ArrowIcon
                  className="commentDisplayControlArrow"
                  pointing={arrowDirection}
                  onClick={() => {
                     if (commentView === 'collapsed') {
                        setCommentView('expanded');
                        containerRef.current.scrollTop = 0;
                     } else if (commentView === 'expanded') {
                        setCommentView('collapsed');
                        containerRef.current.scrollTop = 0;
                     } else if (commentView === 'full') {
                        setCommentView('expanded');
                        containerRef.current.scrollTop = 0;
                        setSelectedComment(false);
                     }
                  }}
               />
               {siblingSlider}
            </div>
         )}
      </StyledContentPieceComment>
   );
};

export default ContentPieceComment;
