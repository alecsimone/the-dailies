import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Reorder from 'react-reorder';
import Head from 'next/head';
import { setAlpha, setLightness } from '../../styles/functions';
import ContentPiece from './ContentPiece';
import RichTextArea from '../RichTextArea';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { SINGLE_TAX_QUERY } from '../../pages/tag';
import { setFullThingToLoading } from './FullThing';

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
            }
         }
      }
   }
`;

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

const StyledContent = styled.section`
   margin: 0 0 3rem;
   padding: 1rem;
   padding-top: 0;
   background: ${props => props.theme.midBlack};
   border-top: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   ${props => props.theme.mobileBreakpoint} {
      margin: 5rem 0;
      padding: 1rem 2rem;
      padding-top: 0;
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      border-radius: 0.5rem;
   }
   p,
   .graph {
      margin: 0;
   }
   p {
      max-width: 1000px;
      min-height: 1em;
   }
   a,
   a:visited {
      color: ${props => setLightness(props.theme.majorColor, 75)};
   }
   button.reorder {
      display: block;
      position: relative;
      z-index: 0;
      margin: 0 auto 1rem;
      opacity: 0.4;
      font-weight: 300;
      &:hover {
         opacity: 1;
      }
   }
   .reordering {
      background: ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
      cursor: pointer;
      border-radius: 3px;
   }
   .placeholder {
      background: ${props => props.theme.majorColor};
      color: ${props => props.theme.majorColor};
   }
   .dragged {
      background: ${props => props.theme.lowContrastGrey};
      border: 2px solid ${props => setAlpha(props.theme.highContrastGrey, 0.6)};
      user-select: none;
   }
   .contentBlock {
      position: relative;
      /* display: flex;
      align-items: end;
      justify-content: space-between; */
      margin: 0.6rem 0;
      border-bottom: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      padding: 0;
      ${props => props.theme.mobileBreakpoint} {
         padding: 1rem;
      }
      &.highlighted {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      }
      div.buttons {
         width: ${props => props.theme.smallText};
         position: absolute;
         bottom: 1rem;
         right: 0;
      }
      img.buttons,
      svg.buttons {
         width: 100%;
         &.trashIcon {
            opacity: 0.8;
         }
         &.editThis {
            opacity: 0.4;
         }
         &.reorder {
            opacity: 0.4;
            &.reordering {
               opacity: 1;
               &:hover {
                  opacity: 0.4;
               }
            }
         }
         &.directLink {
            opacity: 0.4;
         }
         &:hover {
            cursor: pointer;
            opacity: 1;
         }
      }
      button.miniReorder,
      form {
         max-width: 1040px;
         margin: calc(0.8rem - 2px) calc(-1rem - 1px);
         textarea {
            padding: 1rem;
            height: 4rem;
            position: relative;
            ${props => props.theme.scroll};
         }
      }
      .contentPiece {
         margin: 0rem 0;
         flex-grow: 1;
         width: 100%;
         max-width: 1080px;
         white-space: pre-wrap;
         padding: 2rem 4rem 2rem 1rem;
         ${props => props.theme.mobileBreakpoint} {
            padding: 2rem;
         }
         img,
         video,
         iframe {
            max-width: 100%;
         }
         iframe {
            width: 100%;
         }
         .smallThingCard {
            margin: 2rem 0;
         }
         .tweet.threadStarter {
            margin-bottom: 0;
            .quoteTweetContainer {
               margin-top: 0;
               margin-bottom: 0;
            }
         }
      }
   }
   form {
      display: flex;
      flex-wrap: wrap;
      margin-top: 4rem;
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
         .styleGuideLink {
            opacity: 0.7;
            display: inline-block;
            font-size: ${props => props.theme.tinyText};
         }
      }
   }
   textarea {
      width: 100%;
      position: relative;
      height: calc(5rem + 4px);
   }
   button {
      margin: 1rem 0;
      padding: 0.6rem;
      font-size: ${props => props.theme.smallText};
      font-weight: 500;
      &.post {
         background: ${props => setAlpha(props.theme.majorColor, 0.8)};
         color: ${props => props.theme.mainText};
         &:hover {
            background: ${props => props.theme.majorColor};
            box-shadow: 0 0 6px
               ${props => setAlpha(props.theme.majorColor, 0.6)};
         }
      }
   }
