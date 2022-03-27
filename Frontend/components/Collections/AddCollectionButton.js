import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import X from '../Icons/X';
import { ADD_COLLECTION_MUTATION } from './queriesAndMutations';

const AddCollectionButton = ({ type = 'text' }) => {
   const router = useRouter();

   const [addCollection, { loading }] = useMutation(ADD_COLLECTION_MUTATION, {
      onCompleted: data => {
         const newCollectionID = data.addCollection.lastActiveCollection.id;
         if (router.query.id != null && router.query.id !== newCollectionID) {
            router.push({
               pathname: '/collections',
               query: {
                  id: newCollectionID
               }
            });
         }
      }
   });

   if (type === 'icon') {
      return (
         <div className="buttonWrapper">
            <X
               color="lowContrastGrey"
               className={loading ? 'adding' : 'ready'}
               onClick={() => {
                  if (loading) return;
                  addCollection();
               }}
            />
         </div>
      );
   }

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
