import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { upsertStuff, upsertStuffArray } from './stuffSlice';

const useQueryAndStoreIt = (query, optionsObject) => {
   const dispatch = useDispatch();

   // We start by running the query as normal
   const response = useQuery(query, optionsObject);

   const { data } = response;
   // console.log(data, query.definitions[0].name.value);
   if (data) {
      // First we need to pull the actual data out of our data object. It will be stored under a key we don't know the name of, but we can just loop through every key (it will probably be the only one)
      const dataKeys = Object.keys(data);
      dataKeys.forEach(key => {
         if (data[key] != null) {
            if (data[key].__typename === 'Member') {
               const memberThings = data[key].createdThings;
               if (memberThings != null) {
                  // console.log('dispatch new stuff array', data[key]);
                  dispatch(upsertStuffArray(memberThings));
               }
               const memberVotes = data[key].votes;
               if (memberVotes != null) {
                  // console.log('dispatch new stuff array', data[key]);
                  dispatch(upsertStuffArray(memberVotes));
               }
            } else if (key === 'getLinkData') {
               // console.log('dispatch new stuff', data[key]);
               dispatch(upsertStuff(data[key]));
            } else if (Array.isArray(data[key])) {
               // console.log('dispatch new stuff array', data[key]);
               dispatch(upsertStuffArray(data[key]));
            } else {
               // console.log('dispatch new stuff', data[key]);
               dispatch(upsertStuff(data[key]));
            }
         }
      });
   }

   return response;
};

export default useQueryAndStoreIt;

const useLazyQueryAndStoreIt = (query, optionsObject) => {
   const dispatch = useDispatch();

   const storeData = data => {
      // First we need to pull the actual data out of our data object. It will be stored under a key we don't know the name of, but we can just loop through every key (it will probably be the only one)
      const dataKeys = Object.keys(data);
      dataKeys.forEach(key => {
         if (data[key].__typename === 'Member') {
            const memberThings = data[key].createdThings;
            if (memberThings != null) {
               dispatch(upsertStuffArray(memberThings));
            }

            const memberVotes = data[key].votes;
            if (memberVotes != null) {
               dispatch(upsertStuffArray(memberVotes));
            }
         } else if (Array.isArray(data[key])) {
            // console.log('dispatch new stuff array', data[key]);
            dispatch(upsertStuffArray(data[key]));
         } else {
            // console.log('dispatch new stuff', data[key]);
            dispatch(upsertStuff(data[key]));
         }
      });
   };

   if (optionsObject.onCompleted) {
      const providedOnCompleted = optionsObject.onCompleted;
      optionsObject.onCompleted = data => {
         providedOnCompleted(data);
         storeData(data);
      };
   } else {
      optionsObject.onCompleted = data => storeData(data);
   }

   // We start by running the query as normal
   const response = useLazyQuery(query, optionsObject);

   return response;
};

export { useLazyQueryAndStoreIt };
