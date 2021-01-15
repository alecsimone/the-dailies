import React, { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import { useCombobox } from 'downshift';
import Taxes from './Taxes';
import { ThingContext } from '../../pages/thing';
import { setAlpha } from '../../styles/functions';
import { MemberContext } from '../Account/MemberProvider';

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

const StyledTaxBox = styled.section`
   position: relative;
   max-width: 100%;
   padding: 0 1rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
   }
   .taxboxContainer {
      display: inline-block;
      position: relative;
      margin-top: 0.8rem;
      z-index: 9;
      input {
         width: 30rem;
         position: relative;
         font-size: ${props => props.theme.smallText};
         line-height: 1;
         border-radius: 0;
      }
      .resultsContainer {
         position: absolute;
         z-index: 2;
         top: 3rem;
         left: 0;
         width: 100%;
         font-size: ${props => props.theme.smallText};
         background: ${props => props.theme.midBlack};
         border: 3px solid
            ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
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

const TaxBox = ({ canEdit, personal }) => {
   // First we pull our tags out of context. A quick note here, for the other kind of context: Originally, I had two kinds of taxonomies: tags and stacks.
   // Tags were public, and anyone could add to them, stacks were personal and only you could add to them. So this component was designed to be generic to work for either kind. I've since gotten rid of stacks, so that's why that genericness seems unnecessary. But I always feel like I might add them back, or some other kind of taxonomy, so I'm not refactoring this component to not be generic.
   const { id, partOfTags: tags, partOfStacks: stacks } = useContext(
      ThingContext
   );
   const { me } = useContext(MemberContext);

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

   const handleTaxInput = async inputValue => {
      // Our onChange handler. Updates the value of the input and generates the search results (the auto complete), which is debounced
      setTaxInput(inputValue);
      debouncedAutocomplete(generateAutocomplete, inputValue);
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

   const handleKeyDown = async e => {
      if (e.key === 'Enter') {
         if (highlightedIndex > -1) {
            // If we've navigated to one of the results in our list
            const filteredResults = filterResults(searchData.searchTaxes);
            if (taxInput.includes(',')) {
               // If we entered multiple tags (commas separate tags, so if there's a comma that means there's multiple tags) we have to make sure to send the ones before the comma as well as whichever result we've selected
               const finalCommaLocation = taxInput.lastIndexOf(',');
               const preCommaInput = taxInput.substring(0, finalCommaLocation);
               await sendNewTax({ title: preCommaInput }).catch(err => {
                  alert(err.message);
               });
            }
            // Whether there are multiple tags or not, we send the tag that was chosen from the list
            await sendNewTax(filteredResults[highlightedIndex]).catch(err => {
               alert(err.message);
            });
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
      const { title } = newTaxObj;

      newTaxObj.__typename = personal ? 'Stack' : 'Tag';
      if (newTaxObj.id == null) {
         newTaxObj.id = 'unknownID';
      }
      // Optimistic response breaks if we don't provide an author for the tag we're creating
      if (newTaxObj.author == null) {
         newTaxObj.author = me;
      }
      let newTags = tags;
      let newStacks = stacks;

      if (personal) {
         newStacks = stacks.concat([newTaxObj]);
      } else {
         newTags = tags.concat([newTaxObj]);
      }

      window.setTimeout(() => setTaxInput(''), 1); // We need this setTaxInput to hit after the handleTaxInput hits, so we set a timeout
      await addTaxToThing({
         variables: {
            tax: title,
            thingID: id,
            personal
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addTaxToThing: {
               __typename: 'Thing',
               id,
               partOfTags: newTags,
               partOfStacks: newStacks
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   return (
      <StyledTaxBox className={personal ? 'stacks' : 'tags'}>
         <Taxes tags={tags} stacks={stacks} personal={personal} thingID={id} />
         {canEdit && (
            <div className="taxboxContainer">
               <form {...getComboboxProps()}>
                  <input
                     {...getInputProps({
                        type: 'text',
                        id: personal ? 'addStack' : 'addTag',
                        name: personal ? 'addStack' : 'addTag',
                        placeholder: personal ? '+ Add Stack' : '+ Add Tag',
                        value: taxInput,
                        className: `addTax`,
                        onKeyDown: e => {
                           e.persist();
                           handleKeyDown(e);
                        }
                     })}
                  />
               </form>
               {(searchData || searchLoading) &&
                  taxInput !== '' &&
                  taxInput.length > 0 &&
                  isOpen && (
                     <div className="resultsContainer">{searchResults}</div>
                  )}
            </div>
         )}
      </StyledTaxBox>
   );
};
TaxBox.propTypes = {
   canEdit: PropTypes.bool,
   personal: PropTypes.bool.isRequired
};

export default TaxBox;
