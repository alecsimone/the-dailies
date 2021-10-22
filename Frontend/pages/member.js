import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { StyledProfilePage } from './me';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import ProfileContent from '../components/Profile/ProfileContent';
import { fullMemberFields } from '../lib/CardInterfaces';
import useMe from '../components/Account/useMe';

const MEMBER_PAGE_QUERY = gql`
   query MEMBER_PAGE_QUERY($id: ID, $displayName: String) {
      member(id: $id, displayName: $displayName) {
         ${fullMemberFields}
      }
   }
`;
export { MEMBER_PAGE_QUERY };

const member = ({ query }) => {
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
   const {
      loggedInUserID,
      memberFields: { role }
   } = useMe('member', 'role');

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = 'Member Unavailable';
      content = <Error error={error} />;
   }
   if (loading) {
      pageTitle = 'Loading Member';
      content = <LoadingRing />;
      sidebar = <LoadingRing />;
   } else if (data) {
      if (data.member != null) {
         pageTitle = data.member.displayName;
         let isMe = false;
         if (loggedInUserID && data.member.id === loggedInUserID) {
            isMe = true;
         }
         let canEdit = isMe;
         if (loggedInUserID && ['Admin', 'Editor'].includes(role)) {
            canEdit = true;
         }

         const safeMemberData = { ...data.member };
         if (!canEdit) {
            delete safeMemberData.email;
         }

         content = (
            <ProfileContent
               member={safeMemberData}
               isMe={isMe}
               defaultTab={query.stuff}
            />
         );
         sidebar = <ProfileSidebar member={safeMemberData} canEdit={canEdit} />;
      } else {
         pageTitle = "Couldn't find member";
         content = <p>Member not found.</p>;
      }
   }

   return (
      <StyledProfilePage>
         <Head>
            <title>{pageTitle} - Ouryou</title>
         </Head>
         <section className="content">{content}</section>
         <section className="sidebar">{sidebar}</section>
      </StyledProfilePage>
   );
};
member.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
   }).isRequired
};
member.getInitialProps = async ctx => ({ query: ctx.query });

export default member;
