import { useEffect, useRef } from 'react';
import { stickifyBlock } from './stickifier';

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

const updateBlocksList = (
   contentBlocks,
   scrollingParents,
   stickifierObserver
) => {
   const blocks = document.querySelectorAll('.contentBlock');
   const blocksArray = Array.from(blocks);

   // If we didn't already know about the block, and if the observer is set up, we'll observe the block
   blocksArray.forEach(block => {
      if (!contentBlocks.includes(block)) {
         // However, if this is a thing within a thing within a thing (or more), we don't want to do any of this
         if (
            block
               .closest('.flexibleThingCard')
               ?.parentElement?.closest('.flexibleThingCard')
               ?.parentElement?.closest('.flexibleThingCard') != null
         )
            return;

         if (stickifierObserver) {
            stickifierObserver.observe(block);
         }

         // Then let's run stickifier once just in case the object is already on screen, because the observer won't do anything until we scroll
         stickifyBlock(block);

         // And finally, add it to our blocks array
         contentBlocks.push(block);
      }
   });

   // If there are any blocks that we were observing but aren't there anymore, we want to unobserve them
   contentBlocks.forEach(block => {
      if (!blocksArray.includes(block)) {
         if (stickifierObserver) {
            stickifierObserver.unobserve(block);
         }

         // We also want to make sure we take them out of the array their scrolling parent will stickify
         const scrollerIndex = scrollingParents.findIndex(obj =>
            obj.blocks.includes(block)
         );
         if (scrollerIndex !== -1) {
            scrollingParents[scrollerIndex].blocks = scrollingParents[
               scrollerIndex
            ].blocks.filter(scrollerBlock => scrollerBlock !== block);
         }
      }
   });

   contentBlocks = blocksArray;
};

const updateScrollersList = (
   scrollingParents,
   updateBlocksListHandler,
   stickifyOnScreenBlocks
) => {
   // We're going to get all the thing cards on the page
   const cards = document.querySelectorAll('.flexibleThingCard');

   // We'll keep track of all the parents of those cards so we don't waste time checking siblings that obviously have the same scrolling ancestor
   const checkedParents = [];

   for (const card of cards) {
      const cardParent = card.parentElement;

      if (!checkedParents.includes(cardParent)) {
         // If we haven't checked this parent already, let's note that we're checking it
         checkedParents.push(cardParent);

         // Actually, seems like we don't need this
         // If we don't set an absolute height on each thing card, they tend to get resized by the various flexboxes that affect them as we change the positioning of our various sticky elements. So we'll do that now.
         // If cards or their parents are looking like a weird size, turn the two lines below this back on. But make sure to add a conditional such that if parentRect.width === 0, it doesn't do anything, cause that was causing problems and that's why I turned them off in the first place
         // const parentRect = cardParent.getBoundingClientRect();
         // cardParent.style.width = `${parentRect.width}px`;

         // And then look for its scrolling parent
         const scrollingParent = getScrollingParent(card);

         if (scrollingParent != null) {
            // First let's make sure we don't know about this scrolling parent already
            const scrollingParentIndex = scrollingParents.findIndex(
               obj => obj.scroller === scrollingParent
            );
            if (scrollingParentIndex === -1) {
               scrollingParents.push({
                  scroller: scrollingParent,
                  blocks: []
               });

               // We need to attach two listeners to each scroller we find.
               // The first will keep our blocks list up to date. All sorts of things can add or remove blocks, so rather than forcing all of those things to notify us of the change, let's just keep an eye out every time things are mothing
               scrollingParent.addEventListener(
                  'scroll',
                  updateBlocksListHandler
               );
               // The second is our stickifier, which will keep any blocks currently on screen stickified
               scrollingParent.addEventListener(
                  'scroll',
                  stickifyOnScreenBlocks
               );
            }
         }
      }
   }
};

const useStickifier = () => {
   // This hook will be called by ContentPiece, and it will be used to handle all the work we need to do to stickify the buttons and comments for a contentPiece as the user scrolls.

   const contentBlocksRef = useRef([]);
   const scrollingParentsRef = useRef([]);
   const stickifierObserverRef = useRef(null);

   // Then we need the handler functions that can be passed to our scroll listeners
   const updateBlocksListHandler = () =>
      updateBlocksList(
         contentBlocksRef.current,
         scrollingParentsRef.current,
         stickifierObserverRef.current
      );

   const stickifyOnScreenBlocks = e => {
      const [thisScrollerObj] = scrollingParentsRef.current.filter(
         obj => obj.scroller === e.target
      );
      if (thisScrollerObj != null) {
         thisScrollerObj.blocks.forEach(block => stickifyBlock(block));
      }
   };

   // Then we set up our intersection observer. First the callback function. It will fire whenever a content block enters or leaves the screen, and we'll use it to maintain a list of content blocks that are currently on screen
   // Those content blocks will be stored in an array as part of an object with their scroll parent. That way, we can make a listener for the scroll parent that only has to worry about stickifying objects within its own scroll zone that are currently on screen
   // So the basic pattern is: every time this hook is called (i.e. anytime a new content piece mounts), we check for any new scrollers. Any time one of those scrolls, we check for new blocks. When we find a new block, we start observing it with our intersection observer. That allows us to maintain a list of any blocks currently on screen, and anytime a scroller scrolls, it checks that list and keeps any of its children that are onscreen properly stickified.
   const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
         // First we figure out what this block's scrolling parent is
         const scrollingParent = getScrollingParent(
            entry.target.closest('.flexibleThingCard')
         );

         // Then we find the object for that scroller in our scrollingParentsRef
         const thisScrollerObjIndex = scrollingParentsRef.current.findIndex(
            obj => obj.scroller === scrollingParent
         );
         if (thisScrollerObjIndex === -1) return;

         if (entry.isIntersecting) {
            // If this block just came on screen, we add it to the list of blocks that scroller is keeping sticky
            scrollingParentsRef.current[thisScrollerObjIndex].blocks.push(
               entry.target
            );
         } else {
            // If this block just left the screen, we remove it from the list of blocks that scroller is keeping sticky
            scrollingParentsRef.current[
               thisScrollerObjIndex
            ].blocks = scrollingParentsRef.current[
               thisScrollerObjIndex
            ].blocks.filter(block => block !== entry.target);
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
   }, [observerCallback, stickifierObserverRef]);

   // Then, every time this hook runs (i.e. every time there's a new content piece) we need to update the scrollers list. We'll check each thing on the page to get a list of all their scrolling parents, and then attach listeners to each of those parents that will handle our stickifier functionality.
   updateScrollersList(
      scrollingParentsRef.current,
      updateBlocksListHandler,
      stickifyOnScreenBlocks
   );
};

export default useStickifier;
