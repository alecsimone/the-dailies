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
         }
         partOfStacks {
            __typename
            id
            title
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
   max-width: 100%;
   /* &.tags {
      margin: 5rem 0 1rem;
   }
   &.stacks {
      margin: 1rem 0 5rem;
   } */
   padding: 0 1rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
   }
   .taxboxContainer {
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

const TaxBox = ({ canEdit, personal }) => {
   const { id, partOfTags: tags, partOfStacks: stacks } = useContext(
      ThingContext
   );
   const [taxInput, setTaxInput] = useState('');

   const [
      searchTaxes,
      { loading: searchLoading, data: searchData }
   ] = useLazyQuery(SEARCH_TAX_QUERY);

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
      await searchTaxes({
         variables: {
            searchTerm,
            personal
         }
      });
   };

   const handleTaxInput = async inputValue => {
      setTaxInput(inputValue);
      debouncedAutocomplete(generateAutocomplete, inputValue);
   };

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
      const filteredResults = filterResults(searchData.searchTaxes);
      if (filteredResults.length === 0) {
         searchResults = (
            <div className="searchResult empty">No Results For {taxInput}</div>
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

   const [addTaxToThing, { loading: addTaxLoading }] = useMutation(
      ADD_TAX_MUTATION
   );

   const handleKeyDown = async e => {
      if (e.key === 'Enter') {
         if (highlightedIndex > -1) {
            const filteredResults = filterResults(searchData.searchTaxes);
            if (taxInput.includes(',')) {
               const finalCommaLocation = taxInput.lastIndexOf(',');
               const preCommaInput = taxInput.substring(0, finalCommaLocation);
               await sendNewTax({ title: preCommaInput });
            }
            await sendNewTax(filteredResults[highlightedIndex]);
         } else {
            await sendNewTax({ title: taxInput });
         }
      }
   };

   const sendNewTax = async newTaxObj => {
      if (newTaxObj == null) {
         setTaxInput('');
         return;
      }
      const { title } = newTaxObj;
      await addTaxToThing({
         variables: {
            tax: title,
            thingID: id,
            personal
         }
      });
      setTaxInput('');
   };

   return (
      <StyledTaxBox className={personal ? 'stacks' : 'tags'}>
         <Taxes taxes={personal ? stacks : tags} personal={personal} />
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
                        disabled: addTaxLoading,
                        className: `addTax ${
                           addTaxLoading ? 'loading' : 'ready'
                        }`,
                        onKeyDown: e => {
                           e.persist();
                           handleKeyDown(e);
                        }
                     })}
                  />
               </form>
               {(searchData || searchLoading) && taxInput !== '' && isOpen && (
                  <div className="resultsContainer">{searchResults}</div>
               )}
            </div>
         )}
      </StyledTaxBox>
   );
};
TaxBox.propTypes = {
   canEdit: PropTypes.bool
};

export default TaxBox;