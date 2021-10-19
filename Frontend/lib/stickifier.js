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

const getElementHeight = element => {
   let elementHeight = element.offsetHeight;
   const elementStyle = window.getComputedStyle(element);
   const elementMargin = getIntPxFromStyleString(elementStyle.marginTop);
   elementHeight += elementMargin;
   return elementHeight;
};

const describeViewport = scroller => {
   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   const bottomBar = document.querySelector('.bottomBar');
   const bottomBarHeight = bottomBar != null ? bottomBar.offsetHeight : 0;

   const viewableTop = scroller.scrollTop + headerHeight;
   const viewableBottom =
      scroller.scrollTop + window.innerHeight - bottomBarHeight;

   return {
      headerHeight,
      bottomBarHeight,
      viewableTop,
      viewableBottom
   };
};

const stickifyButtons = (
   buttons,
   stickingData,
   buttonsHeight,
   buttonsWidth,
   blockObj,
   viewableBottom,
   oneRem,
   blockRect,
   bottomBarHeight
) => {
   let buttonsPlaceholder;
   const buttonsPlaceholderArray = blockObj.block.querySelectorAll(
      '.buttonsPlaceholder'
   );
   for (const buttonsPlaceholderTest of buttonsPlaceholderArray) {
      if (buttonsPlaceholderTest.closest('.contentBlock') === blockObj.block) {
         buttonsPlaceholder = buttonsPlaceholderTest;
      }
   }

   const { offsetParent } = blockObj.block;
   const offsetRect = offsetParent.getBoundingClientRect();
   const offsetStyle = window.getComputedStyle(offsetParent);

   // (offsetRect.bottom - blockRect.bottom)
   // If the sticky top of the element is onscreen by less than the height of the buttons plus a 6rem buffer, and the bottom of the element is not on screen, put them 8rem from the top of the element
   if (
      blockObj.blockStickyTop < viewableBottom && // If the sticky top is above the bottom of the screen
      blockObj.blockStickyTop + 6 * oneRem > viewableBottom && // If the sticky top is less than 6rem above the bottom of the screen
      blockObj.blockBottom > viewableBottom // if the bottom of the block is below the bottom of the screen
   ) {
      buttons.style.position = 'absolute';
      buttons.style.left = `${-1 * stickingData.leftAdjustment}px`;
      buttons.style.width = `${buttonsWidth}px`;
      buttons.style.bottom = 'initial';
      buttons.style.top = `${6 * oneRem + stickingData.blockPaddingTop}px`;

      // Then we need to make the placeholder the height of the buttons
      buttonsPlaceholder.style.height = `${buttonsHeight}px`;
   } else if (
      // If the top of the element is onscreen by more than the height of the buttoms and a 6rem buffer, and the bottom of the element is not onscreen, we want to fix the buttons to the bottom of the screen
      blockObj.blockStickyTop + 6 * oneRem <= viewableBottom && // If the sticky top is more than 6rem above the bottom of the screen
      blockObj.blockBottom > viewableBottom // If the bottom of the block is below the bottom of the screen
   ) {
      // Then we fix the buttons to the bottom of the screen
      buttons.style.position = 'fixed';

      const grandParentThing = blockObj.block
         .closest('.flexibleThingCard')
         .parentElement.closest('.flexibleThingCard');
      if (grandParentThing != null) {
         const offsetMarginLeft = getIntPxFromStyleString(
            offsetStyle.marginLeft
         );
         buttons.style.left = `${blockRect.left -
            stickingData.leftAdjustment -
            offsetRect.left +
            offsetMarginLeft}px`;
      } else {
         buttons.style.left = `${blockRect.left -
            stickingData.leftAdjustment}px`;
      }
      buttons.style.width = `${buttonsWidth}px`;
      buttons.style.top = 'initial';

      // If we're inside a sidebar, it might have a transform applied to it, so we'd have to position the bottom differently, so let's check
      const sidebar = blockObj.block.closest('.myThingsBar.visible');
      let withinSidebarBottom = 0;
      if (sidebar != null) {
         const sidebarStyles = window.getComputedStyle(sidebar);
         if (
            sidebarStyles.transform != null &&
            sidebarStyles.transform !== 'none'
         ) {
            const sidebarRect = sidebar.getBoundingClientRect();
            withinSidebarBottom =
               sidebarRect.bottom - viewableBottom - bottomBarHeight; // Because the sidebar has a transform applied to it, it becomes its own coordinate system for our fixed positioning. So to fix the buttons at the bottom of the screen, they need a bottom property that's equal to the distance between the bottom of the sidebar and the viewable bottom of the screen.
         }
      }
      let thingWithinThingBottom = 0;

      if (grandParentThing != null) {
         // We're going to need to put the buttons for this block above the buttons for the parent block, so first we need to figure out how tall those are
         let uncleButtons;
         const uncleButtonsArray = grandParentThing.querySelectorAll(
            '.newcontentButtons'
         );
         for (const uncleButtonsTest of uncleButtonsArray) {
            if (
               uncleButtonsTest.closest('.flexibleThingCard') ===
               grandParentThing
            ) {
               uncleButtons = uncleButtonsTest;
            }
         }
         const uncleButtonsHeight = getElementHeight(uncleButtons);

         // When we position the thing within a thing's bottom, it's going to be relative to the bottom of the offsetParent. To get the distance between the offsetParent and the bottom of the screen, we take the offsetRect.bottom (which puts us at the top of the screen), subtract the window.innerHeight (which puts us at the bottom of the screen), and then add the uncleButtonsHeight to get above those. We don't need to add the bottomBarHeight here because we're adding it when we do the final calculation below. For that same reason, we need to subtract withinSidebarBottom, otherwise for thingsWithinThings within the sidebar, it will be added when it's not needed (because the containing thing is the parent, not the sidebar)
         thingWithinThingBottom =
            offsetRect.bottom -
            window.innerHeight +
            uncleButtonsHeight -
            withinSidebarBottom;
      }
      buttons.style.bottom = `${bottomBarHeight +
         withinSidebarBottom +
         thingWithinThingBottom}px`;

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
};

const stickifyComments = (
   blockObj,
   buttonsHeight,
   viewableTop,
   viewableBottom,
   headerHeight
) => {
   // We don't need to limit our loop to only blocks that actually have comments in them, as we want to keep the add comment form sticky too. So a simple search for the commentsArea on all blocks will suffice.
   let comments;
   const commentsArray = blockObj.block.querySelectorAll('.commentsArea');
   for (const commentsTest of commentsArray) {
      // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (commentsTest.closest('.contentBlock') === blockObj.block) {
         comments = commentsTest;
      }
   }

   const commentsHeight = comments.offsetHeight;

   // The bottom of the commentsArea's parent ends above the newcontentButtons, so we need to adjust our boundaries to account for that. The commentsArea also has a marginTop on it, and we need to adjust for that too
   const commentsStyles = window.getComputedStyle(comments);
   const commentMarginRaw = commentsStyles.marginTop;
   const commentMargin = getIntPxFromStyleString(commentMarginRaw);

   const topAdjustment = buttonsHeight + commentMargin;

   if (comments != null) {
      // However, we do want to cut out any blocks where the commentsArea is bigger than the content area, as those don't need to be sticky
      let theActualContent;
      const actualContentArray = blockObj.block.querySelectorAll(
         '.theActualContent'
      );
      for (const actualContentTest of actualContentArray) {
         // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
         if (actualContentTest.closest('.contentBlock') === blockObj.block) {
            theActualContent = actualContentTest;
         }
      }

      if (theActualContent.offsetHeight >= commentsHeight) {
         // If the top of the block is above the top of the viewport and the bottom of the block is below the top of the viewport by MORE than the height of the comments box, we want to fix the comments to the top of the screen
         const commentsRect = comments.getBoundingClientRect();
         if (
            blockObj.blockTop < viewableTop && // If the top of the block is above the top of the viewport
            blockObj.blockBottom > viewableTop + commentsHeight + topAdjustment // If the bottom of the block is below the top of the viewport by mor ethan the heigh of the comments box
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
            comments.style.top = `${-1 * ancestorRect.top + headerHeight}px`;

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
};

const stickifyStyleButtons = (
   styleButtons,
   stickingData,
   blockObj,
   blockRect,
   viewableTop,
   oneRem,
   headerHeight
) => {
   // First we'll get the placeholder styleButtons for this block
   let styleButtonsPlaceholder;
   const styleButtonsPlaceholderArray = blockObj.block.querySelectorAll(
      '.contentWrapper .stylingButtonsPlaceholder'
   );
   for (const styleButtonsPlaceholderTest of styleButtonsPlaceholderArray) {
      // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (
         styleButtonsPlaceholderTest.closest('.contentBlock') === blockObj.block
      ) {
         styleButtonsPlaceholder = styleButtonsPlaceholderTest;
      }
   }

   // Then we'll get the height of the styleButtons
   const styleButtonsHeight = getElementHeight(styleButtons);

   // The textarea these styleButtons apply to has a different bottom from the blockBottom, so we need to find that next
   let textArea;
   const textAreaArray = blockObj.block.querySelectorAll(
      ':scope .contentWrapper textarea'
   ); // see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAlll#user_notes for why we need that ":scope" pseudo-class
   for (const textAreaTest of textAreaArray) {
      // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (textAreaTest.closest('.contentBlock') === blockObj.block) {
         textArea = textAreaTest;
      }
   }
   const textAreaRect = textArea.getBoundingClientRect();
   const textAreaBottom = textAreaRect.bottom;

   // If the top of the block (after the blockPaddingTop) is above the top of the screen, but the bottom of the textarea is below the top of the screen by more than the height of the style buttons plus an 8rem buffer, we'll put the buttons at the top of the screen
   if (
      blockObj.blockTop + stickingData.blockPaddingTop < viewableTop && // if the top of the block after the blockPaddingTop is not on screen
      textAreaBottom - styleButtonsHeight - 8 * oneRem > headerHeight // if the bottom of the textarea is below the top of the screen by more than the height of the style buttons plus an 8rem buffer
   ) {
      styleButtons.style.position = 'absolute'; // We use absolute instead of fixed so that the buttons will stay the width of theActualContent
      styleButtonsPlaceholder.style.height = `${styleButtonsHeight}px`;
      styleButtonsPlaceholder.style.marginBottom = '1rem'; // We can't set this placeholder in the stylesheet or else it will be there when the placeholder isn't supposed to be taking up space too

      // The top value of the styleButtons has to be equal to the distance from the top of the content block to the top of the viewport (ie, the negative of blockRect.top), plus the headerHeight, plus any difference between the top of the content block and the top of theActualContent (before its padding kicks in)
      styleButtons.style.top = `${-1 * blockRect.top +
         headerHeight +
         stickingData.topDifference}px`;
   } else if (
      // If the bottom of the textarea is below the top of the screen by less than the height of the buttons plus an 8rem buffer, put the style buttons 8rem above the bottom of the textarea
      textAreaBottom - styleButtonsHeight - 8 * oneRem <=
      headerHeight // If the bottom of the textarea is below the top of the screen by less than the height of the buttons plus an 8rem buffer
   ) {
      styleButtons.style.position = 'absolute'; // We use absolute instead of fixed so that the buttons will stay the width of theActualContent
      styleButtonsPlaceholder.style.height = `${styleButtonsHeight}px`;
      styleButtonsPlaceholder.style.marginBottom = '1rem'; // We can't set this placeholder in the stylesheet or else it will be there when the placeholder isn't supposed to be taking up space too

      // We want to put the buttons 8rem above the bottom of the textarea. So we start by putting them down enough to cover the textArea height and the blockPaddingTop and topDifference. We would then need to pull them back 8rem, except we also need to make up for the 1rem of the placeholderButtons margin, so we only do 7rem.
      styleButtons.style.top = `${textAreaRect.height +
         stickingData.blockPaddingTop +
         stickingData.topDifference -
         7 * oneRem}px`;
   } else {
      // Otherwise put the buttons back where they started
      styleButtons.style.position = 'relative';
      styleButtons.style.top = 'initial';

      styleButtonsPlaceholder.style.height = '0';
      styleButtonsPlaceholder.style.marginBottom = '0';
   }
};

const makeStickingData = block => {
   const blockRect = block.getBoundingClientRect();

   let theActualContent;
   const actualContentArray = block.querySelectorAll('.theActualContent');
   for (const actualContentTest of actualContentArray) {
      // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (actualContentTest.closest('.contentBlock') === block) {
         theActualContent = actualContentTest;
      }
   }
   let topDifference = 0;
   let blockPaddingTop = 0;
   if (theActualContent != null) {
      const actualContentRect = theActualContent.getBoundingClientRect();
      topDifference = blockRect.top - actualContentRect.top;

      // Then we find the padding on actual content
      const actualContentStyle = window.getComputedStyle(theActualContent);
      const actualContentPaddingTopString = actualContentStyle.paddingTop;
      const actualContentPaddingTopRaw = actualContentPaddingTopString.substring(
         0,
         actualContentPaddingTopString.length - 2
      );
      blockPaddingTop = parseInt(actualContentPaddingTopRaw);
   }

   // We also might need to account for a difference in left positioning on the buttons (currently this is because of a negative margin on the buttons)
   const buttonsArray = block.querySelectorAll('.newcontentButtons');
   let buttons;
   for (const buttonsTest of buttonsArray) {
      // Let's make sure we have the right set of buttons, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (buttonsTest.closest('.contentBlock') === block) {
         buttons = buttonsTest;
      }
   }
   const buttonsStyle = window.getComputedStyle(buttons);
   const buttonsMarginLeftRaw = buttonsStyle.marginLeft;
   const buttonsMarginLeft = getIntPxFromStyleString(buttonsMarginLeftRaw);

   return {
      blockPaddingTop,
      topDifference,
      leftAdjustment: buttonsMarginLeft
   };
};

