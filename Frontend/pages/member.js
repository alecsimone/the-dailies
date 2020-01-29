import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
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

const MEMBER_PAGE_QUERY = gql`
   query MEMBER_PAGE_QUERY($id: ID, $displayName: String) {
      member(id: $id, displayName: $displayName) {
         ${fullMemberFields}
      }
   }
`;

const member = props => {
   const { query } = props;

   let variables;
   if (query.name) {
      variables = {
         displayName: query.name
      };
   } else if (query.id) {
      variables = {
         id: query.id
      };
   }
   const { loading, error, data } = useQuery(MEMBER_PAGE_QUERY, {
      variables
   });
   const { me } = useContext(MemberContext);

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = 'Member Unavailable';
      content = <Error error={error} />;
      sidebar = <Sidebar key="error" />;
   }
   if (loading) {
      pageTitle = 'Loading Member';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading Member...</p>}
            extraColumnTitle="Member"
            key="loading"
         />
      );
   } else if (data) {
      if (data.member != null) {
         pageTitle = data.member.displayName;

         content = <ProfileContent member={data.member} />;
         sidebar = (
            <Sidebar
               extraColumnContent={
                  <ProfileSidebar
                     member={data.member}
                     canEdit={me.id === data.member.id}
                  />
               }
               extraColumnTitle="Member"
               key="memberData"
            />
         );
      } else {
         pageTitle = "Couldn't find member";
         content = <p>Member not found.</p>;
         sidebar = <Sidebar key="missingMember" />;
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
member.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
   }).isRequired
};

export default member;
