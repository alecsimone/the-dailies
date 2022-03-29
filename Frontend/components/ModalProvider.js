import React, { useState, useContext, useEffect } from 'react';
import { desktopBreakpointPx } from '../styles/functions';

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

   const [homepageThingsBarIsOpen, setHomepageThingsBarIsOpen] = useState(); // This needs to have undefined initial state, otherwise the SSR initial state will be used and will have no idea about the window size. So we're going to use null initial state and then set the state with an effect
   useEffect(
      () =>
         setHomepageThingsBarIsOpen(window.innerWidth >= desktopBreakpointPx),
      []
   );

   const modalData = {
      content,
      setContent,
      heartPosition,
      setHeartPosition,
      fullHeart,
      setFullHeart,
      thingsSidebarIsOpen,
      setThingsSidebarIsOpen,
      homepageThingsBarIsOpen,
      setHomepageThingsBarIsOpen,
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
