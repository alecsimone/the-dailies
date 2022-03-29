import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import Things from '../components/Archives/Things';
import MyThings from '../components/Archives/MyThings';
import LoadMoreButton from '../components/LoadMoreButton';
import {
   useInfiniteScroll,
   ALL_THINGS_QUERY,
   MY_FRIENDS_THINGS_QUERY
} from '../lib/ThingHandling';
import {
   fullSizedLoadMoreButton,
   StyledThingsPage
} from '../styles/styleFragments';
import { ModalContext } from '../components/ModalProvider';
import PlaceholderThings from '../components/PlaceholderThings';
import useQueryAndStoreIt, {
   useLazyQueryAndStoreIt
} from '../stuffStore/useQueryAndStoreIt';
import { setAlpha } from '../styles/functions';
import useMe from '../components/Account/useMe';

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
         padding: 3rem 2rem;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         padding: 3rem 8rem;
      }
      ${fullSizedLoadMoreButton}
      .feedSelector {
         width: 100%;
         border: 3px solid ${props => props.theme.lowContrastGrey};
         display: flex;
         align-items: center;
         margin-bottom: 3rem;
         border-radius: 3px;
         .selectorTab {
            cursor: pointer;
            padding: 0.25rem 0;
            border-right: 3px solid ${props => props.theme.lowContrastGrey};
            &:last-child {
               border-right: none;
            }
            flex-grow: 1;
            text-align: center;
            &.selected {
               background: ${props =>
                  setAlpha(props.theme.lowContrastGrey, 0.4)};
               &:hover {
                  background: ${props =>
                     setAlpha(props.theme.lowContrastGrey, 0.4)};
               }
            }
            &:hover {
               background: ${props =>
                  setAlpha(props.theme.lowContrastGrey, 0.25)};
            }
         }
      }
   }
   .sidebar {
      display: block;
      width: 100%;
      position: absolute;
      z-index: 10;
      &.open {
         transform: translateX(0%);
         transition: transform 0.2s linear;
      }
      &.closed {
         transform: translateX(100%);
         transition: transform 0.2s linear, width 0s linear 0.25s,
            min-width 0s linear 0.25s, opacity 0s linear 0.25s;
         width: 0;
         min-width: 0;
         opacity: 0;
      }
      p.emptyThings {
         padding: 0 2rem;
      }
      .list .regularThingCard {
         margin: 0;
      }
      ${props => props.theme.desktopBreakpoint} {
         position: relative;
         max-height: 100%;
         width: 25%;
         min-width: 36rem;
         background: ${props => props.theme.midBlack};
         overflow: hidden;
         ${props => props.theme.scroll};
      }
   }
`;

const allThingsQueryCount = 2;

const Home = () => {
   const { loggedInUserID } = useMe();

   const { data, loading, error, fetchMore } = useQueryAndStoreIt(
      ALL_THINGS_QUERY,
      {
         ssr: false,
         variables: {
            count: allThingsQueryCount
         }
      }
   );

   const {
      data: friendsThingsData,
      loading: loadingFriendsThings,
      error: friendsThingsError,
      fetchMore: fetchMoreFriendsThings
   } = useQueryAndStoreIt(MY_FRIENDS_THINGS_QUERY, {
      skip: loggedInUserID == null,
      ssr: false,
      variables: {
         count: allThingsQueryCount
      }
   });

   const [currentFeed, setCurrentFeed] = useState('Top');

   const { setThingsSidebarIsOpen, homepageThingsBarIsOpen } = useContext(
      ModalContext
   );

   useEffect(() => setThingsSidebarIsOpen(false), [setThingsSidebarIsOpen]);

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'allThings');

   const {
      scrollerRef: friendsScrollerRef,
      cursorRef: friendsCursorRef,
      isFetchingMore: isFetchingMoreFriendsThings,
      noMoreToFetchRef: noMoreFriendsThingsToFetch,
      fetchMoreHandler: fetchMoreFriendsThingsHandler
   } = useInfiniteScroll(fetchMoreFriendsThings, '.things', 'myFriendsThings');

   let content;
   const thingDisplayProps = {
      cardSize: 'regular'
   };
   if (currentFeed === 'Top' || loggedInUserID == null) {
      if (error) {
         content = <ErrorMessage error={error} />;
      } else if (data) {
         content = (
            <Things
               things={data.allThings}
               cardSize="regular"
               displayType="list"
               hideConnections
               showEmptyContent={false}
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
   } else if (currentFeed === 'Friends') {
      if (friendsThingsError) {
         content = <ErrorMessage error={friendsThingsError} />;
      } else if (friendsThingsData) {
         content = (
            <Things
               things={friendsThingsData.myFriendsThings}
               cardSize="regular"
               displayType="list"
               hideConnections
               showEmptyContent={false}
            />
         );
         if (
            friendsThingsData.myFriendsThings &&
            friendsThingsData.myFriendsThings.length > 0
         ) {
            const lastThing =
               friendsThingsData.myFriendsThings[
                  friendsThingsData.myFriendsThings.length - 1
               ];
            friendsCursorRef.current = lastThing.manualUpdatedAt;
         }
      } else if (loadingFriendsThings) {
         content = (
            <PlaceholderThings
               count={allThingsQueryCount}
               {...thingDisplayProps}
            />
         );
      }
   }

   return (
      <StyledHomepage className="homepage">
         <div
            className="pageContent"
            ref={currentFeed === 'Top' ? scrollerRef : friendsScrollerRef}
         >
            {loggedInUserID != null && (
               <div className="feedSelector">
                  <div
                     className={`selectorTab top${
                        currentFeed === 'Top' ? ' selected' : ''
                     }`}
                     onClick={() => setCurrentFeed('Top')}
                  >
                     Top
                  </div>
                  <div
                     className={`selectorTab friends${
                        currentFeed === 'Friends' ? ' selected' : ''
                     }`}
                     onClick={() => setCurrentFeed('Friends')}
                  >
                     Friends
                  </div>
               </div>
            )}
            {content}
            {data && (
               <LoadMoreButton
                  loading={
                     loading ||
                     (currentFeed === 'Top'
                        ? isFetchingMore
                        : isFetchingMoreFriendsThings)
                  }
                  noMore={
                     currentFeed === 'Top'
                        ? noMoreToFetchRef.current
                        : noMoreFriendsThingsToFetch.current
                  }
                  fetchMore={
                     currentFeed === 'Top'
                        ? fetchMoreHandler
                        : fetchMoreFriendsThingsHandler
                  }
               />
            )}
         </div>
         <div
            className={
               homepageThingsBarIsOpen ? 'sidebar open' : 'sidebar closed'
            }
         >
            <MyThings scrollingSelector=".sidebar" borderSide="left" />
         </div>
      </StyledHomepage>
   );
};

export default Home;
