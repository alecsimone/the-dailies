import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useEffect, useState, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { MemberContext } from '../Account/MemberProvider';
import { ADD_COMMENT_MUTATION } from './Comments';
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
   replyToID,
   stuffID,
   type,
   setReplying
}) => {
   const { me } = useContext(MemberContext);
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

   const [reply, setReply] = useState('');

   const [addComment] = useMutation(ADD_COMMENT_MUTATION);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         if (updateComment == null) {
            postReply();
         } else {
            postComment();
         }
      }
   };

   const postReply = async () => {
      const now = new Date();
      const newComment = {
         __typename: 'Comment',
         author: {
            __typename: 'Member',
            avatar: me.avatar,
            displayName: me.displayName,
            id: me.id,
            rep: me.rep
         },
         comment: reply,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         updatedAt: now.toISOString()
      };
      await addComment({
         variables: {
            comment: reply,
            id: stuffID,
            type,
            replyToID
         }
      });
      setReply('');
      setReplying(false);
   };

   return (
      <StyledCommentInput
         onSubmit={e => {
            e.preventDefault();
            console.log('hey');
            if (updateComment == null) {
               console.log('a');
               // postReply();
            } else {
               console.log('b');
               // postComment();
            }
         }}
      >
         <textarea
            type="textarea"
            id="commentInput"
            className="commentInput"
            name="commentInput"
            placeholder={replyToID == null ? 'Add comment' : 'Add reply'}
            value={updateComment == null ? reply : currentComment}
            onChange={e => {
               if (updateComment != null) {
                  updateComment(e.target.value);
               } else {
                  setReply(e.target.value);
               }
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
