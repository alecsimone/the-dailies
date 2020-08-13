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
      sidebar = <Sidebar key="error" />;
   }
   if (loading) {
      pageTitle = 'Loading Tag';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading Tag...</p>}
            extraColumnTitle="Tag"
            key="loading"
         />
      );
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
         sidebar = (
            <Sidebar
               extraColumnContent={
                  <TaxSidebar context={TagContext} canEdit={canEdit} />
               }
               extraColumnTitle="Tag"
               key="tagData"
            />
         );
      } else {
         pageTitle = "Couldn't find tag";
         content = <p>Tag not found.</p>;
         sidebar = <Sidebar key="missingTag" />;
      }
   }

   return (
      <TagContext.Provider value={loading || error || data.taxByTitle}>
         <StyledPageWithSidebar className="styledPageWithSidebar">
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            {sidebar}
            <div className="mainSection">{content}</div>
         </StyledPageWithSidebar>
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
