import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { setAlpha, setLightness } from '../../styles/functions';
import ContentPiece from './ContentPiece';
import ContentInput from './ContentInput';

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
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Category {
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
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Category {
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
         ... on Thing {
            __typename
            id
            content {
               __typename
               id
               content
            }
         }
         ... on Category {
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

const StyledContent = styled.section`
   margin: 5rem 0;
   background: ${props => props.theme.black};
   padding: 1rem 3rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   border-radius: 0.5rem;
   p,
   .graph {
      margin: 1.8rem 0;
   }
   p {
      max-width: 1000px;
   }
   a,
   a:visited {
      color: ${props => setLightness(props.theme.majorColor, 75)};
   }
   .contentBlock {
      display: flex;
      flex-wrap: nowrap;
      align-items: baseline;
      margin: 0.6rem 0;
      border-bottom: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      padding: 1rem 0;
      img.buttons {
         width: ${props => props.theme.smallText};
         opacity: 0.2;
         margin-left: 1rem;
         &:hover {
            cursor: pointer;
            opacity: 0.8;
         }
      }
      form {
         max-width: 1040px;
         margin: calc(0.8rem - 2px) calc(-1rem - 1px);
         textarea {
            padding: 1rem;
            height: 10rem;
            ${props => props.theme.scroll};
         }
      }
      .contentPiece {
         margin: 0rem 0;
         flex-grow: 1;
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
         text-align: right;
      }
   }
   textarea {
      width: 100%;
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
   const { content, id, __typename: type, author } = useContext(context);
   const [newContentPiece, setNewContentPiece] = useState('');

   const checkForRedirect = data => {
      if (id === 'new') {
         Router.push({
            pathname: '/thing',
            query: { id: data.setThingTitle.id }
         });
      }
   };

   const [
      addContentPiece,
      { data: addData, loading: addLoading, error: addError }
   ] = useMutation(ADD_CONTENTPIECE_MUTATION, {
      onCompleted: data => checkForRedirect(data)
   });

   const [
      deleteContentPiece,
      { data: deleteData, loading: deleteLoading, error: deleteError }
   ] = useMutation(DELETE_CONTENTPIECE_MUTATION);

   const [
      editContentPiece,
      { data: editData, loading: editLoading, error: editError }
   ] = useMutation(EDIT_CONTENTPIECE_MUTATION);

   const sendNewContentPiece = async () => {
      setNewContentPiece('');
      content.push({
         __typename: 'ContentPiece',
         content: newContentPiece,
         id: 'temporaryID'
      });
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
         }
      });
   };

   const deletePiece = async contentPieceID => {
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
         }
      });
   };

   let contentElements;
   if (content) {
      contentElements = content.map(contentPiece => (
         <ContentPiece
            id={contentPiece.id}
            canEdit={canEdit}
            rawContentString={contentPiece.content}
            deleteContentPiece={deletePiece}
            editContentPiece={editPiece}
            key={contentPiece.id}
         />
      ));
   }

   return (
      <StyledContent>
         {contentElements}
         {canEdit && (
            <ContentInput
               currentContent={newContentPiece}
               updateContent={setNewContentPiece}
               postContent={sendNewContentPiece}
            />
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
