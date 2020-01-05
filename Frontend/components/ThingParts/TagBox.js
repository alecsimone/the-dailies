import { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { debounce } from 'debounce';
import { useCombobox } from 'downshift';
import { ThingContext } from '../../pages/thing';
import { makeTransparent } from '../../styles/functions';

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

const StyledTagBox = styled.section`
   h5 {
      display: inline-block;
      font-weight: 500;
      font-size: ${props => props.theme.bigText};
      color: ${props => props.theme.primaryAccent};
      margin-right: 0.5rem;
   }
   span {
      margin-right: 0.25rem;
   }
   a {
      font-size: ${props => props.theme.bigText};
      font-weight: 300;
   }
   .tagboxContainer {
      display: inline-block;
      margin-left: 1rem;
      position: relative;
      .resultsContainer {
         position: absolute;
         /* The container must be positioned down 1em for the font size, 2 * .25rem for the padding on the input, and then 1px for the border */
         top: calc(1em + 2 * 0.25rem + 1px);
         left: 0;
         width: 100%;
         font-size: ${props => props.theme.bigText};
         border: 1px solid
            ${props => makeTransparent(props.theme.highContrastGrey, 0.4)};
         border-top: none;
         .searchResult {
            padding: 0.25rem 1rem;
            &.loading,
            &.empty {
               color: ${props => makeTransparent(props.theme.mainText, 0.6)};
            }
         }
      }
   }
   input {
      font-size: ${props => props.theme.bigText};
      line-height: 1;
      border-radius: 0;
      &.loading {
         background: ${props => props.theme.lowContrastGrey};
      }
   }
`;

const TagBox = () => {
   const { id, partOfTags: tags } = useContext(ThingContext);
   const tagElements = tags.map((tag, index) => {
      if (index < tags.length - 1)
         return (
            <span key={tag.id}>
               <Link href={{ pathname: '/tag', query: { title: tag.title } }}>
                  <a>{tag.title}</a>
               </Link>
               ,{' '}
            </span>
         );
      return (
         <Link
            href={{ pathname: '/tag', query: { title: tag.title } }}
            key={tag.id}
         >
            <a key={tag.id}>{tag.title}</a>
         </Link>
      );
   });

   const [addTagToThing, { loading: addTagLoading }] = useMutation(
      ADD_TAG_MUTATION
   );
   const [tagInput, setTagInput] = useState('');

   const sendNewTag = async e => {
      e.preventDefault();
      setTagInput('');
      await addTagToThing({
         variables: {
            tag: tagInput,
            thingID: id
         }
      });
   };

   const [
      searchTags,
      { loading: searchLoading, data: searchData }
   ] = useLazyQuery(SEARCH_TAGS_QUERY);

   const handleTagInput = e => {
      setTagInput(e.target.value);
      generateAutocomplete(e);
   };

   const generateAutocomplete = debounce(async e => {
      console.log(e.target);
      setTagInput(e.target.value);
      if (e.target.value === '') {
         return;
      }
      await searchTags({
         variables: {
            searchTerm: e.target.value
         }
      });
   }, 250);

   // const {
   //    isOpen,
   //    selectedItem,
   //    getInputProps,
   //    getComboboxProps,
   //    highlightedIndex,
   //    getItemProps
   // } = useCombobox({
   //    items: searchData.searchTags,
   //    onInputValueChange: ({ inputValue }) => {
   //       console.log(inputValue);
   //    }
   // });

   let searchResults;
   if (searchLoading) {
      searchResults = <div className="searchResult loading">Loading...</div>;
   }
   if (searchData) {
      console.log(searchData);
      if (searchData.searchTags.length === 0) {
         searchResults = (
            <div className="searchResult empty">No Results For {tagInput}</div>
         );
      } else {
         searchResults = searchData.searchTags.map((result, index) => (
            <div className="searchResult" key={index}>
               {result.title}
            </div>
         ));
      }
   }

   return (
      <StyledTagBox>
         <h5>Tags:</h5> {tagElements}
         <div className="tagboxContainer">
            <form onSubmit={sendNewTag}>
               <input
                  type="text"
                  id="addTag"
                  name="addTag"
                  placeholder="+ Add Tag"
                  value={tagInput}
                  onChange={e => {
                     e.persist();
                     handleTagInput(e);
                  }}
                  disabled={addTagLoading}
                  className={`addTag ${addTagLoading ? 'loading' : 'ready'}`}
                  required
               />
            </form>
            {(searchData || searchLoading) && tagInput !== '' && (
               <div className="resultsContainer">{searchResults}</div>
            )}
         </div>
      </StyledTagBox>
   );
};

export default TagBox;
