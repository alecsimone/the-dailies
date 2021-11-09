import gql from 'graphql-tag';
import styled from 'styled-components';
import { useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { useCombobox } from 'downshift';
import debounce from 'lodash.debounce';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import { setAlpha, successFlash } from '../../styles/functions';
import useMe from '../Account/useMe';

const ADD_TAXES_TO_THINGS_MUTATION = gql`
   mutation ADD_TAXES_TO_THINGS_MUTATION($taxes: String!, $thingIDs: [ID!] $personal: Boolean) {
      addTaxesToThings(taxes: $taxes, thingIDs: $thingIDs, personal: $personal) {
         ${smallThingCardFields}
      }
   }
`;
export { ADD_TAXES_TO_THINGS_MUTATION };

const ADD_TAX_MUTATION = gql`
   mutation ADD_TAX_MUTATION(
      $tax: String!
      $thingID: ID!
      $personal: Boolean!
   ) {
      addTaxToThing(tax: $tax, thingID: $thingID, personal: $personal) {
         __typename
         id
         partOfTags {
            __typename
            id
            title
            author {
               __typename
               id
               displayName
            }
         }
      }
   }
`;

const SEARCH_TAX_QUERY = gql`
   query SEARCH_TAX_QUERY($searchTerm: String!, $personal: Boolean!) {
      searchTaxes(searchTerm: $searchTerm, personal: $personal) {
         ... on Tag {
            __typename
            id
            title
            featuredImage
         }
         ... on Stack {
            __typename
            id
            title
            featuredImage
         }
      }
   }
`;

const StyledTaxInput = styled.div`
   position: relative;
   input {
      width: 10rem;
      min-width: 10rem;
      max-width: 40rem;
   }
   .resultsContainer {
      position: absolute;
      z-index: 2;
      top: 3rem;
      left: 0;
      width: 100%;
      font-size: ${props => props.theme.smallText};
      background: ${props => props.theme.midBlack};
      border: 3px solid ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
      border-top: 2px solid
         ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
      .searchResult {
         padding: 0.25rem 1rem;
         position: relative;
         &.highlighted {
            background: ${props => props.theme.majorColor};
         }
         &.loading,
         &.empty {
            color: ${props => setAlpha(props.theme.mainText, 0.6)};
         }
      }
   }
`;

const debouncedAutocomplete = debounce(
   (generateAutocomplete, inputValue) => generateAutocomplete(inputValue),
   200,
   true
);

const getFinalSearchTerm = inputValue => {
   if (inputValue.includes(',')) {
      const finalCommaLocation = inputValue.lastIndexOf(',');
      const finalSearchTermRaw = inputValue.substring(finalCommaLocation + 1);
      return finalSearchTermRaw.trim();
   }
   return inputValue;
};

const TaxInput = ({ id, tags, stacks, personal, thingData, containerRef }) => {
   const { loggedInUserID, memberFields } = useMe(
      'TaxInput',
      '__typename id displayName'
   );

   const [taxInput, setTaxInput] = useState(''); // Controls the input for the add tax box
   const [
      searchTaxes,
      { loading: searchLoading, data: searchData }
   ] = useLazyQuery(SEARCH_TAX_QUERY);

   const generateAutocomplete = inputValue => {
      const searchTerm = getFinalSearchTerm(inputValue); // We can separate taxes with commas, so this function gets the text after the last comma and we'll search only for that

      if (searchTerm === '') {
         return;
      }

      searchTaxes({
         variables: {
            searchTerm,
            personal
         }
      });
   };

   // We need to filter out the taxes that are already on this thing, so we make a list of them
   let alreadyUsedTaxes = [];
   if (tags && !personal) {
      alreadyUsedTaxes = tags.map(tagObj => tagObj.title);
   }
   if (stacks && personal) {
      alreadyUsedTaxes = stacks.map(stackObj => stackObj.title);
   }
   const filterResults = results =>
      results.filter(taxResult => !alreadyUsedTaxes.includes(taxResult.title));

   const handleTaxInput = async inputValue => {
      // Our onChange handler. Updates the value of the input and generates the search results (the auto complete), which is debounced
      setTaxInput(inputValue);
      debouncedAutocomplete(generateAutocomplete, inputValue);
   };

   const {
      isOpen,
      selectedItem,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps
   } = useCombobox({
      items: searchData ? filterResults(searchData.searchTaxes) : [],
      itemToString: i => (i == null ? '' : i.title),
      onInputValueChange: changes => {
         handleTaxInput(changes.inputValue);
      }
   });
   /*
   A couple notes, because this downshift implementation was not as clean as I'd like.

   When the user types into the add tax box, it calls the onInputValueChange function in the useCombobox options, which in turn calls the handleTagInput function.

   That function updates state with the input value, which is necessary because the displayed text on the input reads from state. It then calls debouncedAutocomplete (which has to be declared outside of this functional component so it doesn't regenerate with each state output, breaking the debounce)

   generateAutocomplete runs the searchTags lazy query with the value passed into it

   The searchResults are generated directly from the data returned from the searchTags query, so that happens on every render based on what data we currently have from that query

   So the processes are:
   text input -> update state -> display input text
   text input -> searchTags -> update searchData
   searchData -> display search results

   To actually add a tag, we use the onKeyDown and onClick props on the input, which either add the highlighted/clicked tag from downshift, or if nothing is highlighted/clicked, the text in the input.
   */

   let searchResults;
   if (searchLoading) {
      searchResults = <div className="searchResult loading">Loading...</div>;
   }
   if (searchData) {
      const filteredResults = filterResults(searchData.searchTaxes);
      if (filteredResults.length === 0) {
         searchResults = (
            <div className="searchResult empty">
               No Results For {getFinalSearchTerm(taxInput)}
            </div>
         );
      } else {
         searchResults = filteredResults.map((result, index) => (
            // These are the individual result elements, which we give the itemProps from downshift's useCombobox hook
            <div
               className={`searchResult${
                  highlightedIndex === index ? ' highlighted' : ''
               }`}
               key={index}
               {...getItemProps({
                  result,
                  index
               })}
            >
               {result.title}
            </div>
         ));
      }
   }

   const [addTaxToThing, { loading: addTaxLoading }] = useMutation(
      ADD_TAX_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const [addTaxesToThings] = useMutation(ADD_TAXES_TO_THINGS_MUTATION, {
      onCompleted: data => {
         if (containerRef == null) return;
         successFlash(containerRef);
      }
   });

   const handleKeyDown = async e => {
      if (e.key === 'Enter') {
         if (highlightedIndex > -1) {
            // If we've navigated to one of the results in our list
            const filteredResults = filterResults(searchData.searchTaxes);
            if (taxInput.includes(',')) {
               // If we entered multiple tags (commas separate tags, so if there's a comma that means there's multiple tags) we have to make sure to send the ones before the comma as well as whichever result we've selected
               const finalCommaLocation = taxInput.lastIndexOf(',');
               const preCommaInput = taxInput.substring(0, finalCommaLocation);
               await sendNewTax([
                  { title: preCommaInput },
                  filteredResults[highlightedIndex]
               ]).catch(err => {
                  alert(err.message);
               });
            } else {
               // Whether there are multiple tags or not, we send the tag that was chosen from the list
               await sendNewTax(filteredResults[highlightedIndex]).catch(
                  err => {
                     alert(err.message);
                  }
               );
            }
         } else {
            // Otherwise we just send what's in the input
            await sendNewTax({ title: taxInput }).catch(err => {
               alert(err.message);
            });
         }
      }
   };

   const sendNewTax = async newTaxObj => {
      if (newTaxObj == null) {
         setTaxInput('');
         return;
      }

      let title;
      if (Array.isArray(newTaxObj)) {
         title = '';
         newTaxObj.forEach((taxObj, index) => {
            if (index === newTaxObj.length + 1) {
               title += taxObj.title;
            }
            title += `${taxObj.title}, `;
         });
      } else {
         title = newTaxObj.title;
      }

      const newTags = JSON.parse(JSON.stringify(tags));
      // const newStacks = JSON.parse(JSON.stringify(stacks));
      // If the title has a comma in it, we have multiple tags here. That doesn't matter for the actual mutation because it'll get parsed properly on the backend, but it will affect our optimistic response
      if (title.includes(',')) {
         const titleArray = title.split(',');
         titleArray.forEach(thisTitle => {
            const objectToAdd = { ...newTaxObj };
            objectToAdd.title = thisTitle.trim();
            objectToAdd.__typename = personal ? 'Stack' : 'Tag';
            objectToAdd.id = newTaxObj.id == null ? 'unknownID' : newTaxObj.id;
            objectToAdd.author =
               newTaxObj.author == null ? memberFields : newTaxObj.author;
            // if (personal) {
            // newStacks.push(objectToAdd);
            // } else {
            newTags.push(objectToAdd);
            // }
         });
      } else {
         newTaxObj.__typename = personal ? 'Stack' : 'Tag';
         if (newTaxObj.id == null) {
            newTaxObj.id = 'unknownID';
         }
         // Optimistic response breaks if we don't provide an author for the tag we're creating
         if (newTaxObj.author == null) {
            newTaxObj.author = memberFields;
         }

         // if (personal) {
         // newStacks.push(newTaxObj);
         // } else {
         newTags.push(newTaxObj);
         // }
      }
      window.setTimeout(() => setTaxInput(''), 1); // We need this setTaxInput to hit after the handleTaxInput hits, so we set a timeout

      if (Array.isArray(id)) {
         const responseData = [];
         id.forEach(thingID => {
            const [thisThing] = thingData.filter(
               fullThing => thingID === fullThing.id
            );
            const copiedThing = { ...thisThing };
            // if (personal) {
            // copiedThing.partOfStacks = newStacks;
            // } else {
            copiedThing.partOfTags = newTags;
            // }
            responseData.push(copiedThing);
         });

         await addTaxesToThings({
            variables: {
               taxes: title,
               thingIDs: id,
               personal
            },
            optimisticResponse: {
               __typename: 'Mutation',
               addTaxesToThings: responseData
            }
         }).catch(err => {
            alert(err.message);
         });
      } else {
         const responseData = {
            __typename: 'Thing',
            id
         };
         // if (personal) {
         // responseData.partOfStacks = newStacks;
         // } else {
         responseData.partOfTags = newTags;
         // }
         await addTaxToThing({
            variables: {
               tax: title,
               thingID: id,
               personal
            },
            optimisticResponse: {
               __typename: 'Mutation',
               addTaxToThing: responseData
            }
         }).catch(err => {
            alert(err.message);
         });
      }
   };

   let placeholder = 'add tag';
   if (Array.isArray(id)) {
      placeholder += ' To All Things';
   }

   const resizeInput = e => {
      e.target.style.width = `${e.target.value.length + 1}ch`;
   };

   return (
      <StyledTaxInput className="taxboxContainer">
         <form {...getComboboxProps()}>
            <input
               {...getInputProps({
                  type: 'text',
                  id: personal ? 'addStack' : 'addTag',
                  name: personal ? 'addStack' : 'addTag',
                  placeholder,
                  value: taxInput,
                  className: `addTax`,
                  onKeyDown: e => {
                     e.persist();
                     handleKeyDown(e);
                  },
                  onKeyUp: e => {
                     e.persist();
                     resizeInput(e);
                  }
               })}
            />
         </form>
         {(searchData || searchLoading) &&
            taxInput !== '' &&
            taxInput.length > 0 &&
            isOpen && <div className="resultsContainer">{searchResults}</div>}
      </StyledTaxInput>
   );
};
export default TaxInput;
