import { useState } from 'react';
import Comment from './Comment';
import ArrowIcon from '../Icons/Arrow';

const ContentPieceComment = ({ comments, id, input }) => {
   const [commentView, setCommentView] = useState('collapsed'); // We have 3 view states: collapsed, expanded, and full
   const [selectedComment, setSelectedComment] = useState(false);
   const topLevelComments = comments.filter(comment => comment.replyTo == null);
   let commentElements;
   let siblingSlider;
   if (commentView === 'collapsed' || commentView === 'expanded') {
      commentElements = topLevelComments.map(comment => (
         <div
            className="commentWrapper"
            onClick={() => {
               setCommentView('full');
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
      const [selectedCommentData] = comments.filter(
         comment => comment.id === selectedComment
      );
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
      let siblingComments;
      if (selectedCommentData.replyTo == null) {
         siblingComments = topLevelComments;
      } else {
         const parentCommentBasicData = selectedCommentData.replyTo;
         const parentCommentID = parentCommentBasicData.id;
         const [parentComment] = comments.filter(
            comment => comment.id === parentCommentID
         );
         siblingComments = parentComment.replies;
      }

      if (siblingComments.length > 1) {
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
      arrowDirection = 'down';
   } else if (commentView === 'expanded') {
      arrowDirection = 'up';
   } else if (commentView === 'full') {
      arrowDirection = 'left';
   }
   return (
      <div className={`commentsArea ${commentView}`}>
         <div className={`commentsContainer ${commentView}`}>
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
               {siblingSlider}
               <ArrowIcon
                  className="commentDisplayControlArrow"
                  pointing={arrowDirection}
                  onClick={() => {
                     if (commentView === 'collapsed') {
                        setCommentView('expanded');
                     } else if (commentView === 'expanded') {
                        setCommentView('collapsed');
                     } else if (commentView === 'full') {
                        setCommentView('expanded');
                        setSelectedComment(false);
                     }
                  }}
               />
            </div>
         )}
      </div>
   );
};

export default ContentPieceComment;
