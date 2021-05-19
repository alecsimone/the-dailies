import gql from 'graphql-tag';
import { useRef } from 'react';
import { commentFields } from './CardInterfaces';
import { getOneRem, midScreenBreakpointPx } from '../styles/functions';

const ADD_CONTENTPIECE_MUTATION = gql`
   mutation ADD_CONTENTPIECE_MUTATION(
      $content: String!
      $id: ID!
      $type: String!
   ) {
      addContentPiece(content: $content, id: $id, type: $type) {
         ... on Tag {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Stack {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
               comments {
                  ${commentFields}
               }
            }
         }
      }
   }
`;
export { ADD_CONTENTPIECE_MUTATION };

const DELETE_CONTENTPIECE_MUTATION = gql`
   mutation DELETE_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $id: ID!
      $type: String!
   ) {
      deleteContentPiece(
         contentPieceID: $contentPieceID
         id: $id
         type: $type
      ) {
         ... on Tag {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Stack {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
      }
   }
`;
export { DELETE_CONTENTPIECE_MUTATION };

const EDIT_CONTENTPIECE_MUTATION = gql`
   mutation EDIT_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $content: String!
      $id: ID!
      $type: String!
   ) {
      editContentPiece(
         contentPieceID: $contentPieceID
         content: $content
         id: $id
         type: $type
      ) {
         ... on Tag {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Stack {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
      }
   }
`;
export { EDIT_CONTENTPIECE_MUTATION };

const REORDER_CONTENT_MUTATION = gql`
   mutation REORDER_CONTENT_MUTATION(
      $id: ID!
      $type: String!
      $oldPosition: Int!
      $newPosition: Int!
   ) {
      reorderContent(
         id: $id
         type: $type
         oldPosition: $oldPosition
         newPosition: $newPosition
      ) {
         ... on Tag {
            __typename
            id
            content {
               __typename
               id
               content
            }
            contentOrder
         }
         ... on Stack {
            __typename
            id
            content {
               __typename
               id
               content
            }
            contentOrder
         }
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
            contentOrder
         }
      }
   }
`;
export { REORDER_CONTENT_MUTATION };

const UNLINK_CONTENTPIECE_MUTATION = gql`
   mutation UNLINK_CONTENTPIECE_MUTATION($contentPieceID: ID!, $thingID: ID!) {
      unlinkContentPiece(contentPieceID: $contentPieceID, thingID: $thingID) {
         __typename
         id
         copiedInContent {
            __typename
            id
         }
      }
   }
`;
export { UNLINK_CONTENTPIECE_MUTATION };

const getButtonsHeight = buttons => {
   let buttonsHeight = buttons.offsetHeight;
   const buttonStyle = window.getComputedStyle(buttons);
   if (buttonStyle.marginTop.includes('px')) {
      const buttonMarginString = buttonStyle.marginTop.substring(
         0,
         buttonStyle.marginTop.length - 2
      );
      const buttonMargin = parseInt(buttonMarginString);
      buttonsHeight += buttonMargin;
   }
   if (buttonStyle.marginTop.includes('rem')) {
      const buttonMarginString = buttonStyle.marginTop.substring(
         0,
         buttonStyle.marginTop.length - 3
      );
      const buttonMarginRem = parseInt(buttonMarginString);
      const buttonMargin = buttonMarginRem * getOneRem();
      buttonsHeight += buttonMargin;
   }
   return buttonsHeight;
};

