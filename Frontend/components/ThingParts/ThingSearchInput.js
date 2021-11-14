import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { home } from '../../config';
import { useSearchResultsSelector } from '../../lib/RichTextHandling';
import { useLazyQueryAndStoreIt } from '../../stuffStore/useQueryAndStoreIt';
import { setAlpha } from '../../styles/functions';
import { SEARCH_QUERY } from '../SearchResults';
import FlexibleThingCard from '../ThingCards/FlexibleThingCard';

const StyledThingSearchInput = styled.div`
   .topline {
      display: flex;
      input.searchBox {
         font-size: ${props => props.theme.smallText};
         width: 0;
         flex-grow: 1;
      }
   }
   .postSearchResult.highlighted article {
      .flexibleThingHeader {
         background: ${props => setAlpha(props.theme.majorColor, 0.6)};
      }
   }
   .postSearchResult:hover article {
      .flexibleThingHeader {
         background: ${props => setAlpha(props.theme.majorColor, 0.3)};
      }
   }
   .postSearchResult article {
      &:first-child {
         margin: 0;
      }
      header.flexibleThingHeader {
         .headerTop .titleWrapper {
            text-align: left;
            .titleBarContainer form {
               margin: 0;
            }
         }
         .toolbar .buttons .commentButtonWrapper {
            margin: 0;
         }
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
   (postSearch, handledSearchTerm) => postSearch(handledSearchTerm),
   200,
   true
);

const ThingSearchInput = ({
   labelText,
   parentThingID,
   onChosenResult,
   allowNewThing,
   additionalResultsFilter,
   setShowing,
   placeholder,
   value,
   setValue,
   name,
   skipSearchTerm
}) => {
   // We're going to do a search for the string entered into a text input and then generate an interface to allow users to select one of the results from that search.
   // First we need the search term in state
   const [searchTerm, setSearchTerm] = useState('');

   let handleSetSearchTerm;
   let handledSearchTerm;
   if (value != null && setValue != null) {
      handleSetSearchTerm = setValue;
      handledSearchTerm = value;
   } else {
      handleSetSearchTerm = e => setSearchTerm(e.target.value);
      handledSearchTerm = searchTerm;
   }

   // Then we run a custom hook that calls all the other hooks we'll need to make this work
   const {
      postSearchResults,
      setPostSearchResults,
      highlightedIndex,
      setHighlightedIndex,
      searchResultsRef,
      highlightedIndexRef,
      resetResultsSelector
   } = useSearchResultsSelector();

   // We'll need a ref to keep track of this component, so we can put listeners on it to allow users to navigate the results with their keyboard
   const thisInterfaceRef = useRef(null);

   useEffect(() => {
      const thisBox = thisInterfaceRef.current;
      thisBox.addEventListener('keydown', navigateResultsRef.current);
   }, []);

   // Then we need the query that will perform the search
   const [search, { loading: searchLoading }] = useLazyQueryAndStoreIt(
      SEARCH_QUERY,
      {
         onCompleted: data => {
            // When we get data back, we want to filter out the thing we're currently viewing and then run any extra filter that was passed as a prop
            const filteredData = data.search.filter(thing => {
               if (thing.id === parentThingID) return false;
               if (additionalResultsFilter != null) {
                  return additionalResultsFilter(thing);
               }
               return true;
            });
            // We only want the first 10 results
            const trimmedData = filteredData.slice(0, 10);
            // And once we have them we want to put them in state and in our results ref
            setPostSearchResults(trimmedData);
            searchResultsRef.current = trimmedData;
         }
      }
   );

   // We want a debounced version of the search function, so we wrap it in this little handler
   const postSearch = handledSearchTerm => {
      const searchResults = search({
         variables: {
            string: handledSearchTerm,
            isTitleOnly: true
         }
      });
   };

   const handleKeyUp = e => {
      if (e.key === 'Escape') closeResults();
      if (e.key === 'Enter' || e.key === 'Tab') return; // Enter is handled by the listener we put on the component's ref, so that it works on the results as well as in the input. Tab does nothing.
      if (handledSearchTerm.trim() === '') return;

      if (search != null) {
         debouncedPostSearch(postSearch, handledSearchTerm);
      }
   };

   // Closing the results involves editing a few different refs and pieces of state, so we'll write a function to make it easier
   const closeResults = () => {
      handleSetSearchTerm('');

      resetResultsSelector();

      const thisBox = thisInterfaceRef.current;
      thisBox.removeEventListener('keydown', navigateResultsRef.current);
      if (setShowing != null) {
         setShowing(false);
      }
   };

   const chooseResult = selectedIndex => {
      // We have to do a few things after the result is chosen
      let index = selectedIndex;
      if (selectedIndex == null) {
         // If we click on a result, we pass the index when we call the function. If we select it with the keyboard, we don't, but we can get it from the highlightedIndexRef
         index = highlightedIndexRef.current;
      }
      // We're going to need an object we can populate with data about the post they've selected
      let selectedPost = {};
      if (searchResultsRef.current[index] == null) {
         // This is probably because the user selected the new post button, so let's check for that
         if (
            searchResultsRef.current.length === 0 || // If there are no results, they must have clicked the new post button
            searchResultsRef.current.length === index // If the index of the result they chose is the same as the length of the array, that means it's the extra result tacked on at the end, ie the new post button
         ) {
            selectedPost.id = 'new';
         } else {
            // If it wasn't because the user selected the new post button, let's get out of here cause we don't know what's going on anymore
            return;
         }
      } else {
         selectedPost = searchResultsRef.current[index];
      }
      onChosenResult(selectedPost);

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

   // Then we need to turn the results into elements we can show
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
            onClick={e => {
               e.stopPropagation();
               chooseResult(index);
            }}
         >
            <FlexibleThingCard thingID={result.id} contentType="single" />
         </div>
      ));
   } else if (postSearchResults.length === 0) {
      postSearchResultElements = <div>No posts found</div>;
   }

   return (
      <StyledThingSearchInput
         ref={thisInterfaceRef}
         className="thingSearchInput"
      >
         <div className="topline">
            {labelText}
            <input
               className="searchBox"
               value={handledSearchTerm}
               name={name || 'thingSearch'}
               placeholder={placeholder || 'Search Things'}
               onChange={handleSetSearchTerm}
               onKeyUp={handleKeyUp}
            />
         </div>
         {handledSearchTerm.length > 0 &&
            handledSearchTerm !== skipSearchTerm && (
               <div className="postSearchResults">
                  {postSearchResultElements}
               </div>
            )}
         {allowNewThing && (
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
         )}
      </StyledThingSearchInput>
   );
};

export default ThingSearchInput;
