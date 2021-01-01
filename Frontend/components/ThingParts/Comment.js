import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { MemberContext } from '../Account/MemberProvider';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import { ADD_COMMENT_MUTATION } from './Comments';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { SINGLE_TAX_QUERY } from '../../pages/tag';
import { setAlpha, setLightness } from '../../styles/functions';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import DefaultAvatar from '../Icons/DefaultAvatar';
import TimeAgo from '../TimeAgo';
import TrashIcon from '../Icons/Trash';
import LinkIcon from '../Icons/Link';
import { home } from '../../config';
import VoteBar from './VoteBar';
import { commentFields } from '../../lib/CardInterfaces';

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
               ${commentFields}
            }
         }
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
               ${commentFields}
            }
         }
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

const StyledComment = styled.div`
   margin: 2rem 0;
   background: ${props => props.theme.midBlack};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   padding: 2rem;
   border-radius: 3px;
   &.highlighted {
      background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
   }
   .commentContent {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      position: relative;
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
               &.deleted {
                  color: ${props => props.theme.lowContrastGrey};
               }
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
            width: ${props => props.theme.smallText};
            cursor: pointer;
            margin-bottom: 1.5rem;
            &.editThis {
               opacity: 0.4;
            }
            &.trashIcon {
               opacity: 0.8;
            }
            &.linkIcon {
               opacity: 0.4;
            }
            &:hover {
               opacity: 1;
            }
         }
      }
   }
   .commentMeta {
      margin-top: 2rem;
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      display: flex;
      justify-content: space-between;
      align-items: center;
      a.replyLink {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
         margin-left: 0.5rem;
         cursor: pointer;
      }
      .metaRight {
         flex-grow: 1;
         .votebar {
            margin: 0 0 0 2rem;
            padding: 0;
            opacity: 0.8;
            .left {
               img.voteButton {
                  width: ${props => props.theme.smallText};
                  height: ${props => props.theme.smallText};
               }
            }
            .right {
               font-size: ${props => props.theme.smallText};
            }
         }
      }
   }
   .replyInputWrapper {
      margin-top: 2rem;
   }
`;

