import { configureStore } from '@reduxjs/toolkit';
import stuffReducer from './stuffSlice';
import stickifierReducer from '../Stickifier/stickifierSlice';

export default configureStore({
   reducer: {
      stuff: stuffReducer,
      stickifier: stickifierReducer
   }
});
