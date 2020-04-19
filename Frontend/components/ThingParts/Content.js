import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Reorder from 'react-reorder';
import { setAlpha, setLightness } from '../../styles/functions';
import ContentPiece from './ContentPiece';
import ContentInput from './ContentInput';
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
   margin: 3rem 0;
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
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      margin: 0.6rem 0;
      border-bottom: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      padding: 0;
      ${props => props.theme.mobileBreakpoint} {
         flex-wrap: nowrap;
         padding: 1rem;
      }
      div.buttons {
         width: ${props => props.theme.smallText};
      }
      img.buttons,
      svg.buttons {
         width: 100%;
         &.trashIcon {
            opacity: 0.8;
         }
         &.editThis {
            opacity: 0.25;
         }
         &:hover {
            cursor: pointer;
            opacity: 1;
         }
      }
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

const Content = props => {
   const { context, canEdit } = props;
   const {
      content = [],
      contentOrder,
      id,
      __typename: type = 'Thing',
      author
   } = useContext(context);
   const [newContentPiece, setNewContentPiece] = useState('');

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

   let contentElements;
   if (content) {
      let orderedContent;
      if (contentOrder) {
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
               canEdit={canEdit}
               rawContentString={contentPiece.content}
               deleteContentPiece={deletePiece}
               editContentPiece={editPiece}
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
         {contentElements}
         {canEdit && (
            <ContentInput
               currentContent={newContentPiece}
               updateContent={setNewContentPiece}
               postContent={sendNewContentPiece}
               id={id}
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
