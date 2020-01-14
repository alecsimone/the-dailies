import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import Head from 'next/head';
import React from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { tagFields } from '../lib/CardInterfaces';

const SINGLE_TAG_QUERY = gql`
   query SINGLE_TAG_QUERY($title: String!) {
      tagByTitle(title: $title) {
         ${tagFields}
      }
   }
`;

const SINGLE_TAG_SUBSCRIPTION = gql`
   subscription SINGLE_TAG_SUBSCRIPTION {
      tag {
         node {
            ${tagFields}
         }
      }
   }
`;

const StyledTagPage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 100%;
      flex-wrap: wrap;
      @media screen and (min-width: 800px) {
         flex-basis: 25%;
      }
   }
   .tagContainer {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
      .things {
         position: absolute;
         top: 3rem;
         left: 3%;
         width: 94%;
         max-height: 100%;
      }
   }
`;

const TagContext = React.createContext();
export { TagContext };

const tag = props => {
   const {
      query: { id, title }
   } = props;
   const { loading, error, data } = useQuery(SINGLE_TAG_QUERY, {
      variables: {
         title
      }
   });

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
      if (data.tagByTitle != null) {
         pageTitle = data.tagByTitle.title;
         const sortedThings = data.tagByTitle.connectedThings.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });
         content = (
            <Things
               things={sortedThings}
               displayType="grid"
               cardSize="regular"
            />
         );
         sidebar = (
            <Sidebar
               extraColumnContent={<TaxSidebar context={TagContext} />}
               extraColumnTitle="Tag"
               key="tagData"
            />
         );
      } else {
         pageTitle = "Couldn't find tag";
         content = <p>Tag not found.</p>;
         siidebar = <Sidebar key="missingTag" />;
      }
   }

   console.log(sidebar);

   return (
      <TagContext.Provider value={loading || error || data.tagByTitle}>
         <StyledTagPage>
            <Head>
               <title>{pageTitle}- OurDailies</title>
            </Head>
            {sidebar}
            <div className="tagContainer">{content}</div>
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

export default tag;
