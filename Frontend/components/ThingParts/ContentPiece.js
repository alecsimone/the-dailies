import { useState } from 'react';

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

   let content;
   if (!editable) {
      content = paragraphElements;
   } else {
      content = (
         <textarea
            type="textarea"
            id="content"
            name="content"
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            onKeyDown={e => handleKeyDown(e)}
         />
      );
   }

   const handleKeyDown = e => {
      if (e.key === 'Enter' && e.ctrlKey) {
         editContentPiece(id, editedContent);
         setEditable(false);
      }
   };

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
