import { configureStore } from '@reduxjs/toolkit';
import thingReducer from './thingSlice';

export default configureStore({
   reducer: {
      things: thingReducer
   }
});
