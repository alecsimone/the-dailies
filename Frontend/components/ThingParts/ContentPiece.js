import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import EditThis from '../Icons/EditThis';
import TrashIcon from '../Icons/Trash';
import LinkIcon from '../Icons/Link';
import { home } from '../../config';
import ReorderIcon from '../Icons/Reorder';

const ContentPiece = ({
   id,
   thingID,
   rawContentString,
   deleteContentPiece,
   editContentPiece,
   canEdit,
   setReordering,
   reordering,
   highlighted
}) => {
   const [editable, setEditable] = useState(false);
   const [copied, setCopied] = useState(false);

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
         onMouseUp={e => {
            if (!canEdit) return;

            // If they clicked an edit button, kill this, cause we're settingEditable already
            if (e.target.closest('.editThis') != null) return;

            const selection = window.getSelection();
            if (selection.type === 'Caret' && !editable) {
               setEditable(true);
            }
         }}
      >
         <div
            className={canEdit ? 'contentPiece editable' : 'contentPiece'}
            key={id}
         >
            {content}
         </div>
         <div className="buttons buttonsContainer">
            {canEdit && (
               <EditThis
                  className="edit buttons"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => {
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
