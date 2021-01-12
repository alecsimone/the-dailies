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

   const [heartPosition, setHeartPosition] = useState(false);
   const [fullHeart, setFullHeart] = useState(true);

   const modalData = {
      content,
      setContent,
      heartPosition,
      setHeartPosition,
      fullHeart,
      setFullHeart,
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
