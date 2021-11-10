import { useQuery } from '@apollo/react-hooks';
import React, { useState, useRef } from 'react';
import SignupOrLogin from '../components/Account/SignupOrLogin';
import {
   COLLECTIONS_PAGE_QUERY,
   MY_BIG_THINGS_QUERY
} from '../components/Collections/queriesAndMutations';
import LoadingRing from '../components/LoadingRing';
import Error from '../components/ErrorMessage';
import AddCollectionButton from '../components/Collections/AddCollectionButton';
import { StyledNoCollections } from '../components/Collections/styles';
import Collections from '../components/Collections/Collections';
import { sortByUpdatedTime } from '../components/Collections/cardHandling';
import useMe from '../components/Account/useMe';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';

const CollectionsThingsContext = React.createContext();
export { CollectionsThingsContext };

const CollectionsPage = ({ query }) => {
   const { loggedInUserID, memberLoading } = useMe();

   const {
      data: collectionsData,
      loading: collectionsLoading,
      error: collectionsError
   } = useQuery(COLLECTIONS_PAGE_QUERY, {
      skip: loggedInUserID == null
   });

   const {
      data: thingsData,
      loading: loadingThings,
      error: thingsError,
      fetchMore: fetchMoreThings
   } = useQueryAndStoreIt(MY_BIG_THINGS_QUERY, {
      variables: {
         forCollection: '1'
      },
      ssr: false,
      skip: loggedInUserID == null
   });

   const [isFetchingMore, setIsFetchingMore] = useState(false);
   const [noMoreToFetch, setNoMoreToFetch] = useState(false);
   const cursorRef = useRef(null);

   const [thingFilterString, setThingFilterString] = useState('');

   const fetchMoreThingsHandler = () => {
      if (isFetchingMore || noMoreToFetch) return;
      setIsFetchingMore(true);

      fetchMoreThings({
         variables: {
            cursor: cursorRef.current,
            forCollection:
               collectionsData.getCollections.lastActiveCollection.id
         },
         updateQuery: (prev, { fetchMoreResult }) => {
            setIsFetchingMore(false);

            if (!fetchMoreResult) return prev;
            if (!prev) return fetchMoreResult;

            if (
               fetchMoreResult.myThings &&
               fetchMoreResult.myThings.length === 0
            ) {
               setNoMoreToFetch(true);
            }

            return {
               myThings: [...prev.myThings, ...fetchMoreResult.myThings]
            };
         }
      });
   };

   if (loggedInUserID == null) return <SignupOrLogin explanation styled />;
   if (memberLoading || loadingThings) return <LoadingRing />;

   if (collectionsData) {
      const {
         lastActiveCollection: activeCollection,
         collections
      } = collectionsData.getCollections;
      if (
         activeCollection == null &&
         (collections == null || collections.length === 0)
      ) {
         // If there are no collections, we're just going to show an add collection button
         return (
            <StyledNoCollections className="noCollections">
               <p>You don't have any collections yet</p>
               <AddCollectionButton />
            </StyledNoCollections>
         );
      }

      const { myThings } = thingsData;
      myThings.sort(sortByUpdatedTime);
      const lastThing = myThings[myThings.length - 1];
      cursorRef.current = lastThing.updatedAt;

      const fetchMoreButton = (
         <button
            type="button"
            className="more"
            onClick={fetchMoreThingsHandler}
         >
            {isFetchingMore
               ? 'Loading...'
               : `${noMoreToFetch ? 'No More' : 'Load More'}`}
         </button>
      );

      const filteredThings = thingsData.myThings.filter(thing =>
         thing.title.toLowerCase().includes(thingFilterString.toLowerCase())
      );

      return (
         <CollectionsThingsContext.Provider
            value={{
               things: filteredThings
            }}
         >
            <Collections
               activeCollection={activeCollection}
               allCollections={collections}
               fetchMoreButton={fetchMoreButton}
               setThingFilterString={setThingFilterString}
            />
         </CollectionsThingsContext.Provider>
      );
   }

   if (collectionsLoading) {
      return <LoadingRing />;
   }

   if (collectionsError) {
      return <Error error={collectionsError} />;
   }
   if (thingsError) {
      return <Error error={thingsError} />;
   }
   return <div>Something went terribly wrong</div>;
};

export default CollectionsPage;
