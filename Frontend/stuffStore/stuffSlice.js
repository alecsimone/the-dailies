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
   // First we get the id and type out of the thingData
   const newStuffType = stuffData.__typename;
   // const newStuffID = stuffData.id;
   const newStuffID = newStuffType === 'Link' ? stuffData.url : stuffData.id;

   // Then we check if the thing is already in the store
   const existingStuff = state[`${newStuffType}:${newStuffID}`];

   // if (newStuffType === 'Link') return;

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
         const copiedInContentReferences = [];
         const commentReferences = [];
         stuffData.content.forEach(contentPiece => {
            upsertNewData(state, contentPiece);
            contentReferences.push(state[`ContentPiece:${contentPiece.id}`]);
         });
         stuffData.copiedInContent.forEach(contentPiece => {
            upsertNewData(state, contentPiece);
            copiedInContentReferences.push(
               state[`ContentPiece:${contentPiece.id}`]
            );
         });
         stuffData.comments.forEach(comment => {
            upsertNewData(state, comment);
            commentReferences.push(state[`Comment:${comment.id}`]);
         });
         stuffData.content = contentReferences;
         stuffData.copiedInContent = copiedInContentReferences;
         stuffData.comments = commentReferences;
         state[`Thing:${newStuffID}`] = stuffData;
      } else if (newStuffType === 'ContentPiece') {
         // If it's a thing, we upsert every comment and then upsert the content piece itself with an array of references to the contentPieces in state
         const commentReferences = [];
         const linkReferences = [];
         stuffData.comments.forEach(comment => {
            upsertNewData(state, comment);
            commentReferences.push(state[`Comment:${comment.id}`]);
         });
         if (stuffData.links != null) {
            stuffData.links.forEach(link => {
               upsertNewData(state, link);
               linkReferences.push(state[`Link:${link.url}`]);
            });
         }
         stuffData.comments = commentReferences;
         stuffData.links = linkReferences;
         state[`ContentPiece:${newStuffID}`] = stuffData;
      } else if (newStuffType === 'Vote') {
         // If it's a vote, we have to find what it's a vote on and then upsert that
         if (stuffData.onThing != null) {
            upsertNewData(state, stuffData.onThing);
         }
         if (stuffData.onContentPiece != null) {
            upsertNewData(state, stuffData.onContentPiece);
         }
         if (stuffData.onComment != null) {
            upsertNewData(state, stuffData.onComment);
         }
      } else if (newStuffType === 'Comment') {
         const linkReferences = [];
         if (stuffData.links != null) {
            stuffData.links.forEach(link => {
               upsertNewData(state, link);
               linkReferences.push(state[`Link:${link.url}`]);
            });
         }
         stuffData.links = linkReferences;
         state[`Comment:${newStuffID}`] = stuffData;
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

      // if (newStuffData.links != null) {
      //    newStuffData.links.forEach(link => {
      //       upsertNewData(state, link);
      //    });
      // }

      if (newStuffData.content != null && newStuffType !== 'ContentPiece') {
         // ContentPieces have a content field too, but it's just the content of the piece, not an array of ContentPieces, which is what this block is expecting
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
         action.payload.forEach(stuffData => {
            upsertNewData(state, stuffData);
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
