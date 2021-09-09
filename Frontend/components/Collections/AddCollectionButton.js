import { useMutation } from '@apollo/react-hooks';
import { ADD_COLLECTION_MUTATION } from './queriesAndMutations';

const AddCollectionButton = () => {
   const [addCollection, { loading }] = useMutation(ADD_COLLECTION_MUTATION);

   return (
      <button
         type="button"
         onClick={() => {
            if (loading) return;
            addCollection();
         }}
      >
         {loading ? 'loading...' : 'new collection'}
      </button>
   );
};

export default AddCollectionButton;
