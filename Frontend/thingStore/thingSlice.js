import { createSlice } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';

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

const upsertNewData = (state, thingData) => {
   // First we get the id out of the thingData
   const newThingID = thingData.id;

   // Then we check if the thing is already in the store
   const existingThing = state[newThingID];

   if (existingThing == null) {
      // If it isn't, we just add it
      state[newThingID] = thingData;
   } else {
      // If it is, we make an object of the changes
      const newThingData = makeNewDataObject(thingData, existingThing);

      // And then add that to the existing data
      if (Object.keys(newThingData).length > 0) {
         state[newThingID] = {
            ...state[newThingID],
            ...newThingData
         };
      }
   }
};

export const thingSlice = createSlice({
   name: 'thingData',
   initialState: {},
   reducers: {
      upsertThing: (state, action) => {
         upsertNewData(state, action.payload);
         // // Take an object containing data for a single thing. If it's in the store, update it. If not, add it to the store
         // const newThingID = action.payload.id;
         // const thingToUpdate = state[newThingID];
         // if (thingToUpdate != null) {
         //    state[newThingID] = {
         //       ...state[newThingID],
         //       ...action.payload
         //    };
         // } else {
         //    state[newThingID] = action.payload;
         // }
      },
      upsertThings: (state, action) => {
         // Take an array of objects containing data for things, and check if we already have them in the store. If we do, update them. If not, add them.
         action.payload.forEach(thingUpdate => {
            upsertNewData(state, thingUpdate);
            // const newThingID = thingUpdate.id;
            // const thingToUpdate = state[newThingID];
            // if (thingToUpdate != null) {
            //    state[newThingID] = { ...thingToUpdate, ...thingUpdate };
            // } else {
            //    state[newThingID] = thingUpdate;
            // }
         });
      },
      removeThing: (state, action) => {
         // Take a thingID and remove its data object from the store
         const thingToDeleteID = action.payload.id;
         delete state[thingToDeleteID];
      },
      removeThings: (state, action) => {
         // Take an array of thingIDs and remove each of their data objects from the store
         action.payload.forEach(thingToDeleteID => {
            delete state[thingToDeleteID];
         });
      }
   }
});

export const {
   upsertThing,
   upsertThings,
   removeThing,
   removeThings
} = thingSlice.actions;

export default thingSlice.reducer;
