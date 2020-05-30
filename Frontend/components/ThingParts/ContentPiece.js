import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ContentInput from './ContentInput';
import RichText from '../RichText';
import EditThis from '../Icons/EditThis';
import TrashIcon from '../Icons/Trash';

const ContentPiece = props => {
   const [editable, setEditable] = useState(false);

   const {
      id,
      rawContentString,
      deleteContentPiece,
      editContentPiece,
      canEdit
   } = props;

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
         <ContentInput
            currentContent={editedContent}
            updateContent={setEditedContent}
            postContent={postContent}
            setEditable={setEditable}
            id={id}
         />
      );
   }

   return (
      <div className="contentBlock" key={id}>
         <div className="contentPiece" key={id}>
            {content}
         </div>
         {canEdit && (
            <div className="buttons">
               <EditThis
                  className="edit buttons"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => {
                     setEditable(!editable);
                  }}
               />
               {editable && (
                  <TrashIcon
                     className="delete buttons"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => deleteContentPiece(id)}
                  />
               )}
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
