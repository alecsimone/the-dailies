import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { taxFields } from '../lib/CardInterfaces';
import { MemberContext } from '../components/Account/MemberProvider';
import { perPage } from '../config';
import { setAlpha } from '../styles/functions';

const SINGLE_TAX_QUERY = gql`
   query SINGLE_TAX_QUERY($title: String! $personal: Boolean!) {
      taxByTitle(title: $title personal: $personal) {
         ... on Tag {
            ${taxFields}
         }
         ... on Stack {
            ${taxFields}
         }
      }
   }
`;
export { SINGLE_TAX_QUERY };

const SINGLE_TAG_SUBSCRIPTION = gql`
   subscription SINGLE_TAG_SUBSCRIPTION {
      tag {
         node {
            ${taxFields}
         }
      }
   }
`;

const StyledTaxContent = styled.section`
   h2 {
      text-align: center;
      margin: 0 auto 3rem;
      font-weight: 600;
      font-size: ${props => props.theme.smallHead};
   }
`;
export { StyledTaxContent };

const StyledTagPage = styled.section`
   position: relative;
   display: flex;
   flex-direction: column-reverse;
   ${props => props.theme.desktopBreakpoint} {
      height: 100%;
      max-height: 100%;
      flex-direction: row;
   }
   .tagContent {
      width: 100%;
      position: relative;
      ${props => props.theme.desktopBreakpoint} {
         width: 75%;
         overflow: hidden;
         padding: 0 2rem;
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

const TagContext = React.createContext();
export { TagContext };

const tag = ({ query: { id, title } }) => {
   const { loading, error, data } = useQuery(SINGLE_TAX_QUERY, {
      variables: {
         title,
         personal: false
      }
   });

   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (data && data.taxByTitle && data.taxByTitle.author && me) {
      if (data.taxByTitle.author.id === me.id) {
         canEdit = true;
      }
      if (['Admin', 'Editor', 'Moderator'].includes(me.role)) {
         canEdit = true;
      }
   }

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_TAG_SUBSCRIPTION, {
      variables: { id }
   });

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = 'Unavailable Tag';
      content = <Error error={error} />;
   }
   if (loading) {
      pageTitle = 'Loading Tag';
      content = <LoadingRing />;
      sidebar = <LoadingRing />;
   } else if (data) {
      if (data.taxByTitle != null) {
         pageTitle = data.taxByTitle.title;
         const sortedThings = data.taxByTitle.connectedThings.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });
         content = (
            <StyledTaxContent className="content">
               <h2>Tag: {title}</h2>
               <Things
                  things={sortedThings}
                  displayType="grid"
                  cardSize="regular"
                  scrollingParentSelector=".mainSection"
                  perPage={perPage}
               />
            </StyledTaxContent>
         );
         sidebar = <TaxSidebar context={TagContext} canEdit={canEdit} />;
      } else {
         pageTitle = "Couldn't find tag";
         content = <p>Tag not found.</p>;
      }
   }

   return (
      <TagContext.Provider value={loading || error || data.taxByTitle}>
         <StyledTagPage className="styledTagPage">
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            <div className="tagContent">{content}</div>
            <div className="sidebar">{sidebar}</div>
         </StyledTagPage>
      </TagContext.Provider>
   );
};
tag.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
   }).isRequired
};
tag.getInitialProps = async ctx => ({ query: ctx.query });

export default tag;
