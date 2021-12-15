import gql from 'graphql-tag';
import { useRef } from 'react';
import { commentFields, contentPieceFields } from './CardInterfaces';
import { getOneRem, midScreenBreakpointPx } from '../styles/functions';
import { provisionallyReplaceTextTag } from './TextHandling';

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
               ${contentPieceFields}
            }
         }
      }
   }
`;
export { ADD_CONTENTPIECE_MUTATION };

const STORE_UNSAVED_CONTENT_MUTATION = gql`
   mutation STORE_UNSAVED_CONTENT_MUTATION($id: ID!, $unsavedContent: String!) {
      storeUnsavedThingChanges(id: $id, unsavedContent: $unsavedContent) {
         ... on Tag {
            __typename
            id
            unsavedNewContent
         }
         ... on Stack {
            __typename
            id
            unsavedNewContent
         }
         ... on Thing {
            __typename
            id
            unsavedNewContent
         }
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
   inputRef,
   content,
   dynamicallyResizeElement,
   addContentPiece,
   id,
   type,
   SINGLE_THING_QUERY,
   SINGLE_TAX_QUERY
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

   contentCopy.push({
      __typename: 'ContentPiece',
      content: provisionalContent,
      id: 'temporaryID',
      comments: [],
      unsavedNewContent: null,
      individualViewPermissions: [],
      links: [],
      onThing:
         type === 'Thing'
            ? {
                 __typename: 'Thing',
                 id
              }
            : [],
      onTag:
         type === 'Tag'
            ? {
                 __typename: 'Tag',
                 id
              }
            : [],
      copiedToThings: [],
      votes: [],
      privacy: 'Public'
   });
   // setFullThingToLoading(id);
   dynamicallyResizeElement(inputRef.current);

   const optimisticResponse = {
      __typename: 'Mutation',
      addContentPiece: {
         __typename: type,
         id,
         content: contentCopy
      }
   };
   console.log(optimisticResponse);

   await addContentPiece({
      variables: {
         content: newContentPiece,
         id,
         type
      },
      optimisticResponse
      // update: (client, { data }) => {
      //    if (data.__typename == null) {
      //       // Our optimistic response includes a typename for the mutation, but the server's data doesn't
      //       let query;
      //       switch (data.addContentPiece.__typename) {
      //          case 'Thing':
      //             query = SINGLE_THING_QUERY;
      //             break;
      //          case 'Tag':
      //             query = SINGLE_TAX_QUERY;
      //             break;
      //          case 'Stack':
      //             query = SINGLE_TAX_QUERY;
      //             break;
      //          default:
      //             console.log('Unknown stuff type');
      //             return;
      //       }
      //       const oldData = client.readQuery({
      //          query,
      //          variables: { id }
      //       });
      //       oldData[data.addContentPiece.__typename.toLowerCase()].content =
      //          data.addContentPiece.content;
      //       client.writeQuery({
      //          query,
      //          variables: { id },
      //          data: oldData
      //       });
      //    }
      // }
   }).catch(err => {
      alert(err.message);
   });
   inputElement.value = ''; // We need to clear the input after adding it
};
export { sendNewContentPiece };
