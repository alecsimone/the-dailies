import gql from 'graphql-tag';
import { useRef, useState, useEffect } from 'react';
import Router from 'next/router';
import { thingCardFields } from './CardInterfaces';

const disabledCodewords = ['disabled', 'disable', 'false', 'no', 'off', 'x'];
export { disabledCodewords };

const checkForNewThingRedirect = (thingID, mutationName, data) => {
   if (thingID === 'new') {
      Router.push({
         pathname: '/thing',
         query: { id: data[mutationName].id }
      });
   }
};
export { checkForNewThingRedirect };

const ALL_THINGS_QUERY = gql`
   query ALL_THINGS_QUERY($cursor: String) {
      allThings(cursor: $cursor) {
         ${thingCardFields}
      }
   }
`;
export { ALL_THINGS_QUERY };

const useInfiniteScroll = (fetchMore, scrollingChild, queryName) => {
   const scrollerRef = useRef(null);

   const cursorRef = useRef('');
   const isFetchingMoreRef = useRef(false); // Since scrolling happens so rapidly, we use a ref to block more fetches as quickly as possible
   const [isFetchingMore, setIsFetchingMore] = useState(false); // But we also use state so we can trigger re-renders

   const noMoreToFetchRef = useRef(false); // We need the ref to be able to pass updated data to the fetchMoreHandler
   const [noMoreToFetch, setNoMoreToFetch] = useState(false); // But we need the state to trigger a re-render, even though we don't actually use the state anywhere

   const fetchMoreHandler = () => {
      if (noMoreToFetchRef.current) return;

      setIsFetchingMore(true);
      isFetchingMoreRef.current = true;
      console.log(cursorRef.current);
      fetchMore({
         variables: {
            cursor: cursorRef.current
         },
         updateQuery: (prev, { fetchMoreResult }) => {
            isFetchingMoreRef.current = false;
            setIsFetchingMore(false);

            if (!fetchMoreResult) return prev;

            if (
               fetchMoreResult[queryName] &&
               fetchMoreResult[queryName].length === 0
            ) {
               noMoreToFetchRef.current = true;
               setNoMoreToFetch(true);
            }
            if (queryName === 'taxByTitle') {
               if (
                  fetchMoreResult[queryName] &&
                  fetchMoreResult[queryName].connectedThings.length === 0
               ) {
                  noMoreToFetchRef.current = true;
                  setNoMoreToFetch(true);
               }

               const connectedThings = prev[queryName].connectedThings.concat(
                  fetchMoreResult[queryName].connectedThings
               );
               return {
                  [queryName]: {
                     ...prev[queryName],
                     connectedThings
                  }
               };
            }
            console.log(prev);
            if (prev == null) {
               console.log('prev is undefined though');
               console.log(prev);
               return {
                  [queryName]: fetchMoreResult[queryName]
               };
            }
            return {
               [queryName]: [...prev[queryName], ...fetchMoreResult[queryName]]
            };
         }
      });
   };

   const scrollHandler = e => {
      if (isFetchingMoreRef.current) return;

      const scrollingSection = scrollerRef.current;

      if (noMoreToFetchRef.current) {
         scrollingSection.removeEventListener('scroll', scrollHandler);
      }
      const thingsContainer = scrollingSection.querySelector(scrollingChild);

      const totalHeight = thingsContainer.offsetHeight; // Note that this is pretty imprecise. There are other elements in there and padding and stuff. But since we're pretty arbitrarily picking the distance from the bottom of the section at which to load more things, I don't think we need to be all that precise here. Especially since this function runs every single scroll tick.

      const windowHeight = window.innerHeight;
      const { scrollTop } = scrollingSection;

      if (scrollTop + windowHeight + 1000 > totalHeight) {
         fetchMoreHandler();
      }
   };

   useEffect(() => {
      const scrollingSection = scrollerRef.current;
      if (scrollingSection == null) return;

      scrollingSection.addEventListener('scroll', scrollHandler);
   }, [scrollHandler, scrollerRef]);

   return {
      scrollerRef,
      cursorRef,
      isFetchingMoreRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   };
};
export { useInfiniteScroll };
