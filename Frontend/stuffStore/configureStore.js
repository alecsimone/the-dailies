import { configureStore } from '@reduxjs/toolkit';
import stuffReducer from './stuffSlice';

export default configureStore({
   reducer: {
      stuff: stuffReducer
   }
});
