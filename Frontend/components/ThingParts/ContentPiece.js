import { useState, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import EditThis from '../Icons/EditThis';
import TrashIcon from '../Icons/Trash';
import LinkIcon from '../Icons/Link';
import ContentPieceComments from './ContentPieceComments';
import { home } from '../../config';
import { ADD_COMMENT_MUTATION } from './Comments';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import ReorderIcon from '../Icons/Reorder';

const ContentPiece = ({
   id,
   thingID,
   rawContentString,
   comments,
   deleteContentPiece,
   editContentPiece,
   canEdit,
   setReordering,
   reordering,
   highlighted
}) => {
   const [editable, setEditable] = useState(false);
   const [copied, setCopied] = useState(false);
   const [showingComments, setShowingComments] = useState(comments.length > 0);

   const [editedContent, setEditedContent] = useState(rawContentString);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postContent();
      }
   };

   const postContent = () => {
      editContentPiece(id, editedContent);
      setEditable(false);
   };

   const { me } = useContext(MemberContext);

   const [commentText, setCommentText] = useState('');
   const [addComment] = useMutation(ADD_COMMENT_MUTATION);
   const sendNewComment = async () => {
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
         comment: commentText,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         votes: [],
         updatedAt: now.toISOString()
      };
      comments.push(newComment);

      setCommentText('');
      await addComment({
         variables: {
            comment: commentText,
            id,
            type: 'ContentPiece'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addComment: {
               __typename: 'ContentPiece',
               id,
               comments
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't. So once we get the actual id of the new comment back from the server, we update the cache to add it.
               const query = SINGLE_THING_QUERY;
               const oldData = client.readQuery({
                  query,
                  variables: { id: thingID }
               });
               const thisContentPieceIndex = oldData.thing.content.findIndex(
                  piece => piece.id === data.addComment.id
               );
               oldData.thing.content[thisContentPieceIndex].comments =
                  data.addComment.comments;
               client.writeQuery({
                  query,
                  variables: { id: thingID },
                  data: oldData
               });
            }
         }
      });
   };

   let content;
   if (!editable) {
      content = <RichText text={rawContentString} key={id} />;
   } else {
      content = (
         <RichTextArea
            text={editedContent}
            setText={setEditedContent}
            postText={postContent}
            setEditable={setEditable}
            placeholder="Add content"
            buttonText="add"
            id={id}
         />
      );
   }

   return (
      <div
         className={highlighted ? 'contentBlock highlighted' : 'contentBlock'}
         key={id}
      >
         <div className="contentArea">
            <div
               className={canEdit ? 'contentPiece editable' : 'contentPiece'}
               key={id}
               onMouseUp={e => {
                  if (!canEdit || reordering) return;

                  // If it's a right click, we don't want to switch to editing
                  if (e.button !== 0) return;

                  // If they clicked a link, we don't want to switch to editing
                  if (e.target.closest('a') != null) return;
                  // same for a thingCard
                  if (e.target.closest('.thingCard') != null) return;

                  const selection = window.getSelection();
                  if (selection.type === 'Caret' && !editable) {
                     setEditable(true);
                  }
               }}
            >
               {content}
            </div>
            <div className="buttons buttonsContainer">
               <div
                  className="commentButton"
                  onClick={() => setShowingComments(!showingComments)}
               >
                  C
               </div>
               {canEdit && (
                  <EditThis
                     className="edit buttons"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => {
                        if (!editable) {
                           setEditable(true);
                           return;
                        }
                        if (rawContentString !== editedContent) {
                           if (!confirm('Discard changes?')) {
                              return;
                           }
                        }
                        setEditable(!editable);
                     }}
                  />
               )}
               {editable && (
                  <TrashIcon
                     className="delete buttons"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => deleteContentPiece(id)}
                  />
               )}
               {editable && (
                  <ReorderIcon
                     className={`reorder buttons${
                        reordering ? ' reordering' : ''
                     }`}
                     onClick={e => {
                        e.preventDefault();
                        if (
                           reordering ||
                           confirm(
                              'Are you sure you want to reorder the content? Any unsaved changes will be lost.'
                           )
                        ) {
                           setReordering(!reordering);
                        }
                     }}
                  />
               )}
               {copied ? (
                  'copied'
               ) : (
                  <LinkIcon
                     className="directLink buttons"
                     onClick={async () => {
                        await navigator.clipboard.writeText(
                           `${home}/thing?id=${thingID}&piece=${id}`
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                     }}
                  />
               )}
            </div>
         </div>
         {showingComments && (
            <div className="commentsArea">
               <ContentPieceComments
                  comments={comments}
                  id={id}
                  key={id}
                  input={
                     <RichTextArea
                        text={commentText}
                        setText={setCommentText}
                        postText={sendNewComment}
                        placeholder="Add comment"
                        buttonText="comment"
                        id={id}
                     />
                  }
               />
            </div>
         )}
      </div>
   );
};
ContentPiece.propTypes = {
   id: PropTypes.string.isRequired,
   canEdit: PropTypes.bool,
   rawContentString: PropTypes.string.isRequired,
   deleteContentPiece: PropTypes.func.isRequired,
   editContentPiece: PropTypes.func.isRequired
};

export default React.memo(ContentPiece, (prev, next) => {
   if (prev.rawContentString !== next.rawContentString) {
      return false;
   }
   return true;
});
