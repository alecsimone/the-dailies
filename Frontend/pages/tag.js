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

   if (error) {
      return <Error error={error} />;
   }
   if (loading) {
      return <LoadingRing />;
   }

   let tagThings;
   let sidebarContent;
   if (data.tagByTitle == null) {
      tagThings = <p>Tag not found.</p>;
   } else {
      const sortedThings = data.tagByTitle.connectedThings.sort((a, b) => {
         const aDate = new Date(a.createdAt);
         const bDate = new Date(b.createdAt);
         return bDate - aDate;
      });
      tagThings = (
         <Things things={sortedThings} displayType="grid" cardSize="regular" />
      );
      sidebarContent = <TaxSidebar context={TagContext} />;
   }

   return (
      <TagContext.Provider value={data.tagByTitle}>
         <StyledTagPage>
            <Head>
               <title>
                  {loading || data.tagByTitle == null
                     ? title
                     : data.tagByTitle.title}{' '}
                  - OurDailies
               </title>
            </Head>
            <Sidebar
               extraColumnContent={sidebarContent}
               extraColumnTitle="Tag"
            />
            <div className="tagContainer">{tagThings}</div>
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
