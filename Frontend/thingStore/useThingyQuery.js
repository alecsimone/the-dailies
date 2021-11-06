import { useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { upsertThing, upsertThings } from './thingSlice';

const useThingyQuery = (query, optionsObject) => {
   const dispatch = useDispatch();

   // We start by running the query as normal
   const response = useQuery(query, optionsObject);

   const { data } = response;
   if (data) {
      // First we need to pull the actual data out of our data object. It will be stored under a key we don't know the name of, but we can just loop through every key (it will probably be the only one)
      const dataKeys = Object.keys(data);
      dataKeys.forEach(key => {
         if (Array.isArray(data[key])) {
            // If the data is an array, we filter out all the things and upsert them
            const things = data[key].filter(
               item => item.__typename === 'Thing'
            );
            // console.log('dispatch new things', things);
            dispatch(upsertThings(things));
         } else {
            // If it's just a single object, we check that it's a thing, and if it is, we upsert it
            if (data[key].__typename !== 'Thing') return;
            // console.log('dispatch new thing', data[key]);
            dispatch(upsertThing(data[key]));
         }
      });
   }

   return response;
};

export default useThingyQuery;
