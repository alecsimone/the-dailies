import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import { MemberContext } from './Account/MemberProvider';
import StyledSidebar from '../styles/StyledSidebar';
import MyThings from './Archives/MyThings';
import MyFriendsThings from './Archives/MyFriendsThings';
import PublicThings from './Archives/PublicThings';
import LoadingRing from './LoadingRing';
import ArrowIcon from './Icons/Arrow';
import SidebarHeaderIcon from './Icons/SidebarHeaderIcon';

const Sidebar = props => {
   const { extraColumnTitle, extraColumnContent } = props;
   const { me, loading: memberLoading } = useContext(MemberContext);

   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? 'default' : extraColumnTitle
   );

   const { mobileBPWidthRaw } = useContext(ThemeContext);
   const [isOpen, setIsOpen] = useState(true);

   useEffect(() => {
      // we do this as an effect so the ssr doesn't make it start open
      if (
         process.browser &&
         window.outerWidth <= mobileBPWidthRaw &&
         extraColumnTitle != 'Tag' &&
         extraColumnTitle != 'Category' &&
         extraColumnTitle != 'Me' &&
         extraColumnTitle != 'Member'
      ) {
         setIsOpen(false);
      }
   }, [extraColumnTitle, mobileBPWidthRaw]);

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
               <img src="/defaultAvatar.jpg" alt={column} title={column} />
            );
      } else if (column === 'Member') {
         icon = <img src="/defaultAvatar.jpg" alt={column} title={column} />;
      } else if (column === 'Tweets') {
         icon = <img src="/Tweets.png" alt={column} title={column} />;
      } else {
         icon = <SidebarHeaderIcon icon={column} />;
      }

      const isSelected =
         selectedTab === column ||
         (selectedTab === 'default' && me && column === 'You') ||
         (selectedTab === 'default' && me == null && column === 'Public');

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
                  setIsOpen(!isOpen);
               } else {
                  setSelectedTab(column);
                  setIsOpen(true);
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
            localStorage.setItem('sidebarOpen', !isOpen);
            setIsOpen(!isOpen);
         }}
      >
         {isOpen ? closeButton : openButton}
      </div>
   );
   if (isOpen || (process.browser && window.outerWidth <= 900)) {
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
      <StyledSidebar className={`sidebar${!isOpen ? ' hidden' : ''}`}>
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
