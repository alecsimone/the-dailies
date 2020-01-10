import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import { useContext, useState } from 'react';
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
         }
         ... on Tag {
            __typename
            id
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
      }
   }
`;

const StyledComment = styled.div`
   margin: 1rem 0;
   background: ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
   padding: 1rem;
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
            width: 3rem;
            height: 3rem;
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
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.highContrastGrey};
   }
`;

const Comment = props => {
   const { comment, type, id } = props;

   const { me, loading: memberLoading } = useContext(MemberContext);

   const [editComment] = useMutation(EDIT_COMMENT_MUTATION);
   const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);

   const [editing, setEditing] = useState(false);
   const [editedComment, setEditedComment] = useState(comment.comment);

   const handleKeyDown = async e => {
      if (e.key === 'Enter' && e.ctrlKey) {
         await editComment({
            variables: {
               commentID: comment.id,
               stuffID: id,
               type,
               newComment: editedComment
            }
         });
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
                        onKeyDown={handleKeyDown}
                     />
                  )}
               </div>
            </div>
            {me.id === comment.author.id && (
               <div className="buttons">
                  <img
                     className="deleteCommentButton"
                     src="/red-x.png"
                     alt="delete comment button"
                     onClick={() => {
                        deleteComment({
                           variables: {
                              commentID: comment.id,
                              stuffID: id,
                              type
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

export default Comment;
