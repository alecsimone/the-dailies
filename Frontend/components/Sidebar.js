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

   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? 'You' : extraColumnTitle
   );

   // useEffect(() => {
   //    if (extraColumnTitle != null) {
   //       setSelectedTab(extraColumnTitle);
   //    }
   // }, [extraColumnTitle]);

   const [isOpen, setIsOpen] = useState(true);

   if (memberLoading) {
      return (
         <StyledSidebar>
            <LoadingRing />
         </StyledSidebar>
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
         <img src={`${column}.png`} alt={column} title={column} />
      </div>
   ));
   const toggleButton = (
      <div
         className="headerTab toggle"
         key="toggle"
         onClick={() => {
            localStorage.setItem('sidebarOpen', !isOpen);
            setIsOpen(!isOpen);
         }}
      >
         {isOpen ? '<' : '>'}
      </div>
   );
   if (isOpen) {
      sidebarHeader.push(toggleButton);
   } else {
      sidebarHeader = toggleButton;
   }

   let sidebarContent;
   if (selectedTab === 'You') {
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
