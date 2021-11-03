import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import _ from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fullThingFields } from '../lib/CardInterfaces';
import { getIntPxFromStyleString, stickifyBlock } from '../lib/stickifier';

const MANY_THINGS_SUBSCRIPTION = gql`
   subscription MANY_THINGS_SUBSCRIPTION($IDs: [ID!]) {
      things(IDs: $IDs) {
         node {
            ${fullThingFields}
         }
      }
   }
`;

const ThingsContext = React.createContext();
export { ThingsContext };

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

const addThingID = (id, setThingIDs, thingIDs) => {
   if (thingIDs.includes(id)) return;
   setThingIDs(prevState => {
      if (!prevState.includes(id)) {
         return [...prevState, id];
      }
      return prevState;
   });
};
const removeThingID = (id, setThingIDs, thingIDs) => {
   if (!thingIDs.includes(id)) return;
   setThingIDs(prevState => prevState.filter(thingID => thingID !== id));
};

const updateBlocksList = (
   contentBlocksRef,
   observerRef,
   scrollingParentsRef
) => {
   const blocks = document.querySelectorAll('.contentBlock');
   const blocksArray = Array.from(blocks);

   // If we didn't already know about the block, and if the observer is set up, we'll observe the block
   blocksArray.forEach(block => {
      if (!contentBlocksRef.current.includes(block)) {
         // However, if this is a thing within a thing within a thing (or more), we don't want to do any of this
         if (
            block
               .closest('.flexibleThingCard')
               ?.parentElement?.closest('.flexibleThingCard')
               ?.parentElement?.closest('.flexibleThingCard') != null
         )
            return;

         if (observerRef.current) {
            observerRef.current.observe(block);
         }

         // Then let's run stickifier once just in case the object is already on screen, because the observer won't do anything until we scroll
         stickifyBlock(block, getScrollingParent(block.parentElement));
      }
   });

   // If there are any blocks that we were observing but aren't there anymore, we want to unobserve them
   contentBlocksRef.current.forEach(block => {
      if (!blocksArray.includes(block)) {
         if (observerRef.current) {
            observerRef.current.unobserve(block);
         }

         // We also want to make sure we take them out of the array their scrolling parent will stickify
         const scrollerRefIndex = scrollingParentsRef.current.findIndex(obj =>
            obj.blocks.includes(block)
         );
         if (scrollerRefIndex !== -1) {
            scrollingParentsRef.current[
               scrollerRefIndex
            ].blocks = scrollingParentsRef.current[
               scrollerRefIndex
            ].blocks.filter(scrollerBlock => scrollerBlock !== block);
         }
      }
   });

   contentBlocksRef.current = blocksArray;
};

const updateScrollersList = (
   scrollingParentsRef,
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
         const parentRect = cardParent.getBoundingClientRect();
         cardParent.style.width = `${parentRect.width}px`;

         // And then look for its scrolling parent
         const scrollingParent = getScrollingParent(card);

         if (scrollingParent != null) {
            // First let's make sure we don't know about this scrolling parent already
            const scrollingParentIndex = scrollingParentsRef.current.findIndex(
               obj => obj.scroller === scrollingParent
            );
            if (scrollingParentIndex === -1) {
               scrollingParentsRef.current.push({
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

const ThingsDataProvider = ({ children }) => {
   // The first role of this component is to keep track of all the various things we've rendered on this page and handle a subscription to them so they stay up to date.
   // const [thingIDs, setThingIDs] = useState([]);
   const thingIDs = useSelector(
      state => Object.keys(state.things),
      (prev, next) => {
         if (prev.length !== next.length) return false;
         if (next.some(id => !prev.includes(id))) return false;
         if (prev.some(id => !next.includes(id))) return false;
         return true;
      }
   );

   const { data, loading } = useSubscription(MANY_THINGS_SUBSCRIPTION, {
      variables: { IDs: thingIDs },
      onCompleted: newData => console.log(newData)
   });

   // // These functions will be put in context, and FlexibleThingCards will use them to check in and check out when they render / unrender so we can keep track of all the things we're displaying
   // const thingsData = {
   //    addThingID: id => addThingID(id, setThingIDs, thingIDs),
   //    removeThingID: id => removeThingID(id, setThingIDs, thingIDs)
   // };

   // Because this provider already re-renders every time we render a new thing card, it's a good place to host our stickifier operations too
   // First we need some refs to hold all our content blocks, scrolling parents, and our intersection observer
   const contentBlocksRef = useRef([]);
   const scrollingParentsRef = useRef([]);
   const observerRef = useRef(null);

   // Then we need the handler functions that can be passed to our scroll listeners
   const updateBlocksListHandler = () =>
      updateBlocksList(contentBlocksRef, observerRef, scrollingParentsRef);

   const stickifyOnScreenBlocks = e => {
      const [thisScrollerObj] = scrollingParentsRef.current.filter(
         obj => obj.scroller === e.target
      );
      if (thisScrollerObj != null) {
         thisScrollerObj.blocks.forEach(block =>
            stickifyBlock(block, e.target)
         );
      }
   };

   // Then we set up our intersection observer. First the callback function. It will fire whenever a content block enters or leaves the screen, and we'll use it to maintain a list of content blocks that are currently on screen
   // Those content blocks will be stored in an array as part of an object with their scroll parent. That way, we can make a listener for the scroll parent that only has to worry about stickifying objects within its own scroll zone that are currently on screen
   // So the basic pattern is: every time this component renders (i.e. anytime a new thing renders anywhere on the page), we check for any new scrollers. Any time one of those scrolls, we check for new blocks. When we find a new block, we start observing it with our intersection observer. That allows us to maintain a list of any blocks currently on screen, and anytime a scroller scrolls, it checks that list and keeps any of its children that are onscreen properly stickified.
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

      observerRef.current = new IntersectionObserver(observerCallback, options);
   }, [observerCallback]);

   useEffect(() => {
      // This effect will run every time this component re-renders, which means it will run every time there's a new thing to keep track of. It'll check each thing on the page to get a list of all their scrolling parents, and then attach listeners to each of those parents that will handle our stickifier functionality.
      updateScrollersList(
         scrollingParentsRef,
         updateBlocksListHandler,
         stickifyOnScreenBlocks
      );
      // TODO: Figure out how to keep this cleanup function from removing all our scroll listeners
      // return () => {
      //    scrollingParentsRef.current.forEach(scrollingParent => {
      //       scrollingParent.removeEventListener(
      //          'scroll',
      //          updateBlocksListHandler
      //       );
      //       scrollingParent.removeEventListener(
      //          'scroll',
      //          stickifyOnScreenBlocks
      //       );
      //    });
      // };
   });

   return (
      <ThingsContext.Provider value="noContext">
         {children}
      </ThingsContext.Provider>
   );
};

export default ThingsDataProvider;
