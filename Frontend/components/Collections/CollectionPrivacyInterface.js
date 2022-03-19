import styled from 'styled-components';
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import useMe from '../Account/useMe';
import { GET_PRIVACY_OPTIONS_QUERY } from '../ThingParts/PrivacyDropdown';
import MetaOption from '../ThingParts/MetaOption';
import { SEARCH_MEMBERS_QUERY } from '../ThingParts/PrivacyInterface';
import { useSearchResultsSelector } from '../../lib/RichTextHandling';
import X from '../Icons/X';

const SET_COLLECTION_PRIVACY = gql`
   mutation SET_COLLECTION_PRIVACY(
      $collectionID: ID!
      $privacy: PrivacySetting!
   ) {
      setCollectionPrivacy(collectionID: $collectionID, privacy: $privacy) {
         __typename
         id
         privacy
      }
   }
`;

const ADD_INDIVIDUAL_PERMISSION_TO_COLLECTION = gql`
   mutation ADD_INDIVIDUAL_PERMISSION_TO_COLLECTION(
      $collectionID: ID!
      $memberID: ID!
      $permissionType: String!
   ) {
      addIndividualPermissionToCollection(
         collectionID: $collectionID
         memberID: $memberID
         permissionType: $permissionType
      ) {
         __typename
         id
         viewers {
            __typename
            id
         }
         editors {
            __typename
            id
         }
      }
   }
`;

const REMOVE_INDIVIDUAL_PERMISSION_FROM_COLLECTION = gql`
   mutation REMOVE_INDIVIDUAL_PERMISSION_FROM_COLLECTION(
      $collectionID: ID!
      $memberID: ID!
      $permissionType: String!
   ) {
      removeIndividualPermissionFromCollection(
         collectionID: $collectionID
         memberID: $memberID
         permissionType: $permissionType
      ) {
         __typename
         id
         viewers {
            __typename
            id
         }
         editors {
            __typename
            id
         }
      }
   }
`;

const debouncedMemberSearch = debounce(
   (memberSearch, searchTerm) => memberSearch(searchTerm),
   200,
   {
      leading: false,
      trailing: true
   }
);

