import gql from 'graphql-tag';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { Router } from 'next/router';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import { SEARCH_QUERY } from '../SearchResults';
import { setAlpha } from '../../styles/functions';
import { fullThingFields } from '../../lib/CardInterfaces';
import { home } from '../../config';

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
      &.highlighted {
         background: ${props => props.theme.majorColor};
      }
      &:hover {
         background: ${props => props.theme.majorColor};
      }
   }
   .newThingLine {
      padding: 0.5rem 1rem;
      background: ${props => props.theme.lightBlack};
      cursor: pointer;
      &.highlighted {
         background: ${props => props.theme.majorColor};
      }
      &:hover {
         background: ${props => props.theme.majorColor};
      }
   }
`;

const debouncedPostSearch = debounce(
   (postSearch, searchTerm) => postSearch(searchTerm),
   200,
   true
);

const CopyContentInterface = ({ id, thingID, setShowingAddToBox }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [postSearchResults, setPostSearchResults] = useState([]);
   const [highlightedIndex, setHighlightedIndex] = useState(-1);

   const searchResultsRef = useRef(postSearchResults);
   const highlightedIndexRef = useRef(highlightedIndex);

   const thisInterfaceRef = useRef(null);

   useEffect(() => {
      const thisBox = thisInterfaceRef.current;
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

   useEffect(() => {
      const thisBox = thisInterfaceRef.current;
      thisBox.addEventListener('keydown', navigateResultsRef.current);
   }, []);

   const [search, { loading: searchLoading }] = useLazyQuery(SEARCH_QUERY, {
      onCompleted: data => {
         const filteredData = data.search.filter(thing => {
            if (thing.id === thingID) return false;
            let alreadyCopied = true;
            thing.copiedInContent.forEach(copiedInThing => {
               if (copiedInThing.id === id) {
                  alreadyCopied = false;
               }
            });
            return alreadyCopied;
         });
         const trimmedData = filteredData.slice(0, 10);
         setPostSearchResults(trimmedData);
         searchResultsRef.current = trimmedData;
      }
   });

   const [copyContentPiece] = useMutation(COPY_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const closeResults = () => {
      setSearchTerm('');
      setPostSearchResults([]);
      searchResultsRef.current = [];
      setHighlightedIndex(-1);
      highlightedIndexRef.current = -1;

      const thisBox = thisInterfaceRef.current;
      thisBox.removeEventListener('keydown', navigateResultsRef.current);
      setShowingAddToBox(false);
   };

   const chooseResult = selectedIndex => {
      let index = selectedIndex;
      if (selectedIndex == null) {
         // If we click on a result, we pass the index when we call the function. If we select it with the keyboard, we don't, but we can get it from the highlightedIndexRef
         index = highlightedIndexRef.current;
      }
      let selectedPost = {};
      if (searchResultsRef.current[index] == null) {
         // This is probably because the user selected the new post button, so let's check for that
         if (
            searchResultsRef.current.length === 0 ||
            searchResultsRef.current.length === index
         ) {
            selectedPost.id = 'new';
         } else {
            // If it wasn't because the user selected the new post button, let's get out of here
            return;
         }
      } else {
         selectedPost = searchResultsRef.current[index];
      }
      copyContentPiece({
         variables: {
            contentPieceID: id,
            newThingID: selectedPost.id
         }
      }).then(({ data }) => {
         if (selectedPost.id === 'new' && process.browser) {
            window.open(`${home}/thing?id=${data.copyContentPiece.id}`);
         } else {
            toast('Content has been copied!', {
               position: 'bottom-center',
               autoClose: 3000
            });
         }
      });

      closeResults();
   };

   const navigateResults = e => {
      if (e.key === 'ArrowDown') {
         e.preventDefault();

         // If we're at the end, newIndex goes back to the beginning, otherwise it's +1
         const newIndex =
            highlightedIndexRef.current + 1 <
            searchResultsRef.current.length + 1 // The +1 on the ref length is to allow for the new post option, which is not part of the search results
               ? highlightedIndexRef.current + 1
               : 0;
         setHighlightedIndex(newIndex);
         highlightedIndexRef.current = newIndex;
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();

         // If we're at the beginning, newIndex goes to the end, otherwise it's -1
         const newIndex =
            highlightedIndexRef.current - 1 < 0
               ? searchResultsRef.current.length // We don't subtract 1 here to account for zero-based indexing to allow for the new post option, which is not part of the search results
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

   const postSearch = searchTerm => {
      const searchResults = search({
         variables: {
            string: searchTerm,
            isTitleOnly: true
         }
      });
   };

   const handleKeyUp = e => {
      if (e.key === 'Escape') closeResults();
      if (e.key === 'Enter' || e.key === 'Tab') return;
      if (searchTerm === '') return;

      if (search != null) {
         debouncedPostSearch(postSearch, searchTerm);
      }
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
         ref={thisInterfaceRef}
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
         <div
            className={
               highlightedIndex === searchResultsRef.current.length // Because of zero-based indexing, this will actually be one more than the highest index of the search results
                  ? 'newThingLine highlighted'
                  : 'newThingLine'
            }
            onClick={() => chooseResult(searchResultsRef.current.length)}
         >
            + New Thing
         </div>
      </StyledCopyContentInterface>
   );
};

export default CopyContentInterface;
