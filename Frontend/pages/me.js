import gql from 'graphql-tag';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import ProfileContent from '../components/Profile/ProfileContent';
import { fullMemberFields } from '../lib/CardInterfaces';
import { setAlpha } from '../styles/functions';

const ME_PAGE_QUERY = gql`
   query ME_PAGE_QUERY {
      me {
         ${fullMemberFields}
      }
   }
`;

const StyledProfilePage = styled.section`
   position: relative;
   display: flex;
   flex-direction: column-reverse;
   ${props => props.theme.desktopBreakpoint} {
      height: 100%;
      max-height: 100%;
      flex-direction: row;
   }
   .content {
      width: 100%;
      position: relative;
      ${props => props.theme.desktopBreakpoint} {
         width: 75%;
         overflow: hidden;
         ${props => props.theme.scroll};
      }
   }
   .sidebar {
      width: 100%;
      background: ${props => props.theme.midBlack};
      height: 100%;
      border-left: 3px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      ${props => props.theme.desktopBreakpoint} {
         width: 25%;
         overflow: hidden;
         ${props => props.theme.scroll};
      }
   }
`;
export { StyledProfilePage };

const me = ({ query }) => {
   const { data, loading, error } = useQuery(ME_PAGE_QUERY);

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = "Couldn't find you";
      content = <p>You were not found.</p>;
   } else if (data && data.me) {
      pageTitle = data.me.displayName;
      content = (
         <ProfileContent member={data.me} isMe defaultTab={query.stuff} />
      );
      sidebar = <ProfileSidebar member={data.me} canEdit />;
   } else if (loading) {
      pageTitle = 'Loading You';
      content = <LoadingRing />;
      sidebar = <LoadingRing />;
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
me.propTypes = {};
me.getInitialProps = async ctx => ({ query: ctx.query });

export default me;
