import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { setAlpha } from '../../styles/functions';
import { dynamicallyResizeElement } from '../../styles/functions';

const StyledCommentInput = styled.form`
   display: flex;
   flex-wrap: wrap;
   justify-content: flex-end;
   textarea {
      width: 100%;
      height: calc(5rem + 3px);
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

const CommentInput = props => {
   const { currentComment, updateComment, postComment } = props;

   useEffect(() => {
      const inputs = document.querySelectorAll(`.commentInput`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            dynamicallyResizeElement(input);
         });
      }
      if (false) {
         // forcing eslint to include currentContent in the dependencies
         console.log(currentComment);
      }
   }, [currentComment]);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postComment();
      }
   };

   return (
      <StyledCommentInput>
         <textarea
            type="textarea"
            id="commentInput"
            className="commentInput"
            name="commentInput"
            placeholder="Add comment"
            value={currentComment}
            onChange={e => {
               updateComment(e.target.value);
               dynamicallyResizeElement(e.target);
            }}
            onKeyDown={e => handleKeyDown(e)}
         />
         <button type="submit" className="post">
            comment
         </button>
      </StyledCommentInput>
   );
};
CommentInput.propTypes = {
   currentComment: PropTypes.string.isRequired,
   updateComment: PropTypes.func.isRequired,
   postComment: PropTypes.func.isRequired
};

export default CommentInput;
