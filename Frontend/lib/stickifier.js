import { getOneRem } from '../styles/functions';

const getIntPxFromStyleString = rawString => {
   if (rawString.includes('px')) {
      const fixedString = rawString.substring(0, rawString.length - 2);
      return parseInt(fixedString);
   }
   if (rawString.includes('rem')) {
      const fixedString = rawString.substring(0, rawString.length - 3);
      const remCount = parseInt(fixedString);
      return remCount * getOneRem();
   }
};
export { getIntPxFromStyleString };

const getButtonsHeight = buttons => {
   let buttonsHeight = buttons.offsetHeight;
   const buttonStyle = window.getComputedStyle(buttons);
   const buttonsMargin = getIntPxFromStyleString(buttonStyle.marginTop);
   buttonsHeight += buttonsMargin;
   return buttonsHeight;
};

const stickifier = stickingData => {
   // We're going to make an array of the tops and bottoms of each contentBlock so that we can check it against the current scroll position and see if we need to reposition its sticky buttons
   const blockPositionsArray = [];

   // We'll start with the array of all the content blocks we collected for stickingData. We'll also pull out the scrolling parent while we're here
   const { blocksArray, scroller } = stickingData.current;

   // Let's also define oneRem up here so we can use it throughout the function
   const oneRem = getOneRem();

   for (const block of blocksArray) {
      const blockOffset = block.offsetTop;
      const blockHeight = block.offsetHeight;
      const blockTop = blockOffset + stickingData.current.parentOffset;
      const blockBottom = blockTop + blockHeight;

      const buttons = block.querySelector('.buttonsContainer');
      if (buttons == null) continue;
      const buttonsHeight = getButtonsHeight(buttons);

      // We'll start sticking the buttons once there's enough space between the top of the content block and the bottom of the viewport to fit them in. That value is the sum of the blockTop, the blockPaddingTop (calculated when we created stickingData), and the height of the buttons, and will be called the blockStickyTop
      const blockStickyTop =
         blockTop + stickingData.current.blockPaddingTop + buttonsHeight;

      // Then we push all this data into our blockPositionsArray
      blockPositionsArray.push({
         block,
         blockTop,
         blockStickyTop,
         blockBottom
      });
   }

   // Now we need to figure out where the viewport is
   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   const bottomBar = document.querySelector('.bottomBar');
   const bottomBarHeight = bottomBar != null ? bottomBar.offsetHeight : 0;

   const viewableTop = scroller.scrollTop + headerHeight;
   const viewableBottom =
      scroller.scrollTop + window.innerHeight - bottomBarHeight;

   // Now we go through each block and see where it is relative to the screen
   blockPositionsArray.forEach(blockObj => {
      // First we'll deal with the buttons
      const buttons = blockObj.block.querySelector('.newcontentButtons');

      // We'll need to figure out where the content block is on the screen
      const blockRect = blockObj.block.getBoundingClientRect();
      let buttonsHeight = 0; // defining this here so we can use it in the comments block too

      if (buttons != null) {
         const buttonsRect = buttons.getBoundingClientRect();
         const { width: buttonsWidth } = buttonsRect;
         buttonsHeight = buttonsRect.height;
         const buttonsPlaceholder = blockObj.block.querySelector(
            '.buttonsPlaceholder'
         );

         // If the sticky top of the element is onscreen by less than the height of the buttons plus a 6rem buffer, and the bottom of the element is not on screen, put them 8rem from the top of the element
         if (
            blockObj.blockStickyTop < viewableBottom && // If the sticky top is above the bottom of the screen
            blockObj.blockStickyTop + 6 * oneRem > viewableBottom && // If the sticky top is less than 6rem above the bottom of the screen
            blockObj.blockBottom > viewableBottom // if the bottom of the block is below the bottom of the screen
         ) {
            buttons.style.position = 'absolute';
            buttons.style.left = `${-1 *
               stickingData.current.leftAdjustment}px`;
            buttons.style.width = `${buttonsWidth}px`;
            buttons.style.bottom = 'initial';
            buttons.style.top = `${6 * oneRem +
               stickingData.current.blockPaddingTop}px`;

            // Then we need to make the placeholder the height of the buttons
            buttonsPlaceholder.style.height = `${buttonsHeight}px`;
         } else if (
            // If the top of the element is onscreen by more than the height of the buttoms and a 6rem buffer, and the bottom of the element is not onscreen, we want to fix the buttons to the bottom of the screen
            blockObj.blockStickyTop + 6 * oneRem <= viewableBottom && // If the sticky top is more than 6rem above the bottom of the screen
            blockObj.blockBottom > viewableBottom // If the bottom of the block is below the bottom of the screen
         ) {
            // Then we fix the buttons to the bottom of the screen
            buttons.style.position = 'fixed';
            buttons.style.left = `${blockRect.left -
               stickingData.current.leftAdjustment}px`;
            buttons.style.width = `${buttonsWidth}px`;
            buttons.style.bottom = `${bottomBarHeight}px`;
            buttons.style.top = 'initial';

            // Then we make the buttonsPlaceholder the height of the buttons
            buttonsPlaceholder.style.height = `${buttonsHeight}px`;
         } else {
            // Otherwise we want to put the buttons back at the bottom of the content block
            buttons.style.position = 'relative';
            buttons.style.left = 'initial';
            buttons.style.width = buttonsWidth;
            buttons.style.bottom = 'initial';
            buttons.style.top = 'initial';

            // And make the placeholder 0px tall again
            buttonsPlaceholder.style.height = 0;
         }
      }

      // Next up, comments. We only want to make the comments sticky if the content is NOT in clickToShowComments mode, ie if both the content and the comments are showing. Fortunately, that's easy to detect, as the contentBlock has a clickToShowComments class when it is
      if (!blockObj.block.classList.contains('clickToShowComments')) {
         // We don't want to limit our loop to only blocks that actually have comments in them, as we want to keep the add comment form sticky too. So a simple search for the commentsArea on all blocks will suffice.
         const comments = blockObj.block.querySelector('.commentsArea');
         const commentsHeight = comments.offsetHeight;

         // The bottom of the commentsArea's parent ends above the newcontentButtons, so we need to adjust our boundaries to account for that. The commentsArea also has a marginTop on it, and we need to adjust for that too
         const commentsStyles = window.getComputedStyle(comments);
         const commentMarginRaw = commentsStyles.marginTop;
         const commentMargin = getIntPxFromStyleString(commentMarginRaw);

         const topAdjustment = buttonsHeight + commentMargin;

         if (comments != null) {
            // However, we do want to cut out any blocks where the commentsArea is bigger than the content area, as those don't need to be sticky
            const theActualContent = blockObj.block.querySelector(
               '.theActualContent'
            );
            if (theActualContent.offsetHeight >= commentsHeight) {
               // If the top of the block is above the top of the viewport and the bottom of the block is below the top of the viewport by MORE than the height of the comments box, we want to fix the comments to the top of the screen
               const commentsRect = comments.getBoundingClientRect();
               if (
                  blockObj.blockTop < viewableTop && // If the top of the block is above the top of the viewport
                  blockObj.blockBottom >
                     viewableTop + commentsHeight + topAdjustment // If the bottom of the block is below the top of the viewport by mor ethan the heigh of the comments box
               ) {
                  comments.style.position = 'fixed';

                  // Unfortunately, the comments are in a container with a transform applied to it, which means it has its own interal coordinate system for position: 'fixed' and we can't just use that to stick them somewhere on the screen. So we need to figure out where the top of the screen is relative to the transformed element.

                  // First we find the transformed element
                  let transformedAncestor = comments.parentNode;
                  while (
                     transformedAncestor.style.transform === '' &&
                     transformedAncestor != null
                  ) {
                     transformedAncestor = transformedAncestor.parentNode;
                  }

                  // Then we figure out the conversion between the transformed ancestor's coordinate system and the viewport coordinate system
                  const ancestorRect = transformedAncestor.getBoundingClientRect();

                  // The top property we're setting here represents how far below the top of the ancestor we want to put the comments. The ancestorRect.top property represents how far below the top of the screen the ancestor is. Thus the negative of the ancestorRect.top property represents how far below the top of the ancestor the top of the screen is. Then we adjust for the header and one rem of buffer.
                  comments.style.top = `${-1 * ancestorRect.top +
                     headerHeight}px`;

                  comments.style.bottom = `initial`;
               } else if (
                  // If the bottom of the block is below the top of the viewport by LESS than the height of the comments box and the bottom of the block is above the bottom of the viewport, absolutely position the comments at the bottom of the block
                  blockObj.blockBottom > viewableTop && // If the bottom of the block is below the top of the viewport
                  blockObj.blockBottom <=
                     viewableTop + commentsHeight + topAdjustment && // by LESS than the height of the comments box
                  blockObj.blockBottom < viewableBottom // and the bottom of the block is above teh bottom of the viewport
               ) {
                  comments.style.position = 'absolute';
                  comments.style.bottom = '0';
                  comments.style.top = 'initial';
               } else {
                  comments.style.position = 'relative';
                  comments.style.bottom = 'initial';
                  comments.style.top = 'initial';
               }
            }
         }
      }
   });
};

export default stickifier;
