import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import { setAlpha } from '../../styles/functions';
import { contentPieceFields } from '../../lib/CardInterfaces';
import { home } from '../../config';
import ThingSearchInput from './ThingSearchInput';

const COPY_CONTENTPIECE_MUTATION = gql`
   mutation COPY_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $newThingID: ID!
   ) {
      copyContentPiece(
         contentPieceID: $contentPieceID
         newThingID: $newThingID
      ) {
         __typename
         id
         content {
            ${contentPieceFields}
         }
      }
   }
`;

const StyledCopyContentInterface = styled.div`
   --boxwidth: 40rem;
   position: absolute;
   width: 100%;
   height: auto;
   left: 0;
   top: 100%;
   background: ${props => props.theme.lightBlack};
   border: 3px solid ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
   z-index: 2;
   max-width: calc(100vw - 6px - 2rem);
   /* .postSearchResult article {
      padding: 0.5rem 1rem;
      background: ${props => props.theme.lightBlack};
      border-bottom: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      cursor: pointer;
      &.highlighted {
         background: ${props => props.theme.majorColor};
      }
      &:hover {
         background: ${props => props.theme.majorColor};
      }
   } */
   .topline {
      background: ${props => props.theme.deepBlack};
      padding: 1rem;
   }
`;

const CopyContentInterface = ({ id, thingID, setShowingAddToBox }) => {
   const [copyContentPiece] = useMutation(COPY_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const additionalResultsFilter = thing => {
      let alreadyCopied = true;
      thing.copiedInContent.forEach(copiedInThing => {
         if (copiedInThing.id === id) {
            alreadyCopied = false;
         }
      });
      return alreadyCopied;
   };

   const onChosenResult = selectedPost => {
      copyContentPiece({
         variables: {
            contentPieceID: id,
            newThingID: selectedPost.id
         }
      }).then(({ data }) => {
         // If they selected a new post, we want to open it in a new tab for them
         if (selectedPost.id === 'new' && process.browser) {
            window.open(`${home}/thing?id=${data.copyContentPiece.id}`);
         } else {
            // Otherwise, we'll just pop up a little toast telling them it was copied
            toast('Content has been copied!', {
               position: 'bottom-center',
               autoClose: 3000
            });
         }
      });
   };

   return (
      <StyledCopyContentInterface
         className="addToInterface"
         id={`addToInterface_${id}`}
      >
         <ThingSearchInput
            labelText="Add To: "
            parentThingID={thingID}
            onChosenResult={onChosenResult}
            allowNewThing
            additionalResultsFilter={additionalResultsFilter}
            setShowing={setShowingAddToBox}
         />
      </StyledCopyContentInterface>
   );
};

export default CopyContentInterface;
