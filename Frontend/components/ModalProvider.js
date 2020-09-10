import React, { useState, useContext } from 'react';
import { MemberContext } from './Account/MemberProvider';

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

   const { me } = useContext(MemberContext);
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
