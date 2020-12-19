import gql from 'graphql-tag';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { SEARCH_QUERY } from '../SearchResults';
import { setAlpha } from '../../styles/functions';
import { fullThingFields } from '../../lib/CardInterfaces';

const COPY_CONTENTPIECE_MUTATION = gql`
   mutation COPY_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $newThingID: ID!
   ) {
      copyContentPiece(
         contentPieceID: $contentPieceID
         newThingID: $newThingID
      ) {
         ${fullThingFields}
      }
   }
`;

const StyledCopyContentInterface = styled.div`
   --boxwidth: 40rem;
   position: absolute;
   width: var(--boxwidth);
   height: auto;
   left: calc(-1rem - var(--boxwidth) - 2px)
      /*2px for the border, another rem for a margin */;
   top: 0;
   background: ${props => props.theme.lightBlack};
   border: 3px solid ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
   z-index: 2;
   .topline {
      padding: 1rem;
      background: ${props => props.theme.deepBlack};
      input.searchBox {
         font-size: ${props => props.theme.smallText};
      }
   }
   .postSearchResult {
      padding: 0.5rem 1rem;
      background: ${props => props.theme.lightBlack};
      border-bottom: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      cursor: pointer;
      &:last-child {
         border-bottom: none;
      }
      &.highlighted {
         background: ${props => props.theme.majorColor};
      }
      &:hover {
         background: ${props => props.theme.majorColor};
      }
   }
`;

const CopyContentInterface = ({ id, setShowingAddToBox }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [postSearchResults, setPostSearchResults] = useState([]);
   const [highlightedIndex, setHighlightedIndex] = useState(-1);

   const searchResultsRef = useRef(postSearchResults);
   const highlightedIndexRef = useRef(highlightedIndex);

   useEffect(() => {
      const thisBox = document.querySelector(`#addToInterface_${id}`);
      const thisBoxRect = thisBox.getBoundingClientRect();
      const thisBoxHeight = thisBoxRect.height;

      const thisContainer = thisBox.closest('.addToContainer');
      const thisContainerRect = thisContainer.getBoundingClientRect();
      const thisContainerDistanceFromBottomOfWindow =
         window.innerHeight - thisContainerRect.y;

      if (thisBoxHeight > thisContainerDistanceFromBottomOfWindow) {
         thisBox.style.top = `calc(${thisContainerDistanceFromBottomOfWindow -
            thisBoxHeight}px - 1rem)`; // The extra 1rem is for a little margin with the bottom of the screen
      } else {
         thisBox.style.top = '0';
      }
   });

   const [search, { loading: searchLoading }] = useLazyQuery(SEARCH_QUERY, {
      onCompleted: data => {
         const trimmedData = data.search.slice(0, 10);
         setPostSearchResults(trimmedData);
         searchResultsRef.current = trimmedData;
      }
   });

   const [copyContentPiece] = useMutation(COPY_CONTENTPIECE_MUTATION);

   const closeResults = () => {
      setSearchTerm('');
      setPostSearchResults([]);
      searchResultsRef.current = [];
      setHighlightedIndex(-1);
      highlightedIndexRef.current = -1;

      const thisBox = document.querySelector(`#addToInterface_${id}`);
      thisBox.removeEventListener('keydown', navigateResultsRef.current);
      setShowingAddToBox(false);
   };

   const chooseResult = selectedIndex => {
      let index = selectedIndex;
      if (selectedIndex == null) {
         index = highlightedIndexRef.current;
      }
      const selectedPost = searchResultsRef.current[index];

      copyContentPiece({
         variables: {
            contentPieceID: id,
            newThingID: selectedPost.id
         }
      });

      closeResults();
   };

   const navigateResults = e => {
      if (e.key === 'ArrowDown') {
         e.preventDefault();

         // If we're at the end, newIndex goes back to the beginning, otherwise it's +1
         const newIndex =
            highlightedIndexRef.current + 1 < searchResultsRef.current.length
               ? highlightedIndexRef.current + 1
               : 0;
         setHighlightedIndex(newIndex);
         highlightedIndexRef.current = newIndex;
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();

         // If we're at the beginning, newIndex goes to the end, otherwise it's -1
         const newIndex =
            highlightedIndexRef.current - 1 < 0
               ? searchResultsRef.current.length - 1
               : highlightedIndexRef.current - 1;
         setHighlightedIndex(newIndex);
         highlightedIndexRef.current = newIndex;
      } else if (e.key === 'Escape') {
         closeResults();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
         e.preventDefault();
         chooseResult();
      }
   };
   const navigateResultsRef = useRef(navigateResults);

   const handleKeyUp = async e => {
      if (e.key === 'Escape') closeResults();
      if (e.key === 'Enter' || e.key === 'Tab') return;

      const searchResults = await search({
         variables: {
            string: searchTerm,
            isTitleOnly: true
         }
      });

      const thisBox = document.querySelector(`#addToInterface_${id}`);
      thisBox.addEventListener('keydown', navigateResultsRef.current);
   };

   let postSearchResultElements;
   if (searchLoading) {
      postSearchResultElements = <div>Searching posts...</div>;
   } else if (postSearchResults.length > 0) {
      postSearchResultElements = postSearchResults.map((result, index) => (
         <div
            className={
               index === highlightedIndex
                  ? 'postSearchResult highlighted'
                  : 'postSearchResult'
            }
            key={index}
            onClick={() => chooseResult(index)}
         >
            {result.title}
         </div>
      ));
   } else if (postSearchResults.length === 0) {
      postSearchResultElements = <div>No posts found</div>;
   }

   return (
      <StyledCopyContentInterface
         className="addToInterface"
         id={`addToInterface_${id}`}
      >
         <div className="topline">
            Add To:{' '}
            <input
               className="searchBox"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               onKeyUp={e => handleKeyUp(e)}
            />
         </div>
         {searchTerm.length > 0 && postSearchResultElements}
      </StyledCopyContentInterface>
   );
};

export default CopyContentInterface;