const Comment = ({
   comment,
   comments,
   linkedComment,
   type,
   id,
   selectComment
}) => {
   const { me } = useContext(MemberContext);

   const [addComment] = useMutation(ADD_COMMENT_MUTATION);
   const [editComment] = useMutation(EDIT_COMMENT_MUTATION);
   const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION);

   const [editing, setEditing] = useState(false);
   const [editedComment, setEditedComment] = useState(comment.comment);

   const [replying, setReplying] = useState(false);
   const [reply, setReply] = useState('');

   const [copied, setCopied] = useState(false);

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
      }).catch(err => {
         alert(err.message);
      });
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
         replyTo: {
            __typename: 'Comment',
            id: comment.id,
            author: comment.author,
            comment: comment.comment
         },
         replies: [],
         votes: [],
         updatedAt: now.toISOString()
      };
      comments.push(newComment);

      const originalCommentIndex = comments.findIndex(
         fullData => fullData.id === comment.id
      );
      if (
         originalCommentIndex != null &&
         comments[originalCommentIndex] != null
      ) {
         comments[originalCommentIndex].replies.push(newComment);
      }
      setReply('');
      setReplying(false);
      await addComment({
         variables: {
            comment: reply,
            id,
            type,
            replyToID: comment.id
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
                  case 'ContentPiece':
                     query = SINGLE_THING_QUERY;
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
                  data.addComment.comments; // replacing the comments data in the original query with the comments data we just got back from the mutation response
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
               linkedComment={linkedComment}
               key={replyData.id}
               type={type}
               id={id}
               selectComment={selectComment}
            />
         );
      });
   }
   let replyCount = 0;
   const countReplies = (thisComment, allComments) => {
      if (thisComment.replies?.length > 0) {
         thisComment.replies.forEach(thisReply => {
            const [fullReplyData] = allComments.filter(
               fullData => fullData.id === thisReply.id
            );
            if (
               fullReplyData != null &&
               fullReplyData.replies != null &&
               fullReplyData.replies.length > 0
            ) {
               countReplies(fullReplyData, allComments);
            }
            replyCount += 1;
         });
      }
   };
   countReplies(comment, comments);

   let authorAvatar = <DefaultAvatar className="avatar" />;
   let authorLink = (
      <Link
         href={{
            pathname: '/member',
            query: { id: comment.author.id }
         }}
      >
         <a
            className={
               comment.author.id === 'deleted' ? 'author deleted' : 'author'
            }
         >
            {comment.author.rep != null && `[${comment.author.rep}]`}{' '}
            {comment.author.displayName}
         </a>
      </Link>
   );
   if (comment.author.id === 'deleted') {
      authorAvatar = null;
      authorLink = null;
   } else if (comment.author.avatar != null) {
      authorAvatar = (
         <img className="avatar" src={comment.author.avatar} alt="avatar" />
      );
   }

   let commentClassList = 'comment';
   if (linkedComment === comment.id) {
      commentClassList += ' highlighted';
   }

   return (
      <StyledComment
         className={commentClassList}
         onClick={e => {
            if (selectComment != null) {
               selectComment(comment.id);
               e.stopPropagation();
            }
         }}
      >
         <div className="commentContent">
            <div className="commentLeft">
               {authorAvatar}
               <div className="commentAndAuthorContainer">
                  {!editing && authorLink}
                  {!editing ? (
                     <RichText text={comment.comment} key={comment.id} />
                  ) : (
                     <RichTextArea
                        text={editedComment}
                        setText={setEditedComment}
                        postText={sendCommentUpdate}
                        setEditable={setEditing}
                        placeholder="Add comment"
                        buttonText="comment"
                        id={comment.id}
                     />
                  )}
               </div>
            </div>

            <div className="buttons">
               {me && me.id === comment.author.id && (
                  <EditThis onClick={() => setEditing(!editing)} />
               )}
               {editing && (
                  <TrashIcon
                     className="deleteCommentButton"
                     onClick={() => {
                        if (
                           confirm(
                              'Are you sure you want to delete that comment?'
                           )
                        ) {
                           let newComments;
                           if (
                              comment.replies != null &&
                              comment.replies.length > 0
                           ) {
                              const commentIndex = comments.findIndex(
                                 comm => comm.id === comment.id
                              );
                              newComments = [...comments];
                              newComments[commentIndex].comment =
                                 '//[deleted]//';
                              newComments[commentIndex].author = {
                                 displayName: 'Deleted',
                                 id: 'deleted',
                                 avatar: null
                              };
                              setEditing(false);
                           } else {
                              newComments = comments.filter(
                                 currentComment =>
                                    currentComment.id !== comment.id
                              );
                           }
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
                        }
                     }}
                  />
               )}
               {copied ? (
                  'copied'
               ) : (
                  <LinkIcon
                     onClick={async () => {
                        await navigator.clipboard
                           .writeText(
                              `${home}/thing?id=${id}&comment=${comment.id}`
                           )
                           .catch(err => {
                              alert(err.message);
                           });
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                     }}
                  />
               )}
            </div>
         </div>
         <div className="commentMeta">
            <div className="metaLeft">
               <TimeAgo time={comment.createdAt} toggleable />
               {me != null && (
                  <a
                     className="replyLink"
                     onClick={() => setReplying(!replying)}
                  >
                     {replying ? 'Cancel Reply' : 'Reply'}
                  </a>
               )}
            </div>
            <div className="metaRight">
               <VoteBar type="Comment" id={comment.id} votes={comment.votes} />
            </div>
         </div>
         {replying && (
            <div className="replyInputWrapper">
               <RichTextArea
                  text={reply}
                  setText={setReply}
                  postText={postReply}
                  setEditable={setReplying}
                  placeholder="Add reply"
                  buttonText="reply"
                  id={`${comment.id}-reply`}
               />
            </div>
         )}
         {replyCount > 0 && (
            <div className="replyContainer">
               <div className="replyCount">
                  {replyCount} Repl{replyCount === 1 ? 'y' : 'ies'}
               </div>
               {replyElements}
            </div>
         )}
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
   type: PropTypes.oneOf(['Tag', 'Thing', 'ContentPiece']).isRequired,
   id: PropTypes.string.isRequired
};

export default Comment;
