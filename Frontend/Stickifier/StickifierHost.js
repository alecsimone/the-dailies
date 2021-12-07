import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stickifyBlock } from './stickifier';
import { addBlockToScroller, removeBlockFromScroller } from './stickifierSlice';
import { getScrollingParent } from './useStickifier';

const StickifierHost = () => {
   const dispatch = useDispatch();

   const stickifierObserverRef = useRef(null);

   const blocks = useSelector(state => Object.keys(state.stickifier.blocks));
   const blocksRef = useRef([]);

   blocks.forEach(block => {
      if (
         stickifierObserverRef.current != null &&
         !blocksRef.current.includes(block)
      ) {
         window.setTimeout(() => {
            // We need to wait for the content blocks to mount before we can observe them
            const blockElement = document.querySelectorAll(
               `[data-stickifierid='${block}'`
            )[0];
            if (blockElement != null) {
               stickifierObserverRef.current.observe(blockElement);
            }
         }, 1);

         blocksRef.current.push(block);
      }
   });

   const scrollers = useSelector(state => state.stickifier.scrollers);
   const scrollersRef = useRef({});

   const stickifyOnScreenBlocks = e => {
      const thisScrollerObj =
         scrollersRef.current[e.target.dataset.stickifierid];
      if (thisScrollerObj != null) {
         thisScrollerObj.blocks.forEach(block => {
            const blockElement = document.querySelectorAll(
               `[data-stickifierid='${block}'`
            )[0];
            if (blockElement != null) {
               stickifyBlock(blockElement);
            } else {
               console.log(blockElement);
            }
         });
      }
   };

   Object.keys(scrollers).forEach(scroller => {
      if (scrollersRef.current[scroller] == null) {
         const scrollerElement = document.querySelectorAll(
            `[data-stickifierid='${scroller}'`
         )[0];
         if (scrollerElement != null) {
            scrollerElement.addEventListener('scroll', stickifyOnScreenBlocks);
            scrollersRef.current[scroller] = scrollers[scroller];
         }
      } else {
         scrollersRef.current[scroller] = scrollers[scroller];
      }
   });

   const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
         // First we figure out what this block's scrolling parent is
         const scrollingParent = getScrollingParent(
            entry.target.closest('.flexibleThingCard')
         );
         if (scrollingParent == null) return;

         // Then we get its stickifierID
         const scrollingParentID = scrollingParent.dataset.stickifierid;
         if (scrollingParentID == null) return;

         if (entry.isIntersecting) {
            // If this block just came on screen, we add it to the list of blocks that scroller is keeping sticky
            dispatch(
               addBlockToScroller({
                  scrollerID: scrollingParentID,
                  blockID: entry.target.dataset.stickifierid
               })
            );
         } else {
            // If this block just left the screen, we remove it from the list of blocks that scroller is keeping sticky
            dispatch(
               removeBlockFromScroller({
                  scrollerID: scrollingParentID,
                  blockID: entry.target.dataset.stickifierid
               })
            );
         }
      });
   };

   // Then we need an effect to actually create the intersection observer that keeps track of which contentBlocks need to be stickified
   useEffect(() => {
      // First we need to figure out the heights of the header and the bottom bar so we can use them for our rootMargin
      const header = document.getElementById('header');
      const headerHeight = header.offsetHeight;

      const bottomBar = document.querySelector('.bottomBar');
      const bottomBarHeight = bottomBar != null ? bottomBar.offsetHeight : 0;

      const options = {
         root: null,
         rootMargin: `${headerHeight}px 0px ${bottomBarHeight}px 0px`,
         threshold: 0
      };

      stickifierObserverRef.current = new IntersectionObserver(
         observerCallback,
         options
      );
   }, [observerCallback]);

   return null;
};

export default StickifierHost;