const stickifier = stickingData => {
   // We're going to make an array of the tops and bottoms of each contentBlock so that we can check it against the current scroll position and see if we need to reposition its sticky buttons
   const blockPositionsArray = [];

   const bottomBar = document.querySelector('.bottomBar');
   const bottomBarDisplay = window.getComputedStyle(bottomBar).display;
   const isBigScreen = bottomBarDisplay === 'none';

   const blocks = document.querySelectorAll('.contentBlock');
   for (const block of blocks) {
      const blockOffset = block.offsetTop;
      const blockHeight = block.offsetHeight;

      const buttons = block.querySelector('.buttonsContainer');
      if (buttons == null) continue;
      const buttonsHeight = getButtonsHeight(buttons);

      // The "top" we use for determining when to start sticking things is slightly different from the actual top of the element. I'm defining that top first so I can base the "top" off it as well as the bottom, which is the actual bottom. This "top" is basically the position of the bottom of the buttonsContainer when it's at the top of its scroll area.
      let blockTop =
         blockOffset +
         stickingData.current.blockPaddingTop +
         stickingData.current.fullThingOffset;
      if (!isBigScreen) {
         blockTop += 1.5 * getOneRem(); // On mobile, contentPiece has a .5rem padding and overflowWrapper has a 1 rem margin
      }
      const top = blockTop + stickingData.current.piecePadding + buttonsHeight;
      const bottom = blockTop + blockHeight;
      blockPositionsArray.push({
         block,
         blockTop,
         top,
         bottom
      });
   }
   stickingData.current.blocksArray = blockPositionsArray;

   // The scrolling element for content is usually mainSection, but sometimes we're within a sidebar, and then we need to use that
   const mainSection = document.querySelector('.mainSection');
   const sidebar = stickingData?.current?.blocksArray[0]?.block?.closest(
      '.sidebar'
   );

   const isSidebar = sidebar != null;

   let scroller = mainSection;
   if (sidebar != null) {
      // If the blocks are within a sidebar, we want to use that instead.
      scroller = sidebar;
   }

   let viewableTop;
   let viewableBottom;

   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   if (isBigScreen) {
      viewableTop = scroller.scrollTop;

      // On big screens, the viewable bottom is the height of the window minus the height of the header
      viewableBottom = viewableTop + window.innerHeight - headerHeight;
   } else {
      const bottomBarHeight = bottomBar.offsetHeight;
      viewableTop = scroller.scrollTop + headerHeight;

      // On small screens, the viewable bottom is the height of the window minus the height of the header and the bottomBar
      viewableBottom =
         viewableTop + window.innerHeight - bottomBarHeight - headerHeight;
   }

   // Now we go through each block and see where it is relative to the screen
   stickingData.current.blocksArray.forEach(block => {
      // First we'll deal with the buttons
      const buttons = block.block.querySelector('.newcontentButtons');
      if (buttons != null) {
         const buttonsHeight = getButtonsHeight(buttons);

         const buttonsPlaceholder = block.block.querySelector(
            '.buttonsPlaceholder'
         );

         // If the top of the element is onscreen by less than the height of the buttons (which is already included in it when it's originally calculated) plus a 6rem buffer, and the bottom of the element is not on screen, put them 8rem from the top of the element
         if (
            block.top < viewableBottom &&
            block.top + buttonsHeight + 6 * getOneRem() > viewableBottom &&
            block.bottom > viewableBottom
         ) {
            buttons.style.position = 'absolute';
            buttons.style.left = `${stickingData.current.blockPaddingLeft}px`;
            buttons.style.width =
               isBigScreen && !isSidebar ? 'calc(60% - 0.6rem)' : '100%'; // Not sure where the 1rem (which here we're taking 60% of) comes from
            buttons.style.bottom = 'initial';
            buttons.style.top = isBigScreen ? `10rem` : '11.5rem'; // I don't know where the extra 4rem comes from either, but it needs to be 4rem more than the buffer on big screens, and 5.5 more on little screens

            // Then we need to make the placeholder the height of the buttons
            buttonsPlaceholder.style.height = `${buttonsHeight}px`;
         } else if (
            block.top + buttonsHeight + 6 * getOneRem() <= viewableBottom &&
            block.bottom > viewableBottom
         ) {
            // If the top of the element is onscreen by more than the height of the buttons and a 6rem buffer, and the bottom of the element is not onscreen, we want to fix the buttons to the bottom of the screen

            // First we need to figure out where the content block is on the screen
            const blockRect = block.block.getBoundingClientRect();

            // We also need the height of the bottom bar so we can put the buttons above it on mobile
            const bottomBarHeight = bottomBar.offsetHeight;

            // Then we fix the buttons to the bottom of the screen
            buttons.style.position = 'fixed';
            buttons.style.left = isBigScreen
               ? `${blockRect.left + stickingData.current.blockPaddingLeft}px`
               : `${blockRect.left}px`;
            buttons.style.width =
               isBigScreen && !isSidebar
                  ? `${(blockRect.width - getOneRem()) * 0.6}px`
                  : `${blockRect.width}px`; // I don't know where that extra rem is coming from on big screens, sorry.
            buttons.style.bottom = isBigScreen ? 0 : `${bottomBarHeight}px`;
            buttons.style.top = 'initial';

            // Then we make the buttonsPlaceholder the height of the buttons
            buttonsPlaceholder.style.height = `${buttonsHeight}px`;
         } else {
            // Otherwise, we want to put the buttons back at the bottom of the content block
            buttons.style.position = 'relative';
            buttons.style.left = 'initial';
            buttons.style.width =
               isBigScreen && !isSidebar ? 'calc(60% + 3rem)' : '100%';
            buttons.style.bottom = 'initial';
            buttons.style.top = 'initial';

            // And make the placeholder 0px tall again
            buttonsPlaceholder.style.height = 0;
         }
      }

      // Then we'll deal with the comments
      let comments = block.block.querySelector('.commentsArea');
      if (window.innerWidth < midScreenBreakpointPx) {
         comments = false;
      }
      if (comments != null) {
         const contentArea = block.block.querySelector('.contentArea');
         if (comments.offsetHeight >= contentArea.offsetHeight) {
            // If the comments aren't smaller than the parent, we don't want to make them sticky
            comments = false;
         }
      }

      if (comments) {
         const commentsRect = comments.getBoundingClientRect();

         // If we're on a big screen and the comments are taller than the contentWrapper, don't stickify them
         const combinedContainer = comments.closest(
            '.contentAndCommentContainer'
         );
         const theActualContent = combinedContainer.querySelector(
            '.theActualContent'
         );
         const theActualContentRect = theActualContent.getBoundingClientRect();

         if (
            window.innerWidth >= midScreenBreakpointPx &&
            commentsRect.height >= theActualContentRect.height
         ) {
            return;
         }
         if (
            block.blockTop < viewableTop &&
            block.bottom > viewableTop + commentsRect.height
         ) {
            // if the top of the block is above the top of the viewport, and the bottom of the block is below the top of the viewport by MORE than the height of the comments box, fix the comments to the top of the screen
            comments.style.position = 'fixed';

            // Unfortunately for us, the comments have an ancestor with a transform applied to it, which means it has its own internal coordinate system and position: 'fixed' doesn't work the way it normally does. So we're going to have to figure out where the top of the screen is relative to the transformed element.

            // First, let's figure out which element is transformed
            let ancestor = comments.parentNode;
            while (ancestor.style.transform === '') {
               ancestor = ancestor.parentNode;
            }

            // Then, let's figure out the conversion between that element's coordinate system and the viewport coordinate system
            const ancestorRect = ancestor.getBoundingClientRect();

            // Then we'll figure out what 1rem is equal to in pixels
            const oneRem = getOneRem();

            const commentsLeftPos = commentsRect.left - ancestorRect.left; // Since the commentsRect is relative to the viewport but we're positioning relative to the ancestor, we need to subtract the ancestor's distance from the left of the viewport

            let commentsTopPos = ancestorRect.top * -1 + headerHeight + oneRem;
            if (
               commentsTopPos + commentsRect.height + oneRem >
               ancestorRect.height
            ) {
               commentsTopPos =
                  ancestorRect.height - commentsRect.height - oneRem;
            }

            // comments.style.width = `${commentsRect.width}px`;
            comments.style.top = `${commentsTopPos}px`;
            comments.style.bottom = `initial`;
         } else if (
            block.bottom > viewableTop &&
            block.bottom < viewableTop + commentsRect.height &&
            block.bottom < viewableBottom
         ) {
            // If the bottom of the block is below the top of the viewport by LESS than the height of the comments box, and the bottom of the block is above the bottom of the viewport, absolutely position the comments at the bottom of the block
            comments.style.position = 'absolute';
            comments.style.bottom = '1rem';
            comments.style.top = 'initial';
         } else {
            comments.style.position = 'relative';
            comments.style.bottom = 'initial';
            comments.style.top = 'initial';
         }
      }

      // Then we'll deal with the style buttons
      const styleButtons = block.block.querySelector(
         '.contentWrapper .stylingButtonsBar'
      );
      if (styleButtons) {
         // First we get the height of the styleButtons
         const styleButtonsHeight = getButtonsHeight(styleButtons);

         // Then we'll get the placeholder styleButtons for this block
         const styleButtonsPlaceholder = block.block.querySelector(
            '.stylingButtonsPlaceholder'
         );

         // The content has some padding that we have to take into account, so we'll get that number next
         const theActualContent = block.block.querySelector(
            '.theActualContent'
         );
         const actualContentStyle = window.getComputedStyle(theActualContent);
         const contentPadding = parseInt(actualContentStyle.paddingTop);

         // Then we need to find the bottom of the textarea, so we can base the bottom boundary on that
         const textArea = block.block.querySelector('textarea');
         const textAreaRect = textArea.getBoundingClientRect();
         // If the top of the element is not on screen, but the bottom of the text area is by more than 8rem, put the buttons 8rem from the bottom of the textarea
         if (
            block.blockTop + contentPadding < viewableTop &&
            textAreaRect.bottom - 8 * getOneRem() - styleButtonsHeight >
               headerHeight
         ) {
            styleButtons.style.position = 'absolute';
            styleButtonsPlaceholder.style.height = `${styleButtonsHeight}px`;
            styleButtonsPlaceholder.style.marginBottom = '1rem';

            styleButtons.style.top = `${textAreaRect.top * -1 +
               headerHeight +
               styleButtonsHeight +
               getOneRem() +
               contentPadding}px`; // The text area is below the top of the parent element (against which this element is positioned) by the height of the style buttons with a one rem margin and some padding on top (contentPadding). textAreaRect.top gives us the distance from the top of the textarea to the top of the viewport, so we add headerHeight to make that the distance to the top of the visible area, and then the styleButtonsHeight, contentPadding, and one rem to make that the distance from the top of the parent element to the top of the visible area
            styleButtons.style.width = `${textAreaRect.width}px`;
         } else if (
            textAreaRect.bottom - 8 * getOneRem() - styleButtonsHeight <
               headerHeight &&
            textAreaRect.bottom - 8 * getOneRem() - styleButtonsHeight > 0
         ) {
            // If the bottom of the textarea is on screen by less than 8 rem stick the buttons 8 rem above the bottom of the textarea
            styleButtons.style.position = 'absolute';
            styleButtonsPlaceholder.style.height = `${styleButtonsHeight}px`;
            styleButtonsPlaceholder.style.marginBottom = '1rem';

            styleButtons.style.top = `${textAreaRect.height +
               contentPadding +
               getOneRem() -
               8 * getOneRem()}px`; // We're sticking the buttons 8 rem above the bottom of the text area. So we get the height of the text area, plus the content padding and one rem that separate it from the top of the element, and then subtract 8 rem
            styleButtons.style.width = `${textAreaRect.width}px`;
         } else {
            // Otherwise, put them back where you found them
            styleButtons.style.position = 'relative';
            styleButtonsPlaceholder.style.height = '0';
            styleButtonsPlaceholder.style.marginBottom = '0';

            styleButtons.style.top = 'initial';
            styleButtons.style.width = 'initial';
         }
      }
   });
};
export { stickifier };

