import { useMutation } from '@apollo/react-hooks';
import CollectionsHeader from './CollectionsHeader';
import { SET_ACTIVE_COLLECTION_MUTATION } from './queriesAndMutations';
import LoadingRing from '../LoadingRing';
import { StyledCollection } from './styles';
import CollectionBody from './CollectionBody';

const Collections = ({ fetchMoreButton, activeCollection, allCollections, setThingFilterString }) => {
   const [setActiveCollection, { loading }] = useMutation(
      SET_ACTIVE_COLLECTION_MUTATION
   );

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
         />
         <CollectionBody
            activeCollection={activeCollection}
            fetchMoreButton={fetchMoreButton}
         />
      </StyledCollection>
   );
};

export default Collections;