`;

const Content = ({ context, canEdit, linkedPiece }) => {
   const {
      content = [],
      contentOrder,
      id,
      __typename: type = 'Thing',
      author
   } = useContext(context);
   const [newContentPiece, setNewContentPiece] = useState('');
   const locallyDeletedPieces = useRef([]);

   const [
      addContentPiece,
      { data: addData, loading: addLoading, error: addError }
   ] = useMutation(ADD_CONTENTPIECE_MUTATION, {
      onCompleted: data => checkForNewThingRedirect(id, 'addContentPiece', data)
   });

   const [
      deleteContentPiece,
      { data: deleteData, loading: deleteLoading, error: deleteError }
   ] = useMutation(DELETE_CONTENTPIECE_MUTATION);

   const [
      editContentPiece,
      { data: editData, loading: editLoading, error: editError }
   ] = useMutation(EDIT_CONTENTPIECE_MUTATION);

   const [reorderContent] = useMutation(REORDER_CONTENT_MUTATION);
   const [reordering, setReordering] = useState(false);

   // This ref is going to hold all the data we need for making the edit buttons sticky. Things that don't change are populated in an effect that runs on the first render only, and everything else is populated in the stickifier function, which will be attached to a scroll listener by that same effect.
   const stickingData = useRef({
      blocksArray: []
   });

   const stickifier = () => {
      const blockPositionsArray = [];

      const blocks = document.querySelectorAll('.contentBlock');
      for (const block of blocks) {
         const blockOffset = block.offsetTop;
         const blockHeight = block.offsetHeight;

         const buttons = block.querySelector('.buttonsContainer');
         if (buttons == null) continue;
         const buttonsHeight = buttons.offsetHeight;

         // The "top" we use for determining when to start sticking things is slightly different from the actual top of the element. I'm defining that top first so I can base the "top" off it as well as the bottom, which is the actual bottom
         const blockTop =
            blockOffset +
            stickingData.current.blockPadding +
            stickingData.current.fullThingOffset;
         const top =
            blockTop + stickingData.current.piecePadding + buttonsHeight;
         const bottom = blockTop + blockHeight;
         blockPositionsArray.push({
            block,
            top,
            bottom
         });
      }
      stickingData.current.blocksArray = blockPositionsArray;

      // On mobile, the scrolling element is the thingPage container, on desktop, it's the mainSection container
      const thingPage = document.querySelector('.thingPage');
      const mainSection = document.querySelector('.mainSection');

      let viewableTop = 0;
      let viewableBottom;

      const bottomBar = document.querySelector('.bottomBar');
      const bottomBarDisplay = window.getComputedStyle(bottomBar).display;

      // bottomBar also only shows on mobile
      if (bottomBarDisplay === 'none') {
         viewableTop = mainSection.scrollTop;
         const wholeWindowHeight = window.innerHeight;
         const header = document.getElementById('header');
         const headerHeight = header.offsetHeight;
         viewableBottom = viewableTop + wholeWindowHeight - headerHeight;
      } else {
         viewableTop = thingPage.scrollTop;
         const bottomBar = document.querySelector('.bottomBar');
         const bottomBarHeight = bottomBar.offsetHeight;
         viewableBottom = viewableTop + window.innerHeight - bottomBarHeight;
      }

      stickingData.current.blocksArray.forEach(block => {
         const buttons = block.block.querySelector('.buttonsContainer');
         const buttonsHeight = buttons.offsetHeight;
         // If the top of the element is onscreen but the bottom isn't, we want to fix the edit buttons in place at the bottom of the screen
         if (block.top < viewableBottom && block.bottom > viewableBottom) {
            const buttonRect = buttons.getBoundingClientRect();
            buttons.style.position = 'fixed';
            buttons.style.left = `${buttonRect.left}px`;
            buttons.style.right = 'initial';
            buttons.style.top = 'initial';

            if (bottomBarDisplay === 'none') {
               buttons.style.bottom = '2rem';
            } else {
               buttons.style.bottom = `calc(${
                  bottomBar.offsetHeight
               }px + 1rem)`;
            }
         } else if (
            block.top - buttonsHeight < viewableBottom &&
            block.top < viewableBottom &&
            block.bottom > viewableBottom
         ) {
            // If the top of the element is onscreen by less than the height of the buttons (which is already included in it when it's originally calculated), we want to absolutely position the buttons at the top right of the content block
            buttons.style.position = 'absolute';
            buttons.style.left = 'initial';
            buttons.style.right = '0';
            buttons.style.bottom = '0';
            buttons.style.top = '1rem';
         } else {
            // Otherwise we want to put them back in place at the bottom right of the content block
            buttons.style.position = 'absolute';
            buttons.style.left = 'initial';
            buttons.style.right = '0';
            buttons.style.bottom = '1rem';
            buttons.style.top = 'initial';
         }
      });
   };

   // Add the stickifier listeners
   useEffect(() => {
      // On desktop, mainSection does the scrolling. On mobile, it's thingPage
      const thingPage = document.querySelector('.thingPage');
      if (thingPage != null) {
         thingPage.addEventListener('scroll', stickifier);
      }
      const mainSection = document.querySelector('.mainSection');
      mainSection.addEventListener('scroll', stickifier);

      const blocks = document.querySelectorAll('.contentBlock');
      if (blocks.length === 0) return;
      const firstBlock = blocks[0];

      const blockPaddingString = window.getComputedStyle(firstBlock).paddingTop;
      const blockPaddingRaw = blockPaddingString.substring(
         0,
         blockPaddingString.length - 2
      );
      const blockPadding = parseInt(blockPaddingRaw);
      stickingData.current.blockPadding = blockPadding;

      const piece = firstBlock.querySelector('.contentPiece');
      const piecePaddingString = window.getComputedStyle(piece).paddingTop;
      const piecePaddingRaw = piecePaddingString.substring(
         0,
         piecePaddingString.length - 2
      );
      const piecePadding = parseInt(piecePaddingRaw);
      stickingData.current.piecePadding = piecePadding;

      const fullThing = firstBlock.offsetParent;
      const fullThingOffset = fullThing.offsetTop;
      stickingData.current.fullThingOffset = fullThingOffset;

      // Need to run it once here so that the edit buttons will be properly placed before the first scroll
      stickifier();

      return () => {
         mainSection.removeEventListener('scroll', stickifier);
         if (thingPage != null) {
            thingPage.removeEventListener('scroll', stickifier);
         }
      };
   }, [stickifier]);

   const sendNewContentPiece = async () => {
      setNewContentPiece('');
      content.push({
         __typename: 'ContentPiece',
         content: newContentPiece,
         id: 'temporaryID'
      });
      setFullThingToLoading(id);
      await addContentPiece({
         variables: {
            content: newContentPiece,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addContentPiece: {
               __typename: type,
               id,
               content
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't
               let query;
               switch (data.addContentPiece.__typename) {
                  case 'Thing':
                     query = SINGLE_THING_QUERY;
                     break;
                  case 'Tag':
                     query = SINGLE_TAX_QUERY;
                     break;
                  case 'Stack':
                     query = SINGLE_TAX_QUERY;
                     break;
                  default:
                     console.log('Unknown stuff type');
                     return;
               }
               const oldData = client.readQuery({
                  query,
                  variables: { id }
               });
               oldData[data.addContentPiece.__typename.toLowerCase()].content =
                  data.addContentPiece.content;
               client.writeQuery({
                  query,
                  variables: { id },
                  data: oldData
               });
            }
         }
      });
   };

   const deletePiece = async contentPieceID => {
      if (!confirm('Are you sure you want to delete that?')) {
         return;
      }
      const newContent = content.filter(
         contentPiece => contentPiece.id !== contentPieceID
      );
      await deleteContentPiece({
         variables: {
            contentPieceID,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteContentPiece: {
               __typename: type,
               id,
               content: newContent
            }
         }
      });
   };

   const editPiece = async (contentPieceID, newContent) => {
      const indexOfEditedContentPiece = content.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );
      content[indexOfEditedContentPiece].content = newContent;

      await editContentPiece({
         variables: {
            contentPieceID,
            content: newContent,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editContentPiece: {
               __typename: type,
               id,
               content: newContent
            }
         }
      });
   };

   if ((content == null || content.length === 0) && !canEdit) return null;

   let contentElements;
   if (content) {
      let orderedContent;
      if (contentOrder && contentOrder.length > 0) {
         orderedContent = [];
         contentOrder.forEach(id => {
            const [piece] = content.filter(
               contentPiece => contentPiece.id === id
            );
            if (piece != null) {
               orderedContent.push(piece);
            }
         });
         content.forEach(contentPiece => {
            if (contentOrder.includes(contentPiece.id)) {
               return;
            }
            orderedContent.push(contentPiece);
         });
      } else {
         orderedContent = content;
      }
      contentElements = orderedContent.map(contentPiece => (
         <div
            key={contentPiece.id}
            className={reordering ? 'reordering' : 'locked'}
         >
            <ContentPiece
               id={contentPiece.id}
               thingID={id}
               canEdit={canEdit}
               rawContentString={contentPiece.content}
               deleteContentPiece={deletePiece}
               editContentPiece={editPiece}
               setReordering={setReordering}
               reordering={reordering}
               highlighted={linkedPiece === contentPiece.id}
               key={contentPiece.id}
            />
         </div>
      ));
   }

   if (process.browser && canEdit && reordering) {
      contentElements = (
         <Reorder
            reorderId={id}
            touchHoldTime={250}
            placeholderClassName="placeholder"
            draggedClassName="dragged"
            onReorder={async (e, oldPosition, newPosition, reorderId, f) => {
               let order;
               if (contentOrder != null) {
                  order = [];
                  contentOrder.forEach(id => {
                     const [piece] = content.filter(
                        contentPiece => contentPiece.id === id
                     );
                     if (piece != null) {
                        order.push(id);
                     }
                  });
                  content.forEach(contentPiece => {
                     if (contentOrder.includes(contentPiece.id)) {
                        return;
                     }
                     order.push(contentPiece.id);
                  });
               } else {
                  order = content.map(content => content.id);
               }
               order.splice(newPosition, 0, order.splice(oldPosition, 1)[0]);
               await reorderContent({
                  variables: {
                     id,
                     type,
                     oldPosition,
                     newPosition
                  },
                  optimisticResponse: {
                     reorderContent: {
                        __typename: type,
                        id,
                        content,
                        contentOrder: order
                     }
                  }
               });
            }}
         >
            {contentElements}
         </Reorder>
      );
   }

   return (
      <StyledContent className="content">
         <Head>
            <meta property="og:description" content={content} />
         </Head>
         {contentElements}
         {canEdit && (
            <RichTextArea
               text={newContentPiece}
               setText={setNewContentPiece}
               postText={sendNewContentPiece}
               placeholder="Add content"
               buttonText="add"
               id={`${id}-content`}
            />
         )}
         {canEdit && (
            <button
               type="button"
               className="reorder"
               onClick={() => setReordering(!reordering)}
            >
               {reordering ? 'Lock Content' : 'Reorder Content'}
            </button>
         )}
      </StyledContent>
   );
};
Content.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired,
   canEdit: PropTypes.bool
};

export default Content;
