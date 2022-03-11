import { useQuery } from '@apollo/react-hooks';
import SignupOrLogin from '../components/Account/SignupOrLogin';
import { COLLECTIONS_PAGE_QUERY } from '../components/Collections/queriesAndMutations';
import LoadingRing from '../components/LoadingRing';
import Error from '../components/ErrorMessage';
import AddCollectionButton from '../components/Collections/AddCollectionButton';
import { StyledNoCollections } from '../components/Collections/styles';
import Collections from '../components/Collections/Collections';
import useMe from '../components/Account/useMe';

const CollectionsPage = ({ query }) => {
   const { loggedInUserID, memberLoading } = useMe();

   const {
      data: collectionsData,
      loading: collectionsLoading,
      error: collectionsError
   } = useQuery(COLLECTIONS_PAGE_QUERY, {
      skip: loggedInUserID == null
   });

   if (loggedInUserID == null) return <SignupOrLogin explanation styled />;
   if (memberLoading) return <LoadingRing />;

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

      return (
         <Collections
            activeCollection={activeCollection}
            allCollections={collections}
         />
      );
   }

   if (collectionsLoading) {
      return <LoadingRing />;
   }

   if (collectionsError) {
      return <Error error={collectionsError} />;
   }
   return <div>Something went terribly wrong</div>;
};

export default CollectionsPage;
