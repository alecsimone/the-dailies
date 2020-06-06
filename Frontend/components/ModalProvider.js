import React, { useState } from 'react';

const ModalContext = React.createContext();

const ModalProvider = ({ children }) => {
   const [content, setContent] = useState(false);
   const modalData = {
      content,
      setContent
   };

   return (
      <ModalContext.Provider value={modalData}>
         {children}
      </ModalContext.Provider>
   );
};

export { ModalContext };
export default ModalProvider;
