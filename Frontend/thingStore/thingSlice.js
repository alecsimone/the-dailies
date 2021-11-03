import { createSlice } from '@reduxjs/toolkit';

export const thingSlice = createSlice({
   name: 'thingData',
   initialState: {},
   reducers: {
      upsertThing: (state, action) => {
         // Take an object containing data for a single thing. If it's in the store, update it. If not, add it to the store
         const newThingID = action.payload.id;
         const thingToUpdate = state[newThingID];
         if (thingToUpdate != null) {
            state[newThingID] = {
               ...state[newThingID],
               ...action.payload
            };
         } else {
            state[newThingID] = action.payload;
         }
      },
      upsertThings: (state, action) => {
         // Take an array of objects containing data for things, and check if we already have them in the store. If we do, update them. If not, add them.
         action.payload.forEach(thingUpdate => {
            const newThingID = thingUpdate.id;
            const thingToUpdate = state[newThingID];
            if (thingToUpdate != null) {
               state[newThingID] = { ...thingToUpdate, ...thingUpdate };
            } else {
               state[newThingID] = thingUpdate;
            }
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
