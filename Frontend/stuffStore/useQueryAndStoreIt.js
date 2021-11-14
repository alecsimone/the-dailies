import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { upsertStuff, upsertStuffArray } from './stuffSlice';

const useQueryAndStoreIt = (query, optionsObject) => {
   const dispatch = useDispatch();

   // We start by running the query as normal
   const response = useQuery(query, optionsObject);

   const { data } = response;
   if (data) {
      // First we need to pull the actual data out of our data object. It will be stored under a key we don't know the name of, but we can just loop through every key (it will probably be the only one)
      const dataKeys = Object.keys(data);
      dataKeys.forEach(key => {
         if (Array.isArray(data[key])) {
            // console.log('dispatch new stuff array', data[key]);
            dispatch(upsertStuffArray(data[key]));
         } else {
            // console.log('dispatch new stuff', data[key]);
            dispatch(upsertStuff(data[key]));
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
         if (Array.isArray(data[key])) {
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
