import React, { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import debounce from 'lodash.debounce';
import { useCombobox } from 'downshift';
import Tags from './Tags';
import { ThingContext } from '../../pages/thing';
import { setAlpha } from '../../styles/functions';

const ADD_TAG_MUTATION = gql`
   mutation ADD_TAG_MUTATION($tag: String!, $thingID: ID!) {
      addTagToThing(tag: $tag, thingID: $thingID) {
         __typename
         id
         partOfTags {
            __typename
            id
            title
         }
      }
   }
`;

const SEARCH_TAGS_QUERY = gql`
   query SEARCH_TAGS_QUERY($searchTerm: String!) {
      searchTags(searchTerm: $searchTerm) {
         __typename
         id
         title
         featuredImage
      }
   }
`;
export { SEARCH_TAGS_QUERY };

const StyledTagBox = styled.section`
   max-width: 100%;
   margin: 5rem 0;
   .tagboxContainer {
      display: inline-block;
      position: relative;
      margin-top: 0.8rem;
      input {
         width: 30rem;
      }
      .resultsContainer {
         position: absolute;
         /* The container must be positioned down 1em for the font size, 2 * .25rem for the padding on the input, and then 1px for the border */
         top: calc(1em + 2 * 0.25rem + 1px);
         left: 0;
         width: 100%;
         font-size: ${props => props.theme.smallText};
         border: 1px solid
            ${props => setAlpha(props.theme.highContrastGrey, 0.4)};
         border-top: none;
         .searchResult {
            padding: 0.25rem 1rem;
            &.highlighted {
               background: ${props => props.theme.majorColor};
            }
            &.loading,
            &.empty {
               color: ${props => setAlpha(props.theme.mainText, 0.6)};
            }
         }
      }
   }
   input {
      font-size: ${props => props.theme.smallText};
      line-height: 1;
      border-radius: 0;
      &.loading {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      }
   }
`;

const debouncedAutocomplete = debounce(
   (generateAutocomplete, inputValue) => generateAutocomplete(inputValue),
   250,
   true
);

const TagBox = () => {
   const { id, partOfTags: tags } = useContext(ThingContext);

   const [
      searchTags,
      { loading: searchLoading, data: searchData }
   ] = useLazyQuery(SEARCH_TAGS_QUERY);

   const generateAutocomplete = async inputValue => {
      let searchTerm;
      if (inputValue.includes(',')) {
         const finalCommaLocation = inputValue.lastIndexOf(',');
         const finalSearchTermRaw = inputValue.substring(
            finalCommaLocation + 1
         );
         searchTerm = finalSearchTermRaw.trim();
      } else {
         searchTerm = inputValue;
      }
      if (searchTerm === '') {
         return;
      }
      await searchTags({
         variables: {
            searchTerm
         }
      });
   };

   const handleTagInput = async inputValue => {
      setTagInput(inputValue);
      debouncedAutocomplete(generateAutocomplete, inputValue);
   };

   const alreadyUsedTags = tags.map(tagObj => tagObj.title);

   const filterResults = results =>
      results.filter(tagResult => !alreadyUsedTags.includes(tagResult.title));

   const {
      isOpen,
      selectedItem,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps
   } = useCombobox({
      items: searchData ? filterResults(searchData.searchTags) : [],
      itemToString: i => (i == null ? '' : i.title),
      onInputValueChange: changes => {
         handleTagInput(changes.inputValue);
      }
   });
   /*
   A couple notes, because this downshift implementation was not as clean as I'd like.

   When the user types into the add tag box, it calls the onInputValueChange function in the useCombobox options, which in turn calls the handleTagInput function.

   That function updates state with the input value, which is necessary because the displayed text on the input reads from state. It then calls debouncedAutocomplete (which has to be declared outside of this functional component so it doesn't regenerate with each state output, breaking the debounce)

   generateAutocomplete runs the searchTags lazy query with the value passed into it

   The searchResults are generated directly from the data returned from the searchTags query, so that happens on every render based on what data we currently have from that query

   So the processes are:
   text input -> update state -> display input text
   text input -> searchTags -> update searchData
   searchData -> display search results

   To actually add a tag, we use the onKeyDown prop on the input. This calls handleKeyDown, which checks if the key was enter. If it was, it either adds the highlighted tag from downshift, or if nothing is highlighted, the text in the input.
   */

   let searchResults;
   if (searchLoading) {
      searchResults = <div className="searchResult loading">Loading...</div>;
   }
   if (searchData) {
      const filteredResults = filterResults(searchData.searchTags);
      if (filteredResults.length === 0) {
         searchResults = (
            <div className="searchResult empty">No Results For {tagInput}</div>
         );
      } else {
         searchResults = filteredResults.map((result, index) => (
            <div
               className={`searchResult${
                  highlightedIndex === index ? ' highlighted' : ''
               }`}
               key={index}
               {...getItemProps({ result, index })}
            >
               {result.title}
            </div>
         ));
      }
   }

   const [tagInput, setTagInput] = useState('');
   const [addTagToThing, { loading: addTagLoading }] = useMutation(
      ADD_TAG_MUTATION
   );

   const handleKeyDown = async e => {
      if (e.key === 'Enter') {
         if (highlightedIndex > -1) {
            const filteredResults = filterResults(searchData.searchTags);
            if (tagInput.includes(',')) {
               const finalCommaLocation = tagInput.lastIndexOf(',');
               const preCommaInput = tagInput.substring(0, finalCommaLocation);
               console.log(preCommaInput);
               await sendNewTag({ title: preCommaInput });
            }
            await sendNewTag(filteredResults[highlightedIndex]);
         } else {
            await sendNewTag({ title: tagInput });
         }
      }
   };

   const sendNewTag = async newTagObj => {
      if (newTagObj == null) {
         setTagInput('');
         return;
      }
      const { title } = newTagObj;
      await addTagToThing({
         variables: {
            tag: title,
            thingID: id
         }
      });
      setTagInput('');
   };

   return (
      <StyledTagBox>
         <Tags tags={tags} />
         <div className="tagboxContainer">
            <form {...getComboboxProps()}>
               <input
                  {...getInputProps({
                     type: 'text',
                     id: 'addTag',
                     name: 'addTag',
                     placeholder: '+ Add Tag',
                     value: tagInput,
                     disabled: addTagLoading,
                     className: `addTag ${addTagLoading ? 'loading' : 'ready'}`,
                     onKeyDown: e => {
                        e.persist();
                        handleKeyDown(e);
                     }
                  })}
               />
            </form>
            {(searchData || searchLoading) && tagInput !== '' && isOpen && (
               <div className="resultsContainer">{searchResults}</div>
            )}
         </div>
      </StyledTagBox>
   );
};

export default TagBox;
