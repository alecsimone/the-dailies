import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import Head from 'next/head';
import React, { useState } from 'react';
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
      flex-basis: 25%;
   }
   .tagContainer {
      flex-basis: 75%;
      position: relative;
      max-height: 100%;
      padding: 2rem;
      ${props => props.theme.scroll};
   }
`;

const TagContext = React.createContext();
export { TagContext };

const tag = props => {
   const { loading, error, data } = useQuery(SINGLE_TAG_QUERY, {
      variables: {
         title: props.query.title
      }
   });

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_TAG_SUBSCRIPTION, {
      variables: { id: props.query.id }
   });

   if (error) {
      return <Error error={error} />;
   }
   if (loading) {
      return <LoadingRing />;
   }

   let tagInfo;
   let sidebarContent;
   if (data.tagByTitle == null) {
      tagInfo = <p>Tag not found.</p>;
   } else {
      tagInfo = (
         <Things things={data.tagByTitle.connectedThings} style="grid" />
      );
      sidebarContent = <TaxSidebar context={TagContext} />;
   }

   return (
      <TagContext.Provider value={data.tagByTitle}>
         <StyledTagPage>
            <Head>
               <title>
                  {loading || data.tagByTitle == null
                     ? props.query.title
                     : data.tagByTitle.title}{' '}
                  - OurDailies
               </title>
            </Head>
            <Sidebar
               extraColumnContent={sidebarContent}
               extraColumnTitle="Tag"
            />
            <div className="tagContainer">{tagInfo}</div>
         </StyledTagPage>
      </TagContext.Provider>
   );
};

export default tag;
