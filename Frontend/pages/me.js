import gql from 'graphql-tag';
import { useContext } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import ProfileContent from '../components/Profile/ProfileContent';
import { fullMemberFields } from '../lib/CardInterfaces';

const ME_PAGE_QUERY = gql`
   query ME_PAGE_QUERY {
      me {
         ${fullMemberFields}
      }
   }
`;

const me = ({ query }) => {
   const { me, loading } = useContext(MemberContext);

   let pageTitle;
   let content;
   let sidebar;
   if (loading) {
      pageTitle = 'Loading You';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading You...</p>}
            extraColumnTitle="Me"
            key="loading"
         />
      );
   } else if (me) {
      if (me != null) {
         pageTitle = me.displayName;

         content = <ProfileContent member={me} isMe defaultTab={query.stuff} />;
         sidebar = (
            <Sidebar
               extraColumnContent={<ProfileSidebar member={me} canEdit />}
               extraColumnTitle="Me"
               key="meData"
            />
         );
      }
   } else {
      pageTitle = "Couldn't find you";
      content = <p>You were not found.</p>;
      sidebar = <Sidebar key="missingYou" />;
   }

   return (
      <StyledPageWithSidebar>
         <Head>
            <title>{pageTitle} - OurDailies</title>
         </Head>
         {sidebar}
         <div className="mainSection">{content}</div>
      </StyledPageWithSidebar>
   );
};
me.propTypes = {};

export default me;
