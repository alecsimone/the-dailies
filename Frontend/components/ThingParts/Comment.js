import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { MemberContext } from '../Account/MemberProvider';
import LinkyText from '../LinkyText';
import { setAlpha } from '../../styles/functions';
import { convertISOtoAgo } from '../../lib/ThingHandling';

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
         ... on Category {
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
         ... on Category {
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
   background: ${props => props.theme.black};
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
         img.avatar {
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
         display: none;
         @media screen and (min-width: 800px) {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-items: space-between;
         }
         img {
            width: 2rem;
            height: 2rem;
            opacity: 0.25;
            cursor: pointer;
            &:hover {
               opacity: 1;
            }
            &.editCommentButton {
               margin-top: 1rem;
            }
         }
      }
   }
   .commentMeta {
      margin-top: 2rem;
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
   }
`;

const Comment = props => {
   const { comment, comments, type, id } = props;

   const { me, loading: memberLoading } = useContext(MemberContext);

   const [editComment] = useMutation(EDIT_COMMENT_MUTATION);
   const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);

   const [editing, setEditing] = useState(false);
   const [editedComment, setEditedComment] = useState(comment.comment);

   const handleKeyDown = async e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
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
      }
      if (e.key === 'Escape') {
         setEditing(false);
      }
   };

   return (
      <StyledComment>
         <div className="commentContent">
            <div className="commentLeft">
               <img
                  className="avatar"
                  src={
                     comment.author.avatar
                        ? comment.author.avatar
                        : '/defaultAvatar.jpg'
                  }
                  alt="avatar"
               />
               <div className="commentAndAuthorContainer">
                  {!editing && (
                     <Link
                        href={{ pathname: '/member', query: comment.author.id }}
                     >
                        <a className="author">{comment.author.displayName}</a>
                     </Link>
                  )}
                  {!editing ? (
                     <LinkyText text={comment.comment} />
                  ) : (
                     <textarea
                        className="editCommentBox"
                        placeholder="Edit comment"
                        onChange={e => setEditedComment(e.target.value)}
                        value={editedComment}
                        onKeyDown={e => {
                           e.persist();
                           handleKeyDown(e);
                        }}
                        style={{
                           height: `${
                              editedComment.length > 240
                                 ? editedComment.length / 2
                                 : 120
                           }px`
                        }}
                     />
                  )}
               </div>
            </div>
            {me && me.id === comment.author.id && (
               <div className="buttons">
                  <img
                     className="deleteCommentButton"
                     src="/red-x.png"
                     alt="delete comment button"
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
                  <img
                     className="editCommentButton"
                     src="/edit-this.png"
                     alt="edit comment button"
                     onClick={() => setEditing(!editing)}
                  />
               </div>
            )}
         </div>
         <div className="commentMeta">
            {convertISOtoAgo(comment.createdAt)} ago
         </div>
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
