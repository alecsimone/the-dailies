import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
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
      variables: { id: memberLoading || me == null ? '' : me.id }
   });

   const [selectedTab, setSelectedTab] = useState(
      extraColumnTitle == null ? 'You' : extraColumnTitle
   );

   const [hidden, setHidden] = useState(false);

   if (error) return <Error error={error} />;
   if (loading) return <LoadingRing />;

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
         onClick={() => setHidden(!hidden)}
      >
         {hidden ? '>' : '<'}
      </div>
   );
   if (hidden) {
      sidebarHeader = toggleButton;
   } else {
      sidebarHeader.push(toggleButton);
   }

   let sidebarContent;
   if (selectedTab === 'You') {
      sidebarContent = (
         <Things things={loading ? [] : data.things} style="list" />
      );
   } else if (selectedTab === extraColumnTitle) {
      sidebarContent = extraColumnContent;
   }

   let sidebarContents;
   if (error) {
      sidebarContents = <Error error={error} />;
   }
   if (data) {
      sidebarContents = (
         <>
            <header className="sidebarHeader">{sidebarHeader}</header>
            <div className="sidebarContainer">
               <div className="sidebarContent">{sidebarContent}</div>
            </div>
         </>
      );
   }
   if (loading) {
      sidebarContents = <LoadingRing />;
   }

   return (
      <StyledSidebar className={`sidebar${hidden ? ' hidden' : ''}`}>
         {sidebarContents}
      </StyledSidebar>
   );
};

export default Sidebar;
