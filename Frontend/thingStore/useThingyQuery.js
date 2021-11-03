import { useQuery } from '@apollo/react-hooks';
import _, { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { upsertThing, upsertThings } from './thingSlice';

// function difference(object, base) {
//    function changes(object, base) {
//       // Given two objects, object and base
//       return _.transform(object, function(result, value, key) {
//          if (!_.isEqual(value, base[key])) {
//             result[key] =
//                _.isObject(value) && _.isObject(base[key])
//                   ? changes(value, base[key])
//                   : value;
//          }
//       });
//    }
//    return changes(object, base);
// }

const makeNewDataObject = (newData, oldData) => {
   const newDataObj = {};
   // For our purposes, we just need to find out which keys represent new data in the newData parameter
   const newDataKeys = Object.keys(newData);
   newDataKeys.forEach(key => {
      if (oldData[key] == null && newDataObj[key] != null) {
         // If the oldData doesn't have that property, we know we need it
         newDataObj[key] = newData[key];
      } else if (newData[key] != null) {
         // If both objects have the property, check if they have equal values. If the new data doesn't have the property, we don't care about it, so we exclude those cases
         const keyIsEqual = isEqual(newData[key], oldData[key]);
         if (!keyIsEqual) {
            newDataObj[key] = newData[key];
         }
      }
   });
   return newDataObj;
};

const useThingyQuery = (query, optionsObject) => {
   const previousDataRef = useRef(null);
   const dispatch = useDispatch();

   // We start by running the query as normal
   const response = useQuery(query, optionsObject);

   // useEffect(() => { // This feels like it should be an effect, mostly because it's literally a side effect, but if it is then it doesn't get data into the store in time, so we're just going to put it in the body of the component like this
   const { data } = response;
   if (data) {
      // Now we need to loop through the new data, see if it exists in our previousDataRef and if so, if any of it has been changed, and if there are any changes we need to dispatch them to our Redux store
      // First we need to pull the actual data out of our data object. It will be stored under a key we don't know the name of, but we can just loop through every key (it will probably be the only one)
      const dataKeys = Object.keys(data);
      dataKeys.forEach(key => {
         if (
            previousDataRef.current == null ||
            previousDataRef.current[key] == null ||
            previousDataRef.current[key].length === 0
         ) {
            // If we don't have any things in the store yet, we can just add all these things
            if (Array.isArray(data[key])) {
               // If the data is an array, we filter out all the things and upsert them
               const things = data[key].filter(
                  item => item.__typename === 'Thing'
               );
               console.log('dispatch new things', things);
               dispatch(upsertThings(things));
            } else {
               // If it's just a single object, we check that it's a thing, and if it is, we upsert it
               if (data[key].__typename !== 'Thing') return;
               console.log('dispatch new thing', data[key]);
               dispatch(upsertThing(data[key]));
            }
         } else {
            // If we have things in the store already, we have to figure out if any of our data is not in it and then upsert that new info
            const newData = data[key];
            if (Array.isArray(newData)) {
               // We need to make two arrays, one for things that are already in state, one for things that aren't.
               const existingThingsFromNewData = [];
               const newThings = [];
               newData.forEach(datum => {
                  // We only want to work with Things, so we check to make sure this is one first
                  if (datum.__typename === 'Thing') {
                     // We look for the thing in our previous state
                     const existingThing = previousDataRef.current[key].find(
                        thing => thing.id === datum.id
                     );
                     if (existingThing != null) {
                        // If we find it, diff the new thing against the existing thing
                        const newThingData = makeNewDataObject(
                           datum,
                           existingThing
                        );
                        if (Object.keys(newThingData).length > 0) {
                           // If there's new data, we add the ID in there so we can identify it
                           newThingData.id = datum.id;
                           // And then push it into the existingThingsArray
                           existingThingsFromNewData.push(newThingData);
                        }
                     } else {
                        // If we don't, put it in the newThings array
                        newThings.push(datum);
                     }
                  }
               });
               // Then we want to concatenate our two arrays and upsert them;
               const allChanges = newThings.concat(existingThingsFromNewData);
               console.log('dispatch updated things', allChanges);
               dispatch(upsertThings(allChanges));
            } else {
               // If our data is just a single thing, we check if it already exists in the store
               const existingThing = previousDataRef.current[key];
               if (existingThing != null) {
                  // If it does exist, we find the differences between the new thing and the old thing
                  const newThingData = makeNewDataObject(
                     newData,
                     existingThing
                  );
                  if (Object.keys(newThingData).length > 0) {
                     // If there's new data, we add the ID in there so we can identify it
                     newThingData.id = newData.id;
                     console.log('dispatch updated thing', newThingData);
                     dispatch(upsertThing(newThingData));
                  }
               } else {
                  console.log('dispatch newly found thing', newData);
                  dispatch(upsertThing(newData));
               }
            }
         }
      });
      previousDataRef.current = data;
   }
   // });

   return response;
};

export default useThingyQuery;
