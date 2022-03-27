import { useQuery } from '@apollo/react-hooks';
import SignupOrLogin from '../components/Account/SignupOrLogin';
import {
   COLLECTIONS_PAGE_QUERY,
   SPECIFIC_COLLECTION_QUERY
} from '../components/Collections/queriesAndMutations';
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

   const {
      data: specificCollectionData,
      loading: specificCollectionLoading,
      error: specificCollectionError
   } = useQuery(SPECIFIC_COLLECTION_QUERY, {
      variables: {
         id: query.id
      },
      skip: query.id == null
   });

   if (loggedInUserID == null && query.id == null)
      return <SignupOrLogin explanation styled />;
   if (memberLoading) return <LoadingRing />;

   if (specificCollectionData) {
      return (
         <Collections
            activeCollection={specificCollectionData.getCollection}
            canEdit={
               specificCollectionData.getCollection.author.id === loggedInUserID
            }
            allCollections={
               collectionsData != null
                  ? collectionsData.getCollections.collections
                  : []
            }
         />
      );
   }

   if (specificCollectionError) {
      return (
         <StyledNoCollections>
            <div className="errorWrapper">
               <Error error={specificCollectionError} />
            </div>
         </StyledNoCollections>
      );
   }

   if (query.id == null && collectionsData) {
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

      if (query.id == null && process.browser) {
         window.history.pushState(
            'Collections',
            '',
            `/collections?id=${activeCollection.id}`
         );
      }

      return (
         <Collections
            activeCollection={activeCollection}
            canEdit={activeCollection.author.id === loggedInUserID}
            allCollections={collections}
         />
      );
   }

   if (collectionsLoading || specificCollectionLoading) {
      return <LoadingRing />;
   }

   if (collectionsError) {
      return (
         <StyledNoCollections>
            <div className="errorWrapper">
               <Error error={collectionsError} />
            </div>
         </StyledNoCollections>
      );
   }
   return <div>Something went terribly wrong</div>;
};

CollectionsPage.getInitialProps = async ctx => ({ query: ctx.query });

export default CollectionsPage;
