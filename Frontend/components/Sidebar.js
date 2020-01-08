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
      things(where: {author: {id: $id}}) {
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

   const headerColumns = ['You', 'Friends', 'Public'];
   if (extraColumnTitle != null) {
      headerColumns.push(extraColumnTitle);
   }
   const sidebarHeader = headerColumns.map(column => (
      <div
         className={selectedTab === column ? 'headerTab selected' : 'headerTab'}
         key={column}
         onClick={() => setSelectedTab(column)}
      >
         {column}
      </div>
   ));

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

   return <StyledSidebar className="sidebar">{sidebarContents}</StyledSidebar>;
};

export default Sidebar;
