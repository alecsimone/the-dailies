import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import Sidebar from '../components/Sidebar';
import ErrorMessage from '../components/ErrorMessage';
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
   const { data, loading, error } = useQuery(ME_PAGE_QUERY);

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = "Couldn't find you";
      content = <p>You were not found.</p>;
      sidebar = <Sidebar key="missingYou" />;
   } else if (data && data.me) {
      pageTitle = data.me.displayName;
      content = (
         <ProfileContent member={data.me} isMe defaultTab={query.stuff} />
      );
      sidebar = (
         <Sidebar
            extraColumnContent={<ProfileSidebar member={data.me} canEdit />}
            extraColumnTitle="Me"
            key="meData"
         />
      );
   } else if (loading) {
      pageTitle = 'Loading You';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading You...</p>}
            extraColumnTitle="Me"
            key="loading"
         />
      );
   }

   return (
      <StyledPageWithSidebar className="styledPageWithSidebar">
         <Head>
            <title>{pageTitle} - OurDailies</title>
         </Head>
         {sidebar}
         <div className="mainSection">{content}</div>
      </StyledPageWithSidebar>
   );
};
me.propTypes = {};
me.getInitialProps = async ctx => ({ query: ctx.query });

export default me;
