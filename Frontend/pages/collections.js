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

   // There are two potential queries we might be running. The first we have to run as long as we have a logged in user. It gets basic information about all of the current member's collections so that we can display them in the collections selector interface that allows the member to change collections, then it also gets full information about their last active collection, which will be displayed unless the URL query specified a different collection to be displayed.
   const {
      data: collectionsData,
      loading: collectionsLoading,
      error: collectionsError
   } = useQuery(COLLECTIONS_PAGE_QUERY, {
      skip: loggedInUserID == null
   });

   // If the URL query does specify a different collection to display, this query will fetch it
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

   // Only logged in members can use the collections app, but anyone can view a specific collection (assuming it's public, which will be checked on the backend)
   if (loggedInUserID == null && query.id == null)
      return <SignupOrLogin explanation styled />;
   if (memberLoading) return <LoadingRing />;

   // Since the specificCollection query overrides the general collections query, we check for its data first
   if (specificCollectionData) {
      // We need to know if the logged in user is an editor of this collection. If they're the author of the collection, they definitely are, so we'll start there.
      let isEditor =
         specificCollectionData.getCollection.author.id === loggedInUserID;
      specificCollectionData.getCollection.editors.forEach(editorObj => {
         if (isEditor) return; // Once we know they're an editor, there's no need for any more loops.
         if (editorObj.id === loggedInUserID) {
            isEditor = true;
         }
      });

      return (
         <Collections
            activeCollection={specificCollectionData.getCollection}
            canEdit={isEditor}
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

   // We only want to display the last active collection if there was no specific collection requested. Even though we already returned a node if we have specific collection data, that condition wouldn't pass if we're loading specificCollectionData but not collectionsData, thus we do a query.id == null check here as well.
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
         // If the member did not request a specific collection, we still want to update the URL in the browser to represent the current collection so that it may be shared easily, but we don't want to reload the page.
         window.history.pushState(
            'Collections',
            '',
            `/collections?id=${activeCollection.id}`
         );
      }

      // We need to know if the logged in user is an editor of this collection. If they're the author of the collection, they definitely are, so we'll start there.
      let isEditor = activeCollection.author.id === loggedInUserID;
      activeCollection.editors.forEach(editorObj => {
         if (isEditor) return; // Once we know they're an editor, there's no need for any more loops.
         if (editorObj.id === loggedInUserID) {
            isEditor = true;
         }
      });

      return (
         <Collections
            activeCollection={activeCollection}
            canEdit={isEditor}
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
