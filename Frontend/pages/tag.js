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
import { smallThingCardFields } from '../lib/CardInterfaces';

const SINGLE_TAG_QUERY = gql`
   query SINGLE_TAG_QUERY($title: String!) {
      tagByTitle(title: $title) {
         __typename
         id
         title
         featuredImage
         owner {
            __typename
            id
         }
         public
         summary
         connectedThings {
            ${smallThingCardFields}
         }
         includedLinks {
            __typename
            id
            title
            url
         }
         comments {
            __typename
            id
            createdAt
            author {
               __typename
               id
               displayName
               avatar
               rep
            }
         }
         createdAt
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
      overflow-y: auto;
      scrollbar-color: #262626 black;
      scrollbar-width: thin;
      padding: 2rem;
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

   if (error) {
      return <Error error={error} />;
   }
   if (loading) {
      return <LoadingRing />;
   }

   const sidebarContent = <TaxSidebar />;

   const tagInfo = (
      <Things things={data.tagByTitle.connectedThings} style="grid" />
   );

   return (
      <TagContext.Provider value={data.tagByTitle}>
         <StyledTagPage>
            <Head>
               <title>{props.query.title} - OurDailies</title>
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
