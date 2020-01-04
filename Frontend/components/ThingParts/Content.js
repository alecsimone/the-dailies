import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import { ThingContext } from '../../pages/thing';
import { makeTransparent } from '../../styles/functions';
import { processLinksInText } from '../../lib/UrlHandling';
import ContentPiece from './ContentPiece';

const ADD_CONTENTPIECE_MUTATION = gql`
   mutation ADD_CONTENTPIECE_MUTATION($content: String!, $thingID: ID!) {
      addContentPieceToThing(content: $content, thingID: $thingID) {
         __typename
         id
         content {
            __typename
            id
            content
         }
      }
   }
`;

const DELETE_CONTENTPIECE_MUTATION = gql`
   mutation DELETE_CONTENTPIECE_MUTATION($contentPieceID: ID!, $thingID: ID!) {
      deleteContentPieceFromThing(
         contentPieceID: $contentPieceID
         thingID: $thingID
      ) {
         __typename
         id
         content {
            __typename
            id
            content
         }
      }
   }
`;

const EDIT_CONTENTPIECE_MUTATION = gql`
   mutation EDIT_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $content: String!
      $thingID: ID!
   ) {
      editContentPieceOnThing(
         contentPieceID: $contentPieceID
         content: $content
         thingID: $thingID
      ) {
         __typename
         id
         content {
            __typename
            id
            content
         }
      }
   }
`;

const StyledContent = styled.section`
   p,
   .graph {
      line-height: 1.25;
      margin: 1.25rem 0;
      max-width: 1000px;
   }
   .contentBlock {
      display: flex;
      flex-wrap: nowrap;
      align-items: baseline;
      img.buttons {
         width: ${props => props.theme.smallText};
         opacity: 0.2;
         margin-left: 1rem;
         &:hover {
            cursor: pointer;
            opacity: 0.8;
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
      }
   }
   textarea {
      width: 100%;
      font-size: ${props => props.theme.smallText};
   }
   button {
      margin: 1rem auto;
      padding: 0.6rem;
      font-size: ${props => props.theme.smallText};
      font-weight: 500;
      &.post {
         background: ${props => makeTransparent(props.theme.majorColor, 0.8)};
         color: ${props => props.theme.mainText};
         &:hover {
            background: ${props => props.theme.majorColor};
            box-shadow: 0 0 6px
               ${props => makeTransparent(props.theme.majorColor, 0.6)};
         }
      }
      &.showToggle {
         display: block;
         border: none;
         border-radius: 50%;
         line-height: 0;
         padding: 0.6rem;
         font-size: 2rem;
         font-weight: 900;
         img {
            filter: saturate(0) brightness(2);
            opacity: 0.9;
            width: 2rem;
            transition: transform 0.75s;
            &.down {
               transform: rotateX(-180deg);
            }
         }
      }
   }
`;

const Content = () => {
   const { content, id } = useContext(ThingContext);
   const [newContentPiece, setNewContentPiece] = useState('');

   const [
      addContentPieceToThing,
      { data: addData, loading: addLoading, error: addError }
   ] = useMutation(ADD_CONTENTPIECE_MUTATION);

   const [
      deleteContentPieceFromThing,
      { data: deleteData, loading: deleteLoading, error: deleteError }
   ] = useMutation(DELETE_CONTENTPIECE_MUTATION);

   const [
      editContentPieceOnThing,
      { data: editData, loading: editLoading, error: editError }
   ] = useMutation(EDIT_CONTENTPIECE_MUTATION);

   const sendNewContentPiece = async () => {
      await addContentPieceToThing({
         variables: {
            content: newContentPiece,
            thingID: id
         }
      });
      setNewContentPiece('');
   };

   const deleteContentPiece = async contentPieceID => {
      await deleteContentPieceFromThing({
         variables: {
            contentPieceID,
            thingID: id
         }
      });
   };

   const editContentPiece = async (contentPieceID, newContent) => {
      const indexOfEditedContentPiece = content.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );
      content[indexOfEditedContentPiece].content = newContent;

      await editContentPieceOnThing({
         variables: {
            contentPieceID,
            content: newContent,
            thingID: id
         }
      });
   };

   const contentElements = content.map(contentPiece => {
      const paragraphsAndEmptyStrings = contentPiece.content.split('\n');
      const paragraphs = paragraphsAndEmptyStrings.filter(
         string => string != ''
      );
      const paragraphElements = paragraphs.map((graph, index) => {
         const processedGraph = processLinksInText(graph);
         return (
            <div className="graph" key={index}>
               {processedGraph}
            </div>
         );
      });
      return (
         <ContentPiece
            id={contentPiece.id}
            paragraphElements={paragraphElements}
            rawContentString={contentPiece.content}
            deleteContentPiece={deleteContentPiece}
            editContentPiece={editContentPiece}
            key={contentPiece.id}
         />
      );
   });

   const handleKeyDown = e => {
      if (e.key === 'Enter' && e.ctrlKey) {
         sendNewContentPiece();
      }
   };

   return (
      <StyledContent>
         {contentElements}
         <form
            onSubmit={async e => {
               e.preventDefault();
               sendNewContentPiece();
            }}
         >
            <textarea
               type="textarea"
               id="content"
               name="content"
               value={newContentPiece}
               onChange={e => setNewContentPiece(e.target.value)}
               onKeyDown={e => handleKeyDown(e)}
            />
            <button type="submit" className="post">
               add
            </button>
         </form>
      </StyledContent>
   );
};

export default Content;
