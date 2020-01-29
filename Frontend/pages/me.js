import gql from 'graphql-tag';
import { useContext } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { MemberContext } from '../components/Account/MemberProvider';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import ProfileContent from '../components/Profile/ProfileContent';
import { fullMemberFields } from '../lib/CardInterfaces';
import StyledMemberPage from '../styles/StyledMemberPage';

const ME_PAGE_QUERY = gql`
   query ME_PAGE_QUERY {
      me {
         ${fullMemberFields}
      }
   }
`;

const me = () => {
   const { me, loading } = useContext(MemberContext);

   console.log(me);

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

         content = <ProfileContent member={me} />;
         sidebar = (
            <Sidebar
               extraColumnContent={<ProfileSidebar member={me} canEdit />}
               extraColumnTitle="Me"
               key="meData"
            />
         );
      } else {
         pageTitle = "Couldn't find you";
         content = <p>You were not found.</p>;
         sidebar = <Sidebar key="missingYou" />;
      }
   }

   return (
      <StyledMemberPage>
         <Head>
            <title>{pageTitle} - OurDailies</title>
         </Head>
         {sidebar}
         <div className="myStuffContainer">{content}</div>
      </StyledMemberPage>
   );
};
me.propTypes = {};

export default me;