const CollectionPrivacyInterface = ({
   collectionID,
   initialPrivacy,
   viewers,
   editors
}) => {
   const { loggedInUserID } = useMe();

   const [viewersInput, setViewersInput] = useState('');
   const [editorsInput, setEditorsInput] = useState('');
   const [activeSearchElement, setActiveSearchElement] = useState(null);
   const activeSearchElementRef = useRef(activeSearchElement);

   const [showingExtraViewers, setShowingExtraViewers] = useState(false);
   const [showingExtraEditors, setShowingExtraEditors] = useState(false);

   const viewersRef = useRef(viewers);
   const editorsRef = useRef(editors);

   let privacyOptions;
   const {
      loading: privacyOptionsLoading,
      error: privacyOptionsError,
      data: privacyOptionsData
   } = useQuery(GET_PRIVACY_OPTIONS_QUERY);

   const {
      postSearchResults: memberSearchResults,
      setPostSearchResults: setMemberSearchResults,
      highlightedIndex,
      setHighlightedIndex,
      searchResultsRef,
      highlightedIndexRef,
      resetResultsSelector
   } = useSearchResultsSelector();

   const [searchMembers, { loading: searchLoading }] = useLazyQuery(
      SEARCH_MEMBERS_QUERY,
      {
         onCompleted: data => {
            const filteredData = data.searchMembers.filter(member => {
               if (member.id === loggedInUserID) return false;
               let hasPermission = false;
               if (activeSearchElement === 'viewers') {
                  viewers.forEach(individualViewer => {
                     if (individualViewer.id === member.id) {
                        hasPermission = true;
                     }
                  });
               } else if (activeSearchElement === 'editors') {
                  editors.forEach(individualEditor => {
                     if (individualEditor.id === member.id) {
                        hasPermission = true;
                     }
                  });
               }
               return !hasPermission;
            });
            const trimmedData = filteredData.slice(0, 10);
            setMemberSearchResults(trimmedData);
            searchResultsRef.current = trimmedData;
         }
      }
   );

   const [setCollectionPrivacy] = useMutation(SET_COLLECTION_PRIVACY, {
      onError: err => alert(err.message)
   });

   const [addIndividualPermissionToCollection] = useMutation(
      ADD_INDIVIDUAL_PERMISSION_TO_COLLECTION,
      {
         onError: err => alert(err.message)
      }
   );

   const [removeIndividualPermissionFromCollection] = useMutation(
      REMOVE_INDIVIDUAL_PERMISSION_FROM_COLLECTION,
      {
         onError: err => alert(err.message)
      }
   );

   if (privacyOptionsLoading) {
      privacyOptions = <MetaOption name={initialPrivacy} />;
   } else {
      privacyOptions = privacyOptionsData.__type.enumValues.map(option => (
         <MetaOption name={option.name} key={option.name} />
      ));
   }

   const selectPrivacy = e => {
      const {
         target: { value }
      } = e;

      setCollectionPrivacy({
         variables: {
            collectionID,
            privacy: value
         },
         optimisticResponse: {
            __typename: 'Mutation',
            setCollectionPrivacy: {
               __typename: 'Collection',
               id: collectionID,
               privacy: value
            }
         }
      });
   };

   const removePermission = (memberID, permissionType) => {
      let newViewers = [...viewersRef.current];
      let newEditors = [...editorsRef.current];

      if (permissionType === 'viewers') {
         newViewers = newViewers.filter(viewer => viewer.id !== memberID);
      } else if (permissionType === 'editors') {
         newEditors = newEditors.filter(editor => editor.id !== memberID);
      }

      removeIndividualPermissionFromCollection({
         variables: {
            collectionID,
            memberID,
            permissionType
         },
         optimisticResponse: {
            __typename: 'Mutation',
            removeIndividualPermissionFromCollection: {
               __typename: 'Collection',
               id: collectionID,
               viewers: newViewers,
               editors: newEditors
            }
         }
      });
      viewersRef.current = newViewers;
      editorsRef.current = newEditors;
   };

   const closeResults = () => {
      if (activeSearchElementRef.current === 'viewers') {
         setViewersInput('');
      } else if (activeSearchElementRef.current === 'editors') {
         setEditorsInput('');
      }
      resetResultsSelector();
   };

   const chooseResult = selectedIndex => {
      let index = selectedIndex;
      if (selectedIndex == null) {
         // If we click on a result, we pass the index when we call the function. If we select it with the keyboard, we don't, but we can get it from the highlightedIndexRef
         index = highlightedIndexRef.current;
      }

      const selectedMember = searchResultsRef.current[index];

      console.log(viewers, editors);
      const newViewers = [...viewersRef.current];
      const newEditors = [...editorsRef.current];
      if (activeSearchElementRef.current === 'viewers') {
         newViewers.push(selectedMember);
      } else if (activeSearchElementRef.current === 'editors') {
         newEditors.push(selectedMember);
      }
      addIndividualPermissionToCollection({
         variables: {
            collectionID,
            memberID: selectedMember.id,
            permissionType: activeSearchElementRef.current
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addIndividualPermissionToCollection: {
               __typename: 'Collection',
               id: collectionID,
               viewers: newViewers,
               editors: newEditors
            }
         }
      });
      closeResults();
      viewersRef.current = newViewers;
      editorsRef.current = newEditors;
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

   const memberSearch = searchTerm => {
      searchMembers({
         variables: {
            string: searchTerm
         }
      });
   };

   const handleKeyUp = e => {
      if (e.key === 'Escape') {
         closeResults();
         return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') return;

      let searchTerm = '';
      if (activeSearchElement === 'viewers') {
         searchTerm = viewersInput;
      } else if (activeSearchElement === 'editors') {
         searchTerm = editorsInput;
      }

      if (searchTerm === '') return;

      debouncedMemberSearch(memberSearch, searchTerm);
   };

   let memberSearchResultElements;
   if (searchLoading) {
      memberSearchResultElements = (
         <div className="memberSearchResult">Searching members...</div>
      );
   } else if (memberSearchResults.length > 0) {
      memberSearchResultElements = memberSearchResults.map((result, index) => (
         <div
            className={
               index === highlightedIndex
                  ? 'memberSearchResult highlighted'
                  : 'memberSearchResult'
            }
            key={index}
            onClick={() => chooseResult(index)}
         >
            {result.displayName}
         </div>
      ));
   } else if (memberSearchResults.length === 0) {
      memberSearchResultElements = (
         <div className="memberSearchResult">No members found</div>
      );
   }

   return (
      <div className="privacyInterface">
         <div className="privacySelectorGroup">
            <span>Privacy</span>
            <select value={initialPrivacy} onChange={selectPrivacy}>
               {privacyOptions}
            </select>
         </div>
         {initialPrivacy !== 'Public' && (
            <>
               <div className="addViewersSection addPeopleBox">
                  <div className="permissionLine viewers">
                     <div className="searchBox">
                        <input
                           type="text"
                           name="viewers"
                           placeholder="Add Viewers"
                           value={viewersInput}
                           onChange={e => setViewersInput(e.target.value)}
                           onFocus={e => {
                              setActiveSearchElement(e.target.name);
                              activeSearchElementRef.current = e.target.name;
                           }}
                           onKeyUp={e => handleKeyUp(e)}
                           onKeyDown={e => navigateResultsRef.current(e)}
                        />
                        {viewersInput.length > 0 && (
                           <div className="searchResults viewers">
                              {memberSearchResultElements}
                           </div>
                        )}
                     </div>
                     {viewers.length > 0 && (
                        <div
                           className="existingCount viewers"
                           onClick={() =>
                              setShowingExtraViewers(!showingExtraViewers)
                           }
                        >
                           See {viewers.length}
                        </div>
                     )}
                  </div>
                  {showingExtraViewers && (
                     <div className="extraPeople viewers">
                        {viewers.map(viewer => (
                           <div className="extraPerson viewer">
                              {viewer.displayName}
                              <X
                                 onClick={() =>
                                    removePermission(viewer.id, 'viewers')
                                 }
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
               <div className="addEditorsSection addPeopleBox">
                  <div className="permissionLine editors">
                     <div className="searchBox">
                        <input
                           type="text"
                           name="editors"
                           placeholder="Add Editors"
                           value={editorsInput}
                           onChange={e => setEditorsInput(e.target.value)}
                           onFocus={e => {
                              setActiveSearchElement(e.target.name);
                              activeSearchElementRef.current = e.target.name;
                           }}
                           onKeyUp={e => handleKeyUp(e)}
                           onKeyDown={e => navigateResultsRef.current(e)}
                        />
                        {editorsInput.length > 0 && (
                           <div className="searchResults editors">
                              {memberSearchResultElements}
                           </div>
                        )}
                     </div>
                     {editors.length > 0 && (
                        <div
                           className="existingCount editors"
                           onClick={() =>
                              setShowingExtraEditors(!showingExtraEditors)
                           }
                        >
                           See {editors.length}
                        </div>
                     )}
                  </div>
                  {showingExtraEditors && (
                     <div className="extraPeople editors">
                        {editors.map(editor => (
                           <div className="extraPerson editor">
                              {editor.displayName}
                              <X
                                 onClick={() =>
                                    removePermission(editor.id, 'editors')
                                 }
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </>
         )}
      </div>
   );
};

export default CollectionPrivacyInterface;
