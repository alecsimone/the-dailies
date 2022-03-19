import { useMutation, useSubscription } from '@apollo/react-hooks';
import CollectionsHeader from './CollectionsHeader';
import {
   COLLECTION_SUBSCRIPTION,
   SET_ACTIVE_COLLECTION_MUTATION
} from './queriesAndMutations';
import LoadingRing from '../LoadingRing';
import { StyledCollection } from './styles';
import CollectionBody from './CollectionBody';

const Collections = ({
   activeCollection,
   allCollections,
   setThingFilterString,
   canEdit
}) => {
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
            setThingFilterString={setThingFilterString}
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
