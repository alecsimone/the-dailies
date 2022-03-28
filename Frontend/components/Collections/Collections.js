import { useMutation, useSubscription } from '@apollo/react-hooks';
import CollectionsHeader from './CollectionsHeader';
import {
   COLLECTION_SUBSCRIPTION,
   SET_ACTIVE_COLLECTION_MUTATION
} from './queriesAndMutations';
import LoadingRing from '../LoadingRing';
import { StyledCollection } from './styles';
import CollectionBody from './CollectionBody';

const Collections = ({ activeCollection, allCollections, canEdit }) => {
   // This component is pretty simple, it just handles the mutation to switch collections and its loading state, and the collection subscription. It also serves as the Styled Components wrapper around our collection, although most of the individual parts have their own styled component.
   const [setActiveCollection, { loading }] = useMutation(
      SET_ACTIVE_COLLECTION_MUTATION
   );

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(COLLECTION_SUBSCRIPTION, {
      variables: {
         id: activeCollection.id
      }
   });

   if (loading) {
      return (
         <StyledCollection className="loadingCollection">
            <div className="explanation">Loading Collection...</div>
            <LoadingRing />
         </StyledCollection>
      );
   }

   return (
      <StyledCollection>
         <CollectionsHeader
            setActiveCollection={setActiveCollection}
            allCollections={allCollections}
            activeCollection={activeCollection}
            canEdit={canEdit}
         />
         <CollectionBody
            activeCollection={activeCollection}
            canEdit={canEdit}
         />
      </StyledCollection>
   );
};

export default Collections;
