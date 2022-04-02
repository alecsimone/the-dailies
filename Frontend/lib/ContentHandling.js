import gql from 'graphql-tag';
import { useRef } from 'react';
import { commentFields, contentPieceFields } from './CardInterfaces';
import { getOneRem, midScreenBreakpointPx } from '../styles/functions';
import { provisionallyReplaceTextTag } from './TextHandling';
import { getScrollingParent } from '../Stickifier/useStickifier';

const ADD_CONTENTPIECE_MUTATION = gql`
   mutation ADD_CONTENTPIECE_MUTATION(
      $content: String!
      $id: ID!
      $type: String!
      $isAddToStart: Boolean
   ) {
      addContentPiece(content: $content, id: $id, type: $type, isAddToStart: $isAddToStart) {
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
               ${contentPieceFields}
            }
            contentOrder
         }
      }
   }
`;
export { ADD_CONTENTPIECE_MUTATION };

const STORE_UNSAVED_CONTENT_MUTATION = gql`
   mutation STORE_UNSAVED_CONTENT_MUTATION(
      $id: ID!
      $unsavedContent: String!
      $isAddToStart: Boolean
   ) {
      storeUnsavedThingChanges(
         id: $id
         unsavedContent: $unsavedContent
         isAddToStart: $isAddToStart
      ) {
         # ... on Tag {
         #    __typename
         #    id
         #    unsavedNewContent
         # }
         # ... on Stack {
         #    __typename
         #    id
         #    unsavedNewContent
         # }
         # ... on Thing {
         #    __typename
         #    id
         #    unsavedNewContent
         # }
         message
      }
   }
`;
export { STORE_UNSAVED_CONTENT_MUTATION };

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

const STORE_UNSAVED_CONTENT_PIECE_MUTATION = gql`
   mutation STORE_UNSAVED_CONTENT_PIECE_MUTATION(
      $thingId: ID!
      $pieceId: ID!
      $unsavedContent: String!
   ) {
      storeUnsavedContentPieceChanges(
         thingId: $thingId
         pieceId: $pieceId
         unsavedContent: $unsavedContent
      ) {
         ... on Tag {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
         ... on Stack {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
         ... on Thing {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
      }
   }
`;
export { STORE_UNSAVED_CONTENT_PIECE_MUTATION };

const CLEAR_UNSAVED_CONTENT_PIECE_MUTATION = gql`
   mutation CLEAR_UNSAVED_CONTENT_PIECE_MUTATION($thingId: ID!, $pieceId: ID!) {
      clearUnsavedContentPieceChanges(thingId: $thingId, pieceId: $pieceId) {
         ... on Tag {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
         ... on Stack {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
         ... on Thing {
            __typename
            id
            content {
               ${contentPieceFields}
            }
         }
      }
   }
`;
export { CLEAR_UNSAVED_CONTENT_PIECE_MUTATION };

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

const sendNewContentPiece = async (
   client,
   inputRef,
   content,
   dynamicallyResizeElement,
   addContentPiece,
   id,
   type,
   isAddToStart
) => {
   const inputElement = inputRef.current;
   const newContentPiece = inputElement.value;
   if (newContentPiece.trim() === '') {
      alert(
         "You can't add a blank content piece. Please write something first."
      );
   }
   inputElement.value = '';

   const contentCopy = JSON.parse(JSON.stringify(content));

   const provisionalContent = provisionallyReplaceTextTag(newContentPiece);

   let thingData = null;
   if (type === 'Thing') {
      thingData = client.readFragment({
         id: `Thing:${id}`,
         fragment: gql`
            fragment ThingForAddContent on Thing {
               __typename
               id
               title
               privacy
               author {
                  id
                  friends {
                     id
                     friends {
                        id
                     }
                  }
               }
               contentOrder
            }
         `
      });
   }
   const newPieceObject = {
      __typename: 'ContentPiece',
      content: provisionalContent,
      id: 'temporaryID',
      comments: [],
      unsavedNewContent: null,
      individualViewPermissions: [],
      links: [],
      onThing: thingData,
      onTag:
         type === 'Tag'
            ? {
                 __typename: 'Tag',
                 id
              }
            : null,
      copiedToThings: [],
      votes: [],
      privacy: 'Public'
   };

   const contentOrder = [...thingData.contentOrder];
   if (isAddToStart) {
      contentCopy.unshift(newPieceObject);
      contentOrder.unshift('temporaryID');
   } else {
      contentCopy.push(newPieceObject);
      contentOrder.push('temporaryID');
   }
   // setFullThingToLoading(id);
   dynamicallyResizeElement(inputRef.current);

   addContentPiece({
      variables: {
         content: newContentPiece,
         id,
         type,
         isAddToStart
      },
      optimisticResponse: {
         __typename: 'Mutation',
         addContentPiece: {
            __typename: type,
            id,
            content: contentCopy,
            contentOrder
         }
      }
   }).catch(err => {
      alert(err.message);
   });
   inputElement.value = ''; // We need to clear the input after adding it

   // Now we want to scroll to the top of the last content piece if it's not already in frame. NB: This function is only for adding new content pieces (as opposed to editing existing ones), so we're always scrolling to the last (or first if isAddToStart) content piece
   if (isAddToStart) return; // However, I don't think we really need this when we're adding to start, because we'll just be seeing an empty richTextArea with the new piece right below it, which seems to me will always be fine. However, if it turns out not to be, we just need to rename lastContentPiece etc to relevantContentPiece etc, and have it refer to the first content piece if isAddToStart. Then there might be some shenanigans with the if relevantPieceRect.top > 0, like maybe we're more worried about the bottom or the top being off the bottom of the screen or something, but we won't really know that until we know what the problem is.
   const contentPieces = document.querySelectorAll('.contentBlock');

   if (contentPieces.length === 0) return;

   const lastContentPiece = contentPieces[contentPieces.length - 1];
   const lastPieceRect = lastContentPiece.getBoundingClientRect();
   if (lastPieceRect.top > 0) return;

   let parent = lastContentPiece.offsetParent;
   let totalOffset = lastContentPiece.offsetTop;
   while (parent != null) {
      totalOffset += parent.offsetTop;
      parent = parent.offsetParent;
   }

   const scroller = getScrollingParent(lastContentPiece);
   const header = document.getElementById('header');
   const headerHeight = header.offsetHeight;

   scroller.scrollTop = totalOffset - headerHeight - 2 * getOneRem();
};
export { sendNewContentPiece };
