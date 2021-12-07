import { createSlice } from '@reduxjs/toolkit';

export const stuffSlice = createSlice({
   name: 'stickifierData',
   initialState: {
      blocks: {},
      scrollers: {}
   },
   reducers: {
      addBlock: (state, action) => {
         if (state.blocks[action.payload] == null) {
            state.blocks[action.payload] = {};
         }
      },
      addScroller: (state, action) => {
         if (state.scrollers[action.payload] == null) {
            state.scrollers[action.payload] = {
               blocks: []
            };
         }
      },
      addBlockToScroller: (state, action) => {
         const { scrollerID, blockID } = action.payload;
         if (state.scrollers[scrollerID] != null) {
            if (!state.scrollers[scrollerID].blocks.includes(blockID)) {
               state.scrollers[scrollerID].blocks.push(blockID);
            }
         }
      },
      removeBlockFromScroller: (state, action) => {
         const { scrollerID, blockID } = action.payload;
         if (state.scrollers[scrollerID] != null) {
            state.scrollers[scrollerID].blocks = state.scrollers[
               scrollerID
            ].blocks.filter(id => id !== blockID);
         }
      }
   }
});

export const {
   addBlock,
   addScroller,
   addBlockToScroller,
   removeBlockFromScroller
} = stuffSlice.actions;

export default stuffSlice.reducer;