const orderContent = (content, contentOrder) => {
   if (contentOrder == null || contentOrder.length === 0) return content; // If we don't get a contentOrder array, we just give back the content

   const orderedContent = [];
   contentOrder.forEach(id => {
      // First we go through the list of IDs in ordered content and add each corresponding content piece to our ordered content list
      const [piece] = content.filter(contentPiece => contentPiece.id === id);
      if (piece != null) {
         orderedContent.push(piece);
      }
   });
   content.forEach(contentPiece => {
      // Then we check for any leftover content pieces that weren't in the ordered list and add them at the end
      if (contentOrder.includes(contentPiece.id)) {
         return;
      }
      orderedContent.push(contentPiece);
   });

   return orderedContent;
};
export { orderContent };

const changeContentButKeepInFrame = (
   contentContainer,
   scrollingContainer,
   changeFunction
) => {
   const contentRect = contentContainer.getBoundingClientRect();
   let parent = contentContainer.offsetParent;
   let totalOffset = contentContainer.offsetTop;
   while (!scrollingContainer.isSameNode(parent) && parent != null) {
      totalOffset += parent.offsetTop;
      parent = parent.offsetParent;
   }

   changeFunction();

   if (contentRect.top < 0) {
      scrollingContainer.scrollTop = totalOffset;
   }
};
export { changeContentButKeepInFrame };