const makeBlockPositionObject = (block, stickingData) => {
   const blockOffset = block.offsetTop;
   const blockHeight = block.offsetHeight;

   // We need to get the total offset of the firstBlock by tallying up the offsetTops of all its offsetParents
   let parentOffset = 0;
   let nextParent = block.offsetParent;
   while (nextParent != null) {
      parentOffset += nextParent.offsetTop;
      nextParent = nextParent.offsetParent;
   }

   const blockTop = parentOffset + blockOffset;
   const blockBottom = blockTop + blockHeight;

   let buttons;
   const buttonsArray = block.querySelectorAll('.buttonsContainer');
   if (buttonsArray == null || buttonsArray.length === 0) return;

   for (const buttonsTest of buttonsArray) {
      if (buttonsTest.closest('.contentBlock') === block) {
         buttons = buttonsTest;
      }
   }
   if (buttons == null) return;

   const buttonsHeight = getElementHeight(buttons);

   // We'll start sticking the buttons once there's enough space between the top of the content block and the bottom of the viewport to fit them in. That value is the sum of the blockTop, the blockPaddingTop (calculated when we created stickingData), and the height of the buttons, and will be called the blockStickyTop
   const blockStickyTop =
      blockTop + stickingData.blockPaddingTop + buttonsHeight;

   // Then we push all this data into our blockPositionsArray
   return {
      block,
      blockTop,
      blockStickyTop,
      blockBottom
   };
};

