import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { MemberContext } from './Account/MemberProvider';
import { smallThingCardFields } from '../lib/CardInterfaces';
import Things from './Archives/Things';
import Error from './ErrorMessage';
import LoadingRing from './LoadingRing';
import StyledSidebar from '../styles/StyledSidebar';

const THINGS_BY_MEMBER_QUERY = gql`
   query THINGS_BY_MEMBER_QUERY($id: ID!) {
      things(where: {author: {id: $id}}, orderBy:createdAt_DESC) {
         ${smallThingCardFields}
      }
   }
`;

const Sidebar = props => {
   const { extraColumnTitle, extraColumnContent } = props;
   const { me, loading: memberLoading } = useContext(MemberContext);
   const { loading, error, data } = useQuery(THINGS_BY_MEMBER_QUERY, {
      variables: { id: memberLoading || me == null ? '' : me.id },
      pollInterval: 15000
   });

   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? 'You' : extraColumnTitle
   );

   const [isOpen, setIsOpen] = useState(true);

   const headerColumns = ['You', 'Friends', 'Public'];
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
      sidebarContent = (
         <Things
            things={loading ? [] : data.things}
            style="list"
            cardSize="small"
         />
      );
   } else if (selectedTab === extraColumnTitle) {
      sidebarContent = extraColumnContent;
   }

   let sidebarContents;
   if (error) {
      sidebarContents = <Error error={error} />;
   }
   if (data) {
      sidebarContents = sidebarContent;
   } else if (loading) {
      sidebarContents = <LoadingRing />;
   }

   return (
      <StyledSidebar className={`sidebar${!isOpen ? ' hidden' : ''}`}>
         <header className="sidebarHeader">{sidebarHeader}</header>
         <div className="sidebarContainer">
            <div className="sidebarContent">{sidebarContents}</div>
         </div>
      </StyledSidebar>
   );
};
Sidebar.propTypes = {
   extraColumnTitle: PropTypes.string,
   extraColumnContent: PropTypes.node
};

export default Sidebar;
