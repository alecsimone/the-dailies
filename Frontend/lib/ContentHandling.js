import gql from 'graphql-tag';
import { commentFields, fullThingFields } from './CardInterfaces';
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
   mutation UNLINK_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $thingID: ID!
   ) {
      unlinkContentPiece(
         contentPieceID: $contentPieceID
         thingID: $thingID
      ) {
         ${fullThingFields}
      }
   }
`;
export { UNLINK_CONTENTPIECE_MUTATION };

const stickifier = stickingData => {
   // We're going to make an array of the tops and bottoms of each contentBlock so that we can check it against the current scroll position and see if we need to reposition its sticky buttons
   const blockPositionsArray = [];

   const blocks = document.querySelectorAll('.contentBlock');
   for (const block of blocks) {
      const blockOffset = block.offsetTop;
      const blockHeight = block.offsetHeight;

      const buttons = block.querySelector('.buttonsContainer');
      if (buttons == null) continue;
      const buttonsHeight = buttons.offsetHeight;

      // The "top" we use for determining when to start sticking things is slightly different from the actual top of the element. I'm defining that top first so I can base the "top" off it as well as the bottom, which is the actual bottom. This "top" is basically the position of the bottom of the buttonsContainer when it's at the top of its scroll area.
      const blockTop =
         blockOffset +
         stickingData.current.blockPadding +
         stickingData.current.fullThingOffset;
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

   // The scrolling element on big screens is mainSection, on little screens it's threeColumns
   const mainSection = document.querySelector('.mainSection');
   const threeColumns = document.querySelector('.threeColumns');

   let viewableTop;
   let viewableBottom;

   const bottomBar = document.querySelector('.bottomBar');
   const bottomBarDisplay = window.getComputedStyle(bottomBar).display;
   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   let buttonsRightPosition;

   // bottomBar only shows on small screens
   if (bottomBarDisplay === 'none') {
      viewableTop = mainSection.scrollTop;

      // On big screens, the viewable bottom is the height of the window minus the height of the header, and the buttons are 1rem from the right
      viewableBottom = viewableTop + window.innerHeight - headerHeight;
      buttonsRightPosition = '1rem';
   } else {
      const bottomBarHeight = bottomBar.offsetHeight;
      viewableTop = threeColumns.scrollTop;

      // On small screens, the viewable bottom is the height of the window minus the height of the header and the bottomBar, and the buttons are 0px from the right
      viewableBottom =
         viewableTop + window.innerHeight - bottomBarHeight - headerHeight;
      buttonsRightPosition = '0';
   }

   // Now we go through each block and see where it is relative to the screen
   stickingData.current.blocksArray.forEach(block => {
      // First we'll deal with the buttons
      const buttonsArray = block.block.querySelectorAll('.buttonsContainer');
      for (const buttons of buttonsArray) {
         const buttonsHeight = buttons.offsetHeight;
         if (
            block.top - buttonsHeight < viewableBottom &&
            block.top > viewableBottom &&
            block.bottom > viewableBottom
         ) {
            // If the top of the element is onscreen by less than the height of the buttons (which is already included in it when it's originally calculated), and the bottom of the element is not on screen, we want to absolutely position the buttons at the top right of the content block
            buttons.style.position = 'absolute';
            buttons.style.left = 'initial';
            buttons.style.right = buttonsRightPosition;
            buttons.style.bottom = 'initial';
            buttons.style.top = '1rem';
         } else if (
            block.top < viewableBottom &&
            block.bottom > viewableBottom
         ) {
            // If the top of the element is onscreen but the bottom isn't, we want to fix the edit buttons in place at the bottom of the screen
            buttons.style.position = 'fixed';
            // Unfortunately for us, the buttons have an ancestor with a transform applied to it, which means it has its own internal coordinate system and position: 'fixed' doesn't work the way it normally does. So we're going to have to figure out where the bottom of the screen is relative to the transformed element.

            // First, let's figure out which element is transformed;
            let ancestor = buttons.parentNode;
            while (ancestor.style.transform === '') {
               ancestor = ancestor.parentNode;
            }

            // Then, let's figure out the conversion between that element's coordinate system and the viewport coordinate system
            // First let's get the boundingClientRects
            const ancestorRect = ancestor.getBoundingClientRect();
            const buttonRect = buttons.getBoundingClientRect();

            // Then we'll figure out what 1rem is equal to in pixels
            const oneRem = getOneRem();

            const buttonLeftPos = buttonRect.left - ancestorRect.left; // Since the buttonRect is relative to the viewport but we're positioning relative to the ancestor, we need to subtract the ancestor's distance from the left of the viewport

            let buttonBottomPos;
            if (bottomBarDisplay === 'none') {
               buttonBottomPos = ancestorRect.bottom - window.innerHeight; // The bottom position is going to be the ancestorRect bottom minus the height of the screen, because that's how far above the bottom of the ancestor the bottom of the screen is
            } else {
               const bottomBarRect = bottomBar.getBoundingClientRect();
               buttonBottomPos =
                  ancestorRect.bottom -
                  window.innerHeight +
                  bottomBarRect.height;
            }
            if (buttonBottomPos < oneRem) {
               buttonBottomPos = oneRem; // However, we always want to have at least 1rem of buffer between the bottom of the ancestor and the bottom of the buttons
            }
            if (
               buttonBottomPos + buttonRect.height >
               ancestorRect.height - oneRem
            ) {
               buttonBottomPos =
                  ancestorRect.height - buttonRect.height - oneRem; // And 1rem of buffer between the top of the ancestor and the top of the buttons
            }

            buttons.style.left = `${buttonLeftPos}px`;
            buttons.style.right = 'initial';
            buttons.style.top = 'initial';
            buttons.style.bottom = `${buttonBottomPos}px`;

            // The bottom bar only displays on small screens, and when it does we have to adjust what we consider the "bottom" of the screen to be. We also need to adjust if they have the bottom bar's text input showing, which has the class inputWrapper. At some point we should probably run this function when that toggles, because currently that last adjustment is only made when scrolling
            // if (bottomBarDisplay === 'none') {
            //    buttons.style.bottom = '2rem';
            // } else {
            //    const inputWrapper = bottomBar.querySelector('.inputWrapper');
            //    buttons.style.bottom = `calc(${bottomBar.offsetHeight +
            //       inputWrapper.offsetHeight}px + 1rem)`;
            // }
         } else {
            // Otherwise we want to put them back in place at the bottom right of the content block
            buttons.style.position = 'absolute';
            buttons.style.left = 'initial';
            buttons.style.right = buttonsRightPosition;
            buttons.style.bottom = '1rem';
            buttons.style.top = 'initial';
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
