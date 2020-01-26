import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MemberContext } from './Account/MemberProvider';
import StyledSidebar from '../styles/StyledSidebar';
import MyThings from './Archives/MyThings';
import MyFriendsThings from './Archives/MyFriendsThings';
import PublicThings from './Archives/PublicThings';
import LoadingRing from './LoadingRing';

const Sidebar = props => {
   const { extraColumnTitle, extraColumnContent } = props;
   const { me, loading: memberLoading } = useContext(MemberContext);

   let defaultColumn;
   if (memberLoading) {
      defaultColumn = 'Loading';
   } else if (me == null) {
      defaultColumn = 'Public';
   } else {
      defaultColumn = 'You';
   }
   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? defaultColumn : extraColumnTitle
   );

   // useEffect(() => {
   //    if (extraColumnTitle != null) {
   //       setSelectedTab(extraColumnTitle);
   //    }
   // }, [extraColumnTitle]);

   const [isOpen, setIsOpen] = useState(
      !(
         process.browser &&
         window.outerWidth <= 800 &&
         extraColumnTitle != 'Tag' &&
         extraColumnTitle != 'Category'
      )
   );

   if (memberLoading) {
      return (
         <StyledSidebar>
            <LoadingRing />
         </StyledSidebar>
      );
   }

   if (selectedTab === 'Loading') {
      setSelectedTab(
         extraColumnTitle == null ? defaultColumn : extraColumnTitle
      );
   }

   const headerColumns = me ? ['You', 'Friends', 'Public'] : ['Public'];
   if (extraColumnTitle != null) {
      headerColumns.push(extraColumnTitle);
   }
   let sidebarHeader = headerColumns.map(column => (
      <div
         className={
            selectedTab === column
               ? `headerTab ${column} selected`
               : `headerTab ${column}`
         }
         key={column}
         onClick={() => setSelectedTab(column)}
      >
         <img
            src={
               column === 'Me' || column === 'Member'
                  ? '/defaultAvatar.jpg'
                  : `${column}.png`
            }
            alt={column}
            title={column}
         />
      </div>
   ));
   const openButton = process.browser && window.outerWidth <= 800 ? 'v' : '>';
   const closeButton = process.browser && window.outerWidth <= 800 ? '^' : '<';
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
   if (isOpen || (process.browser && window.outerWidth <= 800)) {
      sidebarHeader.push(toggleButton);
   } else {
      sidebarHeader = toggleButton;
   }

   let sidebarContent;
   if (selectedTab === 'Loading') {
      sidebarContent = <LoadingRing />;
   } else if (selectedTab === 'You') {
      sidebarContent = <MyThings />;
   } else if (selectedTab === 'Friends') {
      sidebarContent = <MyFriendsThings />;
   } else if (selectedTab === 'Public') {
      sidebarContent = <PublicThings />;
   } else if (selectedTab === extraColumnTitle) {
      sidebarContent = extraColumnContent;
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