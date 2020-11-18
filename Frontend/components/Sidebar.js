import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import { MemberContext } from './Account/MemberProvider';
import { ModalContext } from './ModalProvider';
import StyledSidebar from '../styles/StyledSidebar';
import MyThings from './Archives/MyThings';
import MyFriendsThings from './Archives/MyFriendsThings';
import PublicThings from './Archives/PublicThings';
import LoadingRing from './LoadingRing';
import ArrowIcon from './Icons/Arrow';
import SidebarHeaderIcon from './Icons/SidebarHeaderIcon';
import DefaultAvatar from './Icons/DefaultAvatar';

const Sidebar = props => {
   const { extraColumnTitle, extraColumnContent } = props;
   const { me, loading: memberLoading } = useContext(MemberContext);
   const { sidebarIsOpen, setSidebarIsOpen } = useContext(ModalContext);

   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? 'default' : extraColumnTitle
   );

   const { mobileBPWidthRaw } = useContext(ThemeContext);
   // const [isOpen, setIsOpen] = useState(!me?.broadcastView);

   // useEffect(() => {
   //    // we do this as an effect so the ssr doesn't make it start open
   //    if (
   //       (me && me.broadcastView) ||
   //       (process.browser &&
   //          window.outerWidth <= mobileBPWidthRaw &&
   //          extraColumnTitle != 'Tag' &&
   //          extraColumnTitle != 'Me' &&
   //          extraColumnTitle != 'Member')
   //    ) {
   //       setSidebarIsOpen(false);
   //    } else {
   //       setSidebarIsOpen(true);
   //    }
   // }, [extraColumnTitle, me, mobileBPWidthRaw, setSidebarIsOpen]);

   const clickCloseListener = e => {
      // This only applies to mobile, because the sidebar covers everything
      if (window.outerWidth > mobileBPWidthRaw) return;

      // If they click a smallThingCard (post in one of the things list) or listLink (list element on twitter reader), we want to close the sidebar to get it out of the way.
      if (
         e.target.closest('.listLink') != null ||
         e.target.closest('.smallThingCard') != null
      ) {
         setSidebarIsOpen(false);
      }
   };

   useEffect(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
         sidebar.addEventListener('click', clickCloseListener);
      }

      return () => {
         if (sidebar) {
            sidebar.removeEventListener('click', clickCloseListener);
         }
      };
   });

   const headerColumns = me ? ['You', 'Friends', 'Public'] : ['Public'];
   if (extraColumnTitle != null) {
      headerColumns.push(extraColumnTitle);
   }
   let sidebarHeader = headerColumns.map(column => {
      let icon;
      if (column === 'Me') {
         icon =
            me && me.avatar != null ? (
               <img src={me.avatar} alt={column} title={column} />
            ) : (
               <DefaultAvatar />
            );
      } else if (column === 'Member') {
         icon = <DefaultAvatar />;
      } else {
         icon = <SidebarHeaderIcon icon={column} />;
      }

      const isSelected =
         (selectedTab === column ||
            (selectedTab === 'default' && me && column === 'You') ||
            (selectedTab === 'default' && me == null && column === 'Public')) &&
         sidebarIsOpen;

      return (
         <div
            className={
               isSelected && headerColumns.length > 1
                  ? `headerTab ${column} selected`
                  : `headerTab ${column}`
            }
            key={column}
            onClick={() => {
               if (isSelected) {
                  setSidebarIsOpen(!sidebarIsOpen);
               } else {
                  setSelectedTab(column);
                  setSidebarIsOpen(true);
               }
            }}
         >
            {icon}
         </div>
      );
   });
   const openButton =
      process.browser && window.innerWidth <= mobileBPWidthRaw ? (
         <ArrowIcon pointing="down" />
      ) : (
         <ArrowIcon pointing="right" />
      );
   const closeButton =
      process.browser && window.innerWidth <= mobileBPWidthRaw ? (
         <ArrowIcon pointing="up" />
      ) : (
         <ArrowIcon pointing="left" />
      );
   const toggleButton = (
      <div
         className="headerTab toggle"
         key="toggle"
         onClick={() => {
            setSidebarIsOpen(!sidebarIsOpen);
         }}
      >
         {sidebarIsOpen ? closeButton : openButton}
      </div>
   );
   if (sidebarIsOpen || (process.browser && window.outerWidth <= 900)) {
      sidebarHeader.push(toggleButton);
   } else {
      sidebarHeader = toggleButton;
   }

   let sidebarContent;
   if (memberLoading) {
      sidebarContent = <LoadingRing />;
   } else if (selectedTab === 'You') {
      sidebarContent = <MyThings />;
   } else if (selectedTab === 'Friends') {
      sidebarContent = <MyFriendsThings />;
   } else if (selectedTab === 'Public') {
      sidebarContent = <PublicThings displayType="list" />;
   } else if (selectedTab === extraColumnTitle) {
      sidebarContent = extraColumnContent;
   } else if (selectedTab === 'default') {
      if (me) {
         sidebarContent = <MyThings />;
      } else {
         sidebarContent = <PublicThings displayType="list" />;
      }
   }

   return (
      <StyledSidebar className={`sidebar${!sidebarIsOpen ? ' hidden' : ''}`}>
         <header className="sidebarHeader">{sidebarHeader}</header>
         <div className="sidebarContainer">
            <div className="sidebarContent">{sidebarContent}</div>
         </div>
      </StyledSidebar>
   );
};
Sidebar.propTypes = {
   extraColumnTitle: PropTypes.string,
   extraColumnContent: PropTypes.node
};

export default Sidebar;
