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

const upsertNewData = (state, stuffData) => {
   // First we get the id out of the thingData
   const newStuffID = stuffData.id;
   const newStuffType = stuffData.__typename;

   // Then we check if the thing is already in the store
   const existingStuff = state[`${newStuffType}:${newStuffID}`];

   if (existingStuff == null) {
      // If it isn't, we add it
      if (newStuffType === 'Tag') {
         // If it's a tag, we upsert every connectedThing, then upsert the tag itself with an array of references to the things in state
         const thingReferences = [];
         const contentReferences = [];
         const commentReferences = [];
         stuffData.connectedThings.forEach(thing => {
            upsertNewData(state, thing);
            thingReferences.push(state[`Thing:${thing.id}`]);
         });
         stuffData.content.forEach(contentPiece => {
            upsertNewData(state, contentPiece);
            contentReferences.push(state[`ContentPiece:${contentPiece.id}`]);
         });
         stuffData.comments.forEach(comment => {
            upsertNewData(state, comment);
            commentReferences.push(state[`Comment:${comment.id}`]);
         });
         stuffData.connectedThings = thingReferences;
         stuffData.content = contentReferences;
         stuffData.comments = commentReferences;
         state[`Tag:${newStuffID}`] = stuffData;
      } else if (newStuffType === 'Thing') {
         // If it's a thing, we upsert every contentPiece and then upsert the thing itself with an array of references to the contentPieces in state
         const contentReferences = [];
         const commentReferences = [];
         stuffData.content.forEach(contentPiece => {
            upsertNewData(state, contentPiece);
            contentReferences.push(state[`ContentPiece:${contentPiece.id}`]);
         });
         stuffData.comments.forEach(comment => {
            upsertNewData(state, comment);
            commentReferences.push(state[`Comment:${comment.id}`]);
         });
         stuffData.content = contentReferences;
         stuffData.comments = commentReferences;
         state[`Thing:${newStuffID}`] = stuffData;
      } else {
         state[`${newStuffType}:${newStuffID}`] = stuffData;
      }
   } else {
      // If it does exist, we make an object of the changes
      const newStuffData = makeNewDataObject(stuffData, existingStuff);

      // Then we check if it has any of the sub-categories that we store separately. If it does, we upsert those items
      if (newStuffData.connectedThings != null) {
         newStuffData.connectedThings.forEach(thing =>
            upsertNewData(state, thing)
         );
      }

      if (newStuffData.comments != null) {
         newStuffData.comments.forEach(comment =>
            upsertNewData(state, comment)
         );
      }

      if (newStuffData.content != null) {
         newStuffData.content.forEach(contentPiece =>
            upsertNewData(state, contentPiece)
         );
      }

      // And then add the newDataObject to the existing data
      if (Object.keys(newStuffData).length > 0) {
         state[`${newStuffType}:${newStuffID}`] = {
            ...state[`${newStuffType}:${newStuffID}`],
            ...newStuffData
         };
      }
   }
};

export const stuffSlice = createSlice({
   name: 'stuffData',
   initialState: {},
   reducers: {
      upsertStuff: (state, action) => {
         upsertNewData(state, action.payload);
      },
      upsertStuffArray: (state, action) => {
         // Take an array of objects containing data for things, and check if we already have them in the store. If we do, update them. If not, add them.
         action.payload.forEach(thingUpdate => {
            upsertNewData(state, thingUpdate);
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
   upsertStuff,
   upsertStuffArray,
   removeThing,
   removeThings
} = stuffSlice.actions;

export default stuffSlice.reducer;