const stickifyBlock = (block, scroller) => {
   // First we're going to collect some data about the block that we'll need throughout the stickifying process
   const stickingData = makeStickingData(block);

   // We're going to make an object with the tops and bottoms of the contentBlock so that we can check it against the current scroll position and see if we need to reposition its sticky buttons
   const blockObj = makeBlockPositionObject(block, stickingData);

   // Now we need to figure out where the viewport is
   const {
      headerHeight,
      bottomBarHeight,
      viewableTop,
      viewableBottom
   } = describeViewport(scroller);

   // Let's also define oneRem up here so we can use it throughout the function
   const oneRem = getOneRem();

   // First we'll deal with the content buttons
   let buttons;
   const buttonsArray = block.querySelectorAll('.newcontentButtons');
   for (const buttonsTest of buttonsArray) {
      if (buttonsTest.closest('.contentBlock') === block) {
         buttons = buttonsTest;
      }
   }

   // We'll need to figure out where the content block is on the screen right now
   const blockRect = blockObj.block.getBoundingClientRect();
   let buttonsHeight = 0; // defining this here so we can use it in the comments block too

   if (buttons != null) {
      const buttonsRect = buttons.getBoundingClientRect();
      const { width: buttonsWidth } = buttonsRect;
      buttonsHeight = buttonsRect.height;
      stickifyButtons(
         buttons,
         stickingData,
         buttonsHeight,
         buttonsWidth,
         blockObj,
         viewableBottom,
         oneRem,
         blockRect,
         bottomBarHeight
      );
   }

   // Next up, comments. We only want to make the comments sticky if the content is NOT in clickToShowComments mode, ie if both the content and the comments are showing. Fortunately, that's easy to detect, as the contentBlock has a clickToShowComments class when it is
   if (!blockObj.block.classList.contains('clickToShowComments')) {
      stickifyComments(
         blockObj,
         buttonsHeight,
         viewableTop,
         viewableBottom,
         headerHeight
      );
   }

   // Next up, the style buttons. We're only going to bother making the ones for editing the content piece sticky (not the ones for editing a comment), so we're including the .contentWrapper selector
   let styleButtons;
   const styleButtonsArray = block.querySelectorAll(
      ':scope .contentWrapper .stylingButtonsBar'
   ); // see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAlll#user_notes for why we need that ":scope" pseudo-class
   for (const styleButtonsTest of styleButtonsArray) {
      // Let's make sure we have the right actualContent, in case this contentBlock has a thing with contentBlocks of its own embedded inside it
      if (styleButtonsTest.closest('.contentBlock') === block) {
         // However, these style buttons could also be from the comments SECTION on an embedded thing card. If that's the case, the closest flexibleThingCard to them will be different from the closest flexibleThingCard to our original block. So we check for that too.
         if (
            styleButtonsTest.closest('.flexibleThingCard') ===
            block.closest('.flexibleThingCard')
         ) {
            styleButtons = styleButtonsTest;
         }
      }
   }
   if (styleButtons) {
      stickifyStyleButtons(
         styleButtons,
         stickingData,
         blockObj,
         blockRect,
         viewableTop,
         oneRem,
         headerHeight
      );
   }
};

export { stickifyBlock };
