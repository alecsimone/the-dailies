import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stickifyBlock, makePermanentStickingData } from './stickifier';
import {
   addBlockToScroller,
   addStickingDataToBlock,
   removeBlockFromScroller
} from './stickifierSlice';
import { getScrollingParent } from './useStickifier';

const StickifierHost = () => {
   // This component returns nothing, but it handles all of our stickification functionality. It's going to create an Intersection Observer, which it will use to observe all the blocks in our store.
   // When a block enters the screen, it will be added to its scrolling parent's list of onscreen blocks.
   // This component will also keep track of all the scrollers, adding listeners to them that will stickify all their onscreen blocks whenever they scroll.
   // The useStickifier hook (called by ContentPiece) will handle adding blocks to the store. An effect in ContentPiece that runs after mounting will handle adding scrollers to the store.

   // First lets connect to the store and get the data we need from it.
   const dispatch = useDispatch();
   const blocks = useSelector(state => Object.keys(state.stickifier.blocks));
   const scrollers = useSelector(state => state.stickifier.scrollers);

   // Then we'll set up our Intersection Observer
   const stickifierObserverRef = useRef(null);

   // First we create the callback function the observer will call when a block enters or leaves the screen.
   const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
         // We need to know what the block's scrollingParent is, because we'll be adding/removing this block to/from that scroller's list of onscreen blocks
         const scrollingParent = getScrollingParent(
            entry.target.closest('.flexibleThingCard')
         );
         if (scrollingParent == null) return;

         // Then we get its stickifierID so we can access it in the store
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

   // Then we need an effect to create the intersection observer that keeps track of which contentBlocks are on screen
   useEffect(() => {
      // If we already have something in the stickifierObserverRef, let's quit
      if (stickifierObserverRef.current != null) return;

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

   // Now we can observe all of our content blocks to keep track of when they enter and leave the screen
   const knownBlocksRef = useRef({});
   blocks.forEach(block => {
      if (
         stickifierObserverRef.current != null && // If we have a stickifier
         knownBlocksRef.current[block] == null // And we haven't already registered this block
      ) {
         window.setTimeout(() => {
            // We need to wait for the content blocks to mount before we can observe them
            const blockElement = document.querySelector(
               `[data-stickifierid='${block}']`
            );
            if (blockElement != null) {
               stickifierObserverRef.current.observe(blockElement);
               const permanentStickingData = makePermanentStickingData(
                  blockElement
               );

               dispatch(
                  addStickingDataToBlock({
                     blockID: block,
                     stickingData: permanentStickingData
                  })
               );
               knownBlocksRef.current[block] = permanentStickingData;
            }
         }, 1);

         knownBlocksRef.current[block] = {};
      }
   });

   // We need to add a listener to every scroller so that they can stickify all the blocks within them that are on screen. We'll also need a ref to hold that data so the listener will have access to up to date data.
   const knownScrollersRef = useRef({});

   // First we'll create the callback function our scroll listener will use
   const stickifyOnScreenBlocks = e => {
      // We'll get the list of onscreen blocks within this scroller
      const thisScrollerObj =
         knownScrollersRef.current[e.target.dataset.stickifierid];
      if (thisScrollerObj != null) {
         // And then we'll stickify each of them
         thisScrollerObj.blocks.forEach(block => {
            const blockElement = document.querySelector(
               `[data-stickifierid='${block}']`
            );
            if (blockElement != null) {
               const permanentStickingData = knownBlocksRef.current[block];
               stickifyBlock(blockElement, permanentStickingData);
            }
         });
      }
   };

   // Then we can add the listener to each scroller
   Object.keys(scrollers).forEach(scroller => {
      if (knownScrollersRef.current[scroller] == null) {
         // If we don't know about this scroller yet, we need to add the listener and then add it to our ref.
         const scrollerElement = document.querySelector(
            `[data-stickifierid='${scroller}'`
         );
         if (scrollerElement != null) {
            scrollerElement.addEventListener('scroll', stickifyOnScreenBlocks);
            knownScrollersRef.current[scroller] = scrollers[scroller];
         }
      } else {
         // If we do know about it, let's still make sure our ref is up to date
         knownScrollersRef.current[scroller] = scrollers[scroller];
      }
   });

   return null;
};

export default StickifierHost;
