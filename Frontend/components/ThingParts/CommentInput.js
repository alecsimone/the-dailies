import styled from 'styled-components';
import PropTypes from 'prop-types';
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

const CommentInput = ({
   currentComment,
   updateComment,
   postComment,
   isReply
}) => {
   // useEffect(() => {
   //    // Effect to keep the input the same size as its contents, which I'm commenting out because apparently I'm doing it when updating the contents too, so this should be redundant
   //    const inputs = document.querySelectorAll(`.commentInput`);
   //    if (inputs.length > 0) {
   //       inputs.forEach(input => {
   //          dynamicallyResizeElement(input);
   //       });
   //    }
   //    if (false) {
   //       // forcing eslint to include currentContent in the dependencies
   //       console.log(currentComment);
   //    }
   // }, [currentComment]);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postComment();
      }
   };

   return (
      <StyledCommentInput
         onSubmit={e => {
            e.preventDefault();
            postComment();
         }}
      >
         <textarea
            type="textarea"
            id="commentInput"
            className="commentInput"
            name="commentInput"
            placeholder={isReply ? 'Add comment' : 'Add reply'}
            value={currentComment}
            onChange={e => {
               updateComment(e.target.value);
               dynamicallyResizeElement(e.target);
            }}
            onKeyDown={e => handleKeyDown(e)}
         />
         <button type="submit" className="post">
            {isReply ? 'reply' : 'comment'}
         </button>
      </StyledCommentInput>
   );
};
CommentInput.propTypes = {
   currentComment: PropTypes.string.isRequired,
   updateComment: PropTypes.func.isRequired,
   postComment: PropTypes.func.isRequired,
   isReply: PropTypes.bool
};

export default CommentInput;
