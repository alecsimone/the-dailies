import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { ADD_COLLECTION_MUTATION } from './queriesAndMutations';

const AddCollectionButton = () => {
   const router = useRouter();

   const [addCollection, { loading }] = useMutation(ADD_COLLECTION_MUTATION, {
      onCompleted: data => {
         const newCollectionID = data.addCollection.lastActiveCollection.id;
         if (router.query.id !== newCollectionID) {
            router.push({
               pathname: '/collections',
               query: {
                  id: newCollectionID
               }
            });
         }
      }
   });

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
