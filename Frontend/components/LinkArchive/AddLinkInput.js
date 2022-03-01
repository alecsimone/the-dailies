import { useMutation } from '@apollo/react-hooks';
import { useState } from 'react';

const AddLinkInput = ({ parentTag, addLinkHandler }) => {
   const [value, setValue] = useState('');

   const handleKeyDown = e => {
      if (e.key === 'Enter') {
         addLinkHandler(value, parentTag);
         setValue('');
      }
   };

   return (
      <input
         type="text"
         placeholder="add link"
         value={value}
         onChange={e => setValue(e.target.value)}
         onKeyDown={handleKeyDown}
      />
   );
};

export default AddLinkInput;