const findScrollingAncestor = el => {
   let scroller = el.parentNode;
   let scrollerStyles = getComputedStyle(scroller);
   while (!scrollerStyles.overflow.includes('auto') && scroller != null) {
      scroller = scroller.parentNode;
      if (scroller == null) continue;
      scrollerStyles = getComputedStyle(scroller);
   }
   return scroller;
};

const editContentButKeepInFrame = (setEditable, value, wrapper) => {
   const scroller = findScrollingAncestor(wrapper);

   const wrapperRect = wrapper.getBoundingClientRect();

   let parent = wrapper.offsetParent;
   let totalOffset = wrapper.offsetTop;
   while (parent != null) {
      totalOffset += parent.offsetTop;
      parent = parent.offsetParent;
   }

   /* I'm trying to write this function to work without needing to pass the scrolling ancestor as a param. This makes things complicated though because the scrolling ancestor might be a fixed element (eg if it's .mainSection), so offsetParent won't land on it.

   (This isn't a problem with the similar function above, changeContentButKeepInFrame, because that only happens on mobile, where the scrolling parent is never position: fixed, as far as I know)

   However, as far as I know and for the moment, editable content only shows up in two places: tag sidebars and full things, and in both of these cases the scrolling ancestor is separated from the top of the page by the header

   So what we're going to do is get the distance of this content piece from the top of the page and then subtract the height of the header to get the proper scroll distance */

   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   if (wrapperRect.top < 0) {
      scroller.scrollTop = totalOffset - headerHeight;
   }

   setEditable(value);
};
export { editContentButKeepInFrame };
