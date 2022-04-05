import gql from 'graphql-tag';
import styled from 'styled-components';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { useContext } from 'react';
import Link from 'next/link';
import router from 'next/router';
import { useDispatch } from 'react-redux';
import Things from './Things';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';
import Signup from '../Account/Signup';
import { sidebarPerPage } from '../../config';
import {
   fullThingFields,
   smallThingCardFields
} from '../../lib/CardInterfaces';
import LoadMoreButton from '../LoadMoreButton';
import { useInfiniteScroll } from '../../lib/ThingHandling';
import useMe from '../Account/useMe';
import PlaceholderThings from '../PlaceholderThings';
import useQueryAndStoreIt from '../../stuffStore/useQueryAndStoreIt';
import { fullSizedLoadMoreButton } from '../../styles/styleFragments';
import { upsertStuff } from '../../stuffStore/stuffSlice';

const StyledMyThings = styled.div`
   article.flexibleThingCard {
      .contentSectionWrapper
         .contentBlock.clickToShowComments
         .newcontentButtons.showingComments {
         ${props => props.theme.mobileBreakpoint} {
            margin-left: -3rem;
         }
      }
   }
   ${fullSizedLoadMoreButton}
`;

const MY_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String, $count: Int) {
      myThings(cursor: $cursor, count: $count) {
         ${fullThingFields}
      }
   }
`;
export { MY_THINGS_QUERY };

const MY_THINGS_SUBSCRIPTION = gql`
   subscription MY_THINGS_SUBSCRIPTION {
      myThings {
         node {
            ${fullThingFields}
         }
      }
   }
`;

const myThingsQueryCount = 10;
export { myThingsQueryCount };

const MyThings = ({ setShowingSidebar, scrollingSelector, borderSide }) => {
   const {
      loggedInUserID,
      memberLoading,
      memberFields: { broadcastView }
   } = useMe('MyThings', 'broadcastView');
   const { setContent } = useContext(ModalContext);

   const myThingsQueryVariables = {
      count: myThingsQueryCount
   };

   const { data, loading, error, fetchMore } = useQueryAndStoreIt(
      MY_THINGS_QUERY,
      {
         ssr: false,
         skip: loggedInUserID == null && !memberLoading,
         variables: myThingsQueryVariables
      }
   );

   const dispatch = useDispatch();
   const { data: subscriptionData } = useSubscription(MY_THINGS_SUBSCRIPTION, {
      onSubscriptionData: ({ client, subscriptionData }) => {
         const newThing = subscriptionData.data.myThings.node;
         // First we need to add the new thing to our stuffStore
         dispatch(upsertStuff(newThing));

         // Then we need to add it to the cached results for our myThings query
         const { myThings } = client.readQuery({
            query: MY_THINGS_QUERY,
            variables: myThingsQueryVariables
         });

         const existingThing = myThings.find(
            oldThing => oldThing.id === newThing.id
         );

         if (existingThing != null) return;

         myThings.push(newThing);

         client.writeQuery({
            query: MY_THINGS_QUERY,
            variables: myThingsQueryVariables,
            data: myThings
         });
      }
   });

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'myThings');

   if (process.browser) {
      scrollerRef.current = document.querySelector(scrollingSelector);
   }

   if (error) {
      return <ErrorMessage error={error} />;
   }

   const displayProps = {
      cardSize: 'small',
      noPic: true,
      borderSide
   };

   if (loading || memberLoading) {
      return <PlaceholderThings count={myThingsQueryCount} {...displayProps} />;
   }

   if (data) {
      if (data.myThings == null || data.myThings.length === 0) {
         return <p className="emptyThings">You haven't made any things yet.</p>;
      }
      if (loggedInUserID != null) {
         let { myThings } = data;
         myThings.sort((a, b) => {
            const aDate = new Date(a.manualUpdatedAt);
            const bDate = new Date(b.manualUpdatedAt);

            const aTimestamp = aDate.getTime();
            const bTimestamp = bDate.getTime();

            return bTimestamp - aTimestamp;
         });
         const lastThing = myThings[myThings.length - 1];
         cursorRef.current = lastThing.manualUpdatedAt;
         if (broadcastView) {
            myThings = myThings.filter(thing => thing.privacy !== 'Private');
         }

         return (
            <StyledMyThings
               onClick={e => {
                  // If they've just navigated to a thing, we want to close the sidebar
                  if (
                     e.target.closest('.titleBarContainer') != null &&
                     setShowingSidebar != null
                  ) {
                     setShowingSidebar(false);
                  }
                  // if (
                  //    e.target.closest('.flexibleThingCard') != null &&
                  //    e.target.closest('.titleWrapper') == null
                  // )
                  //    return; // If they're interacting with a thing card, we don't want to close the sidebar
                  // if (setShowingSidebar != null) {
                  //    setShowingSidebar(false);
                  // }
               }}
            >
               <Things
                  things={myThings}
                  displayType="list"
                  scrollingParentSelector={scrollingSelector}
                  perPage={sidebarPerPage}
                  draggable={router.pathname === '/collections'}
                  groupName="MyThings"
                  {...displayProps}
               />
               <LoadMoreButton
                  loading={loading || isFetchingMore}
                  noMore={noMoreToFetchRef.current}
                  fetchMore={fetchMoreHandler}
               />
            </StyledMyThings>
         );
      }
   }

   if (loggedInUserID == null && !memberLoading) {
      return (
         <p className="emptyThings">
            <Link href={{ pathname: '/login' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Login redirect={false} />);
                  }}
               >
                  Log in
               </a>
            </Link>{' '}
            or{' '}
            <Link href={{ pathname: '/signup' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Signup />);
                  }}
               >
                  sign up
               </a>
            </Link>{' '}
            to start making things!
         </p>
      );
   }
};
MyThings.propTypes = {};

export default MyThings;
