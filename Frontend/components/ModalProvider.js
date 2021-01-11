import React, { useState, useContext } from 'react';

const ModalContext = React.createContext();

const ModalProvider = ({
   children,
   thingsSidebarIsOpen,
   setThingsSidebarIsOpen,
   navSidebarIsOpen,
   setNavSidebarIsOpen,
   isHome
}) => {
   const [content, setContent] = useState(false);

   const modalData = {
      content,
      setContent,
      thingsSidebarIsOpen,
      setThingsSidebarIsOpen,
      navSidebarIsOpen,
      setNavSidebarIsOpen,
      isHome
   };

   return (
      <ModalContext.Provider value={modalData}>
         {children}
      </ModalContext.Provider>
   );
};

export { ModalContext };
export default ModalProvider;
