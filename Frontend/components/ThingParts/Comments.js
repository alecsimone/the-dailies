import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Comment from './Comment';
import CommentInput from './CommentInput';

const StyledComments = styled.section`
   header {
      text-align: center;
      margin: 3rem 0;
      font-weight: 600;
      font-size: ${props => props.theme.bigText};
   }
   .noComments {
      margin: 2rem;
   }
`;

const ADD_COMMENT_MUTATION = gql`
   mutation ADD_COMMENT_MUTATION($comment: String!, $id: ID!, $type: String!) {
      addComment(comment: $comment, id: $id, type: $type) {
         ... on Tag {
            __typename
            id
            comments {
               __typename
               id
               author {
                  __typename
                  id
                  displayName
                  avatar
                  rep
               }
               comment
               createdAt
               updatedAt
            }
         }
         ... on Thing {
            __typename
            id
            comments {
               __typename
               id
               author {
                  __typename
                  id
                  displayName
                  avatar
                  rep
               }
               comment
               createdAt
               updatedAt
            }
         }
      }
   }
`;

const Comments = props => {
   const { context } = props;
   const { comments, id, __typename: type } = useContext(context);

   const [currentComment, setCurrentComment] = useState('');

   let commentElements;
   if (comments.length > 0) {
      commentElements = comments.map(comment => (
         <Comment comment={comment} key={comment.id} type={type} id={id} />
      ));
   } else {
      commentElements = <div className="noComments">No Comments Yet</div>;
   }

   const [addComment] = useMutation(ADD_COMMENT_MUTATION);

   const sendNewComment = async () => {
      setCurrentComment('');
      await addComment({
         variables: {
            comment: currentComment,
            id,
            type
         }
      });
   };

   return (
      <StyledComments>
         <header>COMMENTS</header>
         {commentElements}
         <CommentInput
            currentComment={currentComment}
            updateComment={setCurrentComment}
            postComment={sendNewComment}
         />
      </StyledComments>
   );
};
Comments.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired
};

export default Comments;
