import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Head from 'next/head';
import PropTypes from 'prop-types';
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
   const { loading, error, data } = useQuery(ME_PAGE_QUERY);

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = "You're Unavailable";
      content = <Error error={error} />;
      sidebar = <Sidebar key="error" />;
   }
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
   } else if (data) {
      if (data.me != null) {
         pageTitle = data.me.displayName;

         content = <ProfileContent member={data.me} />;
         sidebar = (
            <Sidebar
               extraColumnContent={<ProfileSidebar member={data.me} canEdit />}
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
