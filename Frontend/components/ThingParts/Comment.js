import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { MemberContext } from '../Account/MemberProvider';
import RichText from '../RichText';
import CommentInput from './CommentInput';
import { ADD_COMMENT_MUTATION } from './Comments';
import { setAlpha, setLightness } from '../../styles/functions';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import DefaultAvatar from '../Icons/DefaultAvatar';
import TimeAgo from '../TimeAgo';

const DELETE_COMMENT_MUTATION = gql`
   mutation DELETE_COMMENT_MUTATION(
      $commentID: ID!
      $stuffID: ID!
      $type: String!
   ) {
      deleteComment(commentID: $commentID, stuffID: $stuffID, type: $type) {
         ... on Thing {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
         ... on Tag {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
         ... on Stack {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
      }
   }
`;

const EDIT_COMMENT_MUTATION = gql`
   mutation EDIT_COMMENT_MUTATION(
      $stuffID: ID!
      $commentID: ID!
      $type: String!
      $newComment: String!
   ) {
      editComment(
         stuffID: $stuffID
         commentID: $commentID
         type: $type
         newComment: $newComment
      ) {
         ... on Thing {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
         ... on Tag {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
         ... on Stack {
            __typename
            id
            comments {
               __typename
               id
               comment
            }
         }
      }
   }
`;

const StyledComment = styled.div`
   margin: 2rem 0;
   background: ${props => props.theme.midBlack};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   padding: 2rem;
   border-radius: 3px;
   .commentContent {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      .commentLeft {
         display: flex;
         align-items: flex-start;
         flex-grow: 1;
         img.avatar,
         svg.avatar {
            width: 4rem;
            min-width: 4rem;
            height: 4rem;
            border-radius: 100%;
            margin-right: 1.25rem;
         }
         .commentAndAuthorContainer {
            flex-grow: 1;
            padding-right: 2rem;
            a.author {
               color: ${props => props.theme.majorColor};
               margin-right: 0.5rem;
               font-weight: 700;
            }
            p:first-of-type {
               display: inline;
            }
            textarea.editCommentBox {
               width: 100%;
               padding: 0;
            }
         }
      }
      .buttons {
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-items: space-between;
         svg {
            width: 2rem;
            height: 2rem;
            opacity: 0.25;
            cursor: pointer;
            &:hover {
               opacity: 1;
            }
            &.editThis {
               margin-top: 1rem;
            }
         }
      }
   }
   .commentMeta {
      margin-top: 2rem;
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      a.replyLink {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
         margin-left: 0.5rem;
         cursor: pointer;
      }
   }
   .replyInputWrapper {
      margin-top: 2rem;
   }
`;

const Comment = ({ comment, comments, type, id }) => {
   const { me } = useContext(MemberContext);

   const [addComment] = useMutation(ADD_COMMENT_MUTATION);
   const [editComment] = useMutation(EDIT_COMMENT_MUTATION);
   const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);

   const [editing, setEditing] = useState(false);
   const [editedComment, setEditedComment] = useState(comment.comment);

   const [replying, setReplying] = useState(false);
   const [reply, setReply] = useState('');

   const sendCommentUpdate = async () => {
      const indexOfEditedComment = comments.findIndex(
         currentComment => currentComment.id === comment.id
      );
      comments[indexOfEditedComment].comment = editedComment;

      setEditing(false);
      await editComment({
         variables: {
            commentID: comment.id,
            stuffID: id,
            type,
            newComment: editedComment
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editComment: {
               __typename: type,
               id,
               comments
            }
         }
      });
   };

   const postReply = async () => {
      // We don't need these till we set up optimistic response for replies
      // const now = new Date();
      // const newComment = {
      //    __typename: 'Comment',
      //    author: {
      //       __typename: 'Member',
      //       avatar: me.avatar,
      //       displayName: me.displayName,
      //       id: me.id,
      //       rep: me.rep
      //    },
      //    comment: reply,
      //    createdAt: now.toISOString(),
      //    id: 'temporaryID',
      //    updatedAt: now.toISOString()
      // };
      await addComment({
         variables: {
            comment: reply,
            id,
            type,
            replyToID: comment.id
         }
      });
      setReply('');
      setReplying(false);
   };

   let replyElements;
   if (comment.replies?.length > 0) {
      replyElements = comment.replies.map(replyData => {
         /*
         Because I'm confused by writing recursive graphql queries, we're solving the problem this way. In our original stuff query, we got all the comments and all their data. But the connected replies only go one level deep, so we can't tunnel down the replies field all the way. Instead, we just grab the full data from the original stuff query and pass that.
         */
         const [fullReplyData] = comments.filter(
            fullData => fullData.id === replyData.id
         );

         // Deleted comments try to render sometime, even though they're not in comments anymore. But since they're deleted, we don't need to render them. Hence, return null.
         if (fullReplyData == null) return null;

         return (
            <Comment
               comment={fullReplyData}
               comments={comments}
               key={replyData.id}
               type={type}
               id={id}
            />
         );
      });
   }

   return (
      <StyledComment>
         <div className="commentContent">
            <div className="commentLeft">
               {comment.author.avatar != null ? (
                  <img
                     className="avatar"
                     src={comment.author.avatar}
                     alt="avatar"
                  />
               ) : (
                  <DefaultAvatar className="avatar" />
               )}
               <div className="commentAndAuthorContainer">
                  {!editing && (
                     <Link
                        href={{
                           pathname: '/member',
                           query: { id: comment.author.id }
                        }}
                     >
                        <a className="author">{comment.author.displayName}</a>
                     </Link>
                  )}
                  {!editing ? (
                     <RichText text={comment.comment} />
                  ) : (
                     <CommentInput
                        currentComment={editedComment}
                        updateComment={setEditedComment}
                        postComment={sendCommentUpdate}
                        isReply={comment.replyTo != null}
                     />
                  )}
               </div>
            </div>
            {me && me.id === comment.author.id && (
               <div className="buttons">
                  <X
                     className="deleteCommentButton"
                     onClick={() => {
                        const newComments = comments.filter(
                           currentComment => currentComment.id !== comment.id
                        );
                        deleteComment({
                           variables: {
                              commentID: comment.id,
                              stuffID: id,
                              type
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              deleteComment: {
                                 __typename: type,
                                 id,
                                 comments: newComments
                              }
                           }
                        });
                     }}
                  />
                  <EditThis onClick={() => setEditing(!editing)} />
               </div>
            )}
         </div>
         <div className="commentMeta">
            <TimeAgo time={comment.createdAt} toggleable />
            <a className="replyLink" onClick={() => setReplying(!replying)}>
               {replying ? 'Cancel Reply' : 'Reply'}
            </a>
         </div>
         {replying && (
            <div className="replyInputWrapper">
               <CommentInput
                  currentComment={reply}
                  updateComment={setReply}
                  postComment={postReply}
                  replyToID={comment.id}
                  isReply
               />
            </div>
         )}
         {replyElements}
      </StyledComment>
   );
};
Comment.propTypes = {
   comment: PropTypes.shape({
      comment: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      author: PropTypes.shape({
         avatar: PropTypes.string,
         id: PropTypes.string.isRequired,
         displayName: PropTypes.string.isRequired
      })
   }),
   comments: PropTypes.array.isRequired,
   type: PropTypes.oneOf(['Tag', 'Thing']).isRequired,
   id: PropTypes.string.isRequired
};

export default Comment;
