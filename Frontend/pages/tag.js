import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { taxFields } from '../lib/CardInterfaces';
import { MemberContext } from '../components/Account/MemberProvider';
import { perPage } from '../config';
import { setAlpha } from '../styles/functions';
import { fullSizedLoadMoreButton } from '../styles/styleFragments';
import { useInfiniteScroll } from '../lib/ThingHandling';
import LoadMoreButton from '../components/LoadMoreButton';

const SINGLE_TAX_QUERY = gql`
   query SINGLE_TAX_QUERY($title: String! $personal: Boolean!, $cursor: String) {
      taxByTitle(title: $title, personal: $personal, cursor: $cursor) {
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
      ${fullSizedLoadMoreButton}
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
   const { loading, error, data, fetchMore } = useQuery(SINGLE_TAX_QUERY, {
      variables: {
         title,
         personal: false
      }
   });

   const { me } = useContext(MemberContext);

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'taxByTitle');

   const { desktopBPWidthRaw } = useContext(ThemeContext);

   if (process.browser) {
      if (window.innerWidth < desktopBPWidthRaw) {
         scrollerRef.current = document.querySelector('.threeColumns');
      } else {
         scrollerRef.current = document.querySelector('.tagContent');
      }
   }

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
         const lastThing = sortedThings[sortedThings.length - 1];
         cursorRef.current = lastThing.createdAt;
         content = (
            <StyledTaxContent className="content">
               <h2>Tag: {title}</h2>
               <Things
                  things={sortedThings}
                  displayType="list"
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
            <div className="tagContent">
               {content}
               {data && (
                  <LoadMoreButton
                     loading={loading || isFetchingMore}
                     noMore={noMoreToFetchRef.current}
                     fetchMore={fetchMoreHandler}
                  />
               )}
            </div>
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
