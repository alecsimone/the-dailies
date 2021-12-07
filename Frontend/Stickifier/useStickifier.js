import { useDispatch } from 'react-redux';
import { getRandomString } from '../lib/TextHandling';
import { addBlock } from './stickifierSlice';

const getScrollingParent = el => {
   if (el == null) return;
   let currentParent = el.parentElement;
   let scrollingParent = null;
   while (scrollingParent == null && currentParent != null) {
      const currentParentStyle = window.getComputedStyle(currentParent);
      if (currentParentStyle.overflowY === 'auto') {
         scrollingParent = currentParent;
      } else {
         currentParent = currentParent.parentElement;
      }
   }
   return scrollingParent;
};
export { getScrollingParent };

// This is the hook content pieces will call to register themselves for stickification. It will generate a random ID for them, making sure that ID is unique. Then it will add them to the store so the StickifierHost can keep track of them.
const useStickifier = block => {
   const dispatch = useDispatch();
   // If we're passed a block as a parameter, that means the contentPiece is already mounted and is just re-rendering and we don't need to handle it again. If we're not, that means we've got a new content piece and we do need to handle it.
   if (block == null) {
      let newStickifierID = getRandomString(32);

      // Just in case we somehow randomly generated the same ID twice, let's check to make sure there's no element that already has this stickifierID
      let existingElementWithID = document.querySelector(
         `[data-stickifierid='${newStickifierID}'`
      );
      while (existingElementWithID != null) {
         newStickifierID = getRandomString(32);
         existingElementWithID = document.querySelector(
            `[data-stickifierid='${newStickifierID}'`
         );
      }

      dispatch(addBlock(newStickifierID));
      return newStickifierID;
   }
};
export default useStickifier;
