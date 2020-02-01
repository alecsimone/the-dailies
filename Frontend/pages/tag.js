import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { tagFields } from '../lib/CardInterfaces';
import { MemberContext } from '../components/Account/MemberProvider';

const SINGLE_TAG_QUERY = gql`
   query SINGLE_TAG_QUERY($title: String!) {
      tagByTitle(title: $title) {
         ${tagFields}
      }
   }
`;
export { SINGLE_TAG_QUERY };

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
   flex-wrap: wrap;
   ${props => props.theme.desktopBreakpoint} {
      flex-wrap: nowrap;
   }
   .sidebar {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 25%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 20%;
      }
   }
   .tagContainer {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 75%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      ${props => props.theme.desktopBreakpoint} {
         max-height: 100%;
         overflow: hidden;
         ${props => props.theme.scroll};
      }
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

   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (data && data.tagByTitle && data.tagByTitle.author && me) {
      if (data.tagByTitle.author.id === me.id) {
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
         siidebar = <Sidebar key="missingTag" />;
      }
   }

   return (
      <TagContext.Provider value={loading || error || data.tagByTitle}>
         <StyledTagPage>
            <Head>
               <title>{pageTitle} - OurDailies</title>
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
