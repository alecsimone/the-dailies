import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import { useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import Things from '../components/Archives/Things';
import MyThings from '../components/Archives/MyThings';
import LoadMoreButton from '../components/LoadMoreButton';
import { useInfiniteScroll, ALL_THINGS_QUERY } from '../lib/ThingHandling';
import {
   fullSizedLoadMoreButton,
   StyledThingsPage
} from '../styles/styleFragments';
import { ModalContext } from '../components/ModalProvider';
import PlaceholderThings from '../components/PlaceholderThings';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';

const StyledHomepage = styled.section`
   display: flex;
   position: relative;
   height: 100%;
   .pageContent {
      position: relative;
      max-height: 100%;
      flex-grow: 1;
      padding: 2rem 0;
      overflow: hidden;
      ${props => props.theme.scroll};
      ${StyledThingsPage}
      ${props => props.theme.desktopBreakpoint} {
         padding: 3rem 8rem;
      }
      ${fullSizedLoadMoreButton}
   }
   .sidebar {
      width: 25%;
      min-width: 40rem;
      display: none;
      p.emptyThings {
         padding: 0 2rem;
      }
      .list .regularThingCard {
         margin: 0;
      }
      ${props => props.theme.desktopBreakpoint} {
         max-height: 100%;
         display: block;
         background: ${props => props.theme.midBlack};
         overflow: hidden;
         ${props => props.theme.scroll};
      }
   }
`;

const allThingsQueryCount = 2;

const Home = () => {
   const { data, loading, error, fetchMore } = useQueryAndStoreIt(
      ALL_THINGS_QUERY,
      {
         ssr: false,
         variables: {
            count: allThingsQueryCount
         }
      }
   );

   const { setThingsSidebarIsOpen } = useContext(ModalContext);

   useEffect(() => setThingsSidebarIsOpen(false), [setThingsSidebarIsOpen]);

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'allThings');

   let content;
   const thingDisplayProps = {
      cardSize: 'regular'
   };
   if (error) {
      content = <ErrorMessage error={error} />;
   } else if (data) {
      content = (
         <Things
            things={data.allThings}
            cardSize="regular"
            displayType="list"
         />
      );
      if (data.allThings && data.allThings.length > 0) {
         const lastThing = data.allThings[data.allThings.length - 1];
         cursorRef.current = lastThing.createdAt;
      }
   } else if (loading) {
      content = (
         <PlaceholderThings
            count={allThingsQueryCount}
            {...thingDisplayProps}
         />
      );
   }
   return (
      <StyledHomepage className="homepage">
         <div className="pageContent" ref={scrollerRef}>
            {content}
            {data && (
               <LoadMoreButton
                  loading={loading || isFetchingMore}
                  noMore={noMoreToFetchRef.current}
                  fetchMore={fetchMoreHandler}
               />
            )}
         </div>
         <div className="sidebar">
            <MyThings scrollingSelector=".sidebar" borderSide="left" />
         </div>
      </StyledHomepage>
   );
};

export default Home;
