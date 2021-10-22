import gql from 'graphql-tag';
import styled from 'styled-components';
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Comment from './Comment';
import RichTextArea from '../RichTextArea';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { SINGLE_TAX_QUERY } from '../../pages/tag';
import { setAlpha } from '../../styles/functions';
import { commentFields } from '../../lib/CardInterfaces';
import useMe from '../Account/useMe';
import useThingData from '../ThingCards/useThingData';

const StyledComments = styled.section`
   padding: 1rem;
   background: ${props => props.theme.midBlack};
   ${props => props.theme.mobileBreakpoint} {
      padding: 1rem 2rem;
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      border-radius: 0.5rem;
   }
   header {
      text-align: center;
      margin: 3rem 0;
      margin-top: 1rem;
      font-weight: 600;
      font-size: ${props => props.theme.bigText};
   }
   .noComments {
      margin: 2rem;
   }
   .richTextArea {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      max-width: 900px;
      margin: auto;
      textarea {
         width: 100%;
         height: calc(5rem + 3px);
         position: relative;
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
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
         .styleGuideLink {
            opacity: 0.7;
            display: inline-block;
            font-size: ${props => props.theme.tinyText};
         }
      }
   }
   .comment {
      .commentLeft {
         max-width: 1000px;
      }
      .replyCount {
         display: none;
      }
   }
`;

const ADD_COMMENT_MUTATION = gql`
   mutation ADD_COMMENT_MUTATION(
      $comment: String!
      $id: ID!
      $type: String!
      $replyToID: ID
   ) {
      addComment(
         comment: $comment
         id: $id
         type: $type
         replyToID: $replyToID
      ) {
         ... on Tag {
            __typename
            id
            comments {
               ${commentFields}
            }
         }
         ... on Stack {
            __typename
            id
            comments {
               ${commentFields}
            }
         }
         ... on Thing {
            __typename
            id
            comments {
               ${commentFields}
            }
         }
         ... on ContentPiece {
            __typename
            id
            comments {
               ${commentFields}
            }
         }
      }
   }
`;
export { ADD_COMMENT_MUTATION };

const Comments = ({ id, type, linkedComment }) => {
   const {
      loggedInUserID,
      memberFields: { avatar, displayName, rep }
   } = useMe('Comments', 'avatar displayName rep');

   const { comments } = useThingData(
      id,
      'Comments',
      `comments {${commentFields}}`
   );

   // This ref will be passed down to the RichTextArea that allows us to comment on the thing, and we'll use it to get the value for our sendNewComment mutation
   const commentInputRef = useRef(null);

   let commentElements;

   if (comments && comments.length > 0) {
      const topLevelComments = comments.filter(
         comment => comment.replyTo == null
      );

      commentElements = topLevelComments.map(comment => (
         <Comment
            comment={comment}
            comments={comments}
            key={comment.id}
            linkedComment={linkedComment}
            type={type}
            id={id}
         />
      ));
   } else {
      commentElements = <div className="noComments">No Comments Yet</div>;
   }

   const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      onError: err => alert(err.message)
   });

   const sendNewComment = async () => {
      const inputElement = commentInputRef.current;
      const commentText = inputElement.value;

      const now = new Date();
      const newComment = {
         __typename: 'Comment',
         author: {
            __typename: 'Member',
            avatar,
            displayName,
            id: loggedInUserID,
            rep
         },
         comment: commentText,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         votes: [],
         updatedAt: now.toISOString()
      };
      comments.push(newComment);

      inputElement.value = '';
      await addComment({
         variables: {
            comment: commentText,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addComment: {
               __typename: type,
               id,
               comments
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't. So once we get the actual id of the new comment back from the server, we update the cache to add it.
               let query;
               switch (data.addComment.__typename) {
                  case 'Thing':
                     query = SINGLE_THING_QUERY;
                     break;
                  case 'Tag':
                     query = SINGLE_TAX_QUERY;
                     break;
                  case 'Stack':
                     query = SINGLE_TAX_QUERY;
                     break;
                  default:
                     console.log('Unknown stuff type');
                     return;
               }
               const oldData = client.readQuery({
                  query,
                  variables: { id }
               });
               oldData[data.addComment.__typename.toLowerCase()].comments =
                  data.addComment.comments;
               client.writeQuery({
                  query,
                  variables: { id },
                  data: oldData
               });
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   return (
      <StyledComments className="commentsSection">
         <header>COMMENTS</header>
         {commentElements}
         {loggedInUserID && (
            <RichTextArea
               text=""
               postText={sendNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={`${id}-comment`}
               inputRef={commentInputRef}
            />
         )}
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
