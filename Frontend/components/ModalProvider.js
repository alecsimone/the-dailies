import React, { useState, useContext } from 'react';
import { MemberContext } from './Account/MemberProvider';

const ModalContext = React.createContext();

const ModalProvider = ({ children }) => {
   const [content, setContent] = useState(false);

   const { me } = useContext(MemberContext);

   const [sidebarIsOpen, setSidebarIsOpen] = useState(!me?.broadcastView);
   const modalData = {
      content,
      setContent,
      sidebarIsOpen,
      setSidebarIsOpen
   };

   return (
      <ModalContext.Provider value={modalData}>
         {children}
      </ModalContext.Provider>
   );
};

export { ModalContext };
export default ModalProvider;
