import { useState } from 'react';
import ContentInput from './ContentInput';

const ContentPiece = props => {
   const [editable, setEditable] = useState(false);

   const {
      id,
      paragraphElements,
      rawContentString,
      deleteContentPiece,
      editContentPiece
   } = props;

   const [editedContent, setEditedContent] = useState(rawContentString);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && e.ctrlKey) {
         postContent();
      }
   };

   const postContent = () => {
      editContentPiece(id, editedContent);
      setEditable(false);
   };

   let content;
   if (!editable) {
      content = paragraphElements;
   } else {
      content = (
         <ContentInput
            currentContent={editedContent}
            updateContent={setEditedContent}
            postContent={postContent}
         />
      );
   }

   return (
      <div className="contentBlock" key={id}>
         <div className="contentPiece">{content}</div>
         <div className="buttons">
            <img
               src="/edit-this.png"
               className="edit buttons"
               onClick={() => setEditable(!editable)}
            />
            <img
               src="/red-x.png"
               className="delete buttons"
               onClick={() => deleteContentPiece(id)}
            />
         </div>
      </div>
   );
};

export default ContentPiece;
