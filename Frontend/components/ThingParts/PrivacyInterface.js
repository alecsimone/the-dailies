import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { debounce } from 'lodash';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useSearchResultsSelector } from '../../lib/RichTextHandling';
import { setAlpha } from '../../styles/functions';
import useMe from '../Account/useMe';
import X from '../Icons/X';
import PrivacyDropdown from './PrivacyDropdown';

const SEARCH_MEMBERS_QUERY = gql`
   query SEARCH_MEMBERS_QUERY($string: String!) {
      searchMembers(string: $string) {
         __typename
         id
         displayName
         avatar
      }
   }
`;
export { SEARCH_MEMBERS_QUERY };

const ADD_VIEWER_TO_STUFF_MUTATION = gql`
   mutation ADD_VIEWER_TO_STUFF_MUTATION(
      $stuffID: ID!
      $memberID: ID!
      $type: String
   ) {
      addViewerToStuff(stuffID: $stuffID, memberID: $memberID, type: $type) {
         ... on Thing {
            __typename
            id
            individualViewPermissions {
               __typename
               id
               displayName
               avatar
            }
         }
         ... on ContentPiece {
            __typename
            id
            individualViewPermissions {
               __typename
               id
               displayName
               avatar
            }
         }
      }
   }
`;

const REMOVE_VIEWER_FROM_STUFF_MUTATION = gql`
   mutation REMOVE_VIEWER_FROM_STUFF_MUTATION(
      $stuffID: ID!
      $memberID: ID!
      $type: String
   ) {
      removeViewerFromStuff(
         stuffID: $stuffID
         memberID: $memberID
         type: $type
      ) {
         ... on ContentPiece {
            __typename
            id
            individualViewPermissions {
               __typename
               id
               displayName
               avatar
            }
         }
         ... on Thing {
            __typename
            id
            individualViewPermissions {
               __typename
               id
               displayName
               avatar
            }
         }
      }
   }
`;

const usePrivacyInterfaceData = (thingID, type) => {
   const privacyInterfaceData = {};
   privacyInterfaceData.privacy = useSelector(
      state => state.stuff[`${type}:${thingID}`].privacy
   );

   const parentPrivacy = useSelector(state => {
      if (type === 'ContentPiece') {
         return state.stuff[`ContentPiece:${thingID}`].onThing.privacy;
      }
      return null;
   });

   if (privacyInterfaceData.privacy == null && parentPrivacy != null) {
      privacyInterfaceData.privacy = parentPrivacy;
   }

   privacyInterfaceData.individualViewPermissions = useSelector(
      state => state.stuff[`${type}:${thingID}`].individualViewPermissions
   );
   return privacyInterfaceData;
};

const StyledPrivacyInterface = styled.div`
   display: flex;
   justify-content: center;
   align-items: flex-start;
   &.Public {
      justify-content: flex-start;
   }
   svg {
      width: ${props => props.theme.smallText};
      cursor: pointer;
   }
   .addedMembersCounter {
      margin-left: 1rem;
      cursor: pointer;
      .extraViewersContainer {
         width: 30rem;
         .extraViewer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 1rem;
            background: ${props => props.theme.midBlack};
            &:hover {
               background: ${props => props.theme.deepBlack};
            }
            border-bottom: 2px solid
               ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
            cursor: pointer;
         }
      }
   }
   .addPeopleContainer {
      flex-grow: 1;
      display: flex;
      align-items: flex-start;
      svg.x {
         transform: rotate(45deg);
         transition: transform 0.25s;
      }
      &.adding {
         svg.x {
            transform: rotate(0deg);
         }
      }
      .plusWrapper {
         margin: 0.66rem 1rem 0 2rem;
         line-height: 0;
      }
      .addPeopleInterface {
         flex-grow: 1;
         border-radius: 2px;
         padding: 2px;
         &.peopleToAdd {
            border: 2px solid
               ${props => setAlpha(props.theme.lowContrastGrey, 0.8)};
            padding: 0;
         }
         .topline {
            padding: 0 1rem;
            display: flex;
            align-items: center;
            background: ${props => props.theme.lightBlack};
            input.searchBox {
               font-size: ${props => props.theme.bigText};
               width: 0;
               flex-grow: 1;
               margin: 0 1rem;
               &:focus {
                  outline: none;
               }
            }
         }
         .memberSearchResultsBox {
            margin-top: 1rem;
            .memberSearchResult {
               padding: 0.5rem 1rem;
               background: ${props => props.theme.midBlack};
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

const PrivacyInterface = ({ canEdit, id, type }) => {
   const { privacy, individualViewPermissions } = usePrivacyInterfaceData(
      id,
      type
   );
   const { loggedInUserID } = useMe();

   const [addingPeople, setAddingPeople] = useState(false);
   const [peopleSearchTerm, setPeopleSearchTerm] = useState('');
   const [showingExtraViewers, setShowingExtraViewers] = useState(false);

   const addedMemberRef = useRef('');

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
               let hasViewPermission = false;
               individualViewPermissions.forEach(individualViewer => {
                  if (individualViewer.id === member.id) {
                     hasViewPermission = true;
                  }
               });
               return !hasViewPermission;
            });
            const trimmedData = filteredData.slice(0, 10);
            setMemberSearchResults(trimmedData);
            searchResultsRef.current = trimmedData;
         }
      }
   );

   const [addViewerToStuff] = useMutation(ADD_VIEWER_TO_STUFF_MUTATION, {
      onCompleted: data => {
         if (
            data &&
            data.addViewerToStuff &&
            (data.addViewerToStuff.__typename === 'Thing' ||
               data.addViewerToStuff.__typename === 'ContentPiece')
         ) {
            toast(`${addedMemberRef.current} can now view this ${type}`, {
               position: 'bottom-center',
               autoClose: 3000
            });
         }
      },
      onError: err => alert(err.message)
   });

   const [removeViewerFromStuff] = useMutation(
      REMOVE_VIEWER_FROM_STUFF_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const closeResults = () => {
      setPeopleSearchTerm('');
      resetResultsSelector();
      setAddingPeople(false);
   };

   const chooseResult = selectedIndex => {
      let index = selectedIndex;
      if (selectedIndex == null) {
         // If we click on a result, we pass the index when we call the function. If we select it with the keyboard, we don't, but we can get it from the highlightedIndexRef
         index = highlightedIndexRef.current;
      }

      const selectedMember = searchResultsRef.current[index];
      addViewerToStuff({
         variables: {
            memberID: selectedMember.id,
            stuffID: id,
            type
         }
      });
      addedMemberRef.current = selectedMember.displayName;
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

   if (!canEdit) return null;

   const memberSearch = searchTerm => {
      const searchResults = searchMembers({
         variables: {
            string: searchTerm
         }
      });
   };

   const handleKeyUp = e => {
      if (e.key === 'Escape') closeResults();
      if (e.key === 'Enter' || e.key === 'Tab') return;
      if (peopleSearchTerm === '') return;

      debouncedMemberSearch(memberSearch, peopleSearchTerm);
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

   let extraViewersElements;
   if (individualViewPermissions != null) {
      const extraViewersList = individualViewPermissions.map(viewer => (
         <div className="extraViewer" key={viewer.id}>
            <span className="viewerName">{viewer.displayName}</span>
            <X
               onClick={() => {
                  const newIndividualViewersList = individualViewPermissions.filter(
                     individualViewer => individualViewer.id !== viewer.id
                  );
                  // const optimisticResponse = {
                  //    removeViewerFromThing: {
                  //       ...fullThingData,
                  //       individualViewPermissions: newIndividualViewersList
                  //    }
                  // };
                  removeViewerFromStuff({
                     variables: {
                        memberID: viewer.id,
                        stuffID: id,
                        type
                     }
                  });
                  if (newIndividualViewersList.length === 0) {
                     setShowingExtraViewers(false);
                  }
               }}
            />
         </div>
      ));
      extraViewersElements = (
         <div className="extraViewersContainer">{extraViewersList}</div>
      );
   }

   return (
      <StyledPrivacyInterface className={`privacyInterface ${privacy}`}>
         <PrivacyDropdown initialPrivacy={privacy} id={id} type={type} />
         {privacy !== 'Public' &&
            individualViewPermissions &&
            individualViewPermissions.length > 0 && (
               <div
                  className="addedMembersCounter"
                  onClick={e => {
                     if (e.target.closest('.extraViewersContainer') == null) {
                        setShowingExtraViewers(!showingExtraViewers);
                        if (!showingExtraViewers) {
                           setAddingPeople(false);
                        }
                     }
                  }}
               >
                  +{individualViewPermissions.length} Other
                  {individualViewPermissions.length > 1 ? 's' : ''}
                  {showingExtraViewers && extraViewersElements}
               </div>
            )}
         {privacy !== 'Public' && (
            <div
               className={`addPeopleContainer${addingPeople ? ' adding' : ''}`}
               onClick={e => {
                  if (e.target.closest('.addPeopleInterface') == null) {
                     setAddingPeople(!addingPeople);
                     if (!addingPeople) {
                        setShowingExtraViewers(false);
                        window.setTimeout(() => {
                           const thisBox = document.querySelector(
                              '#addPeopleInterface'
                           );
                           if (thisBox != null) {
                              thisBox.addEventListener(
                                 'keydown',
                                 navigateResultsRef.current
                              );

                              const thisInput = thisBox.querySelector(
                                 'input.searchBox'
                              );
                              thisInput.focus();
                           }
                        }, 1);
                     }
                  }
               }}
            >
               <div className="plusWrapper">
                  <X color="lowContrastGrey" rotation={45} />
               </div>
               {addingPeople && (
                  <div
                     className={
                        peopleSearchTerm.length > 0
                           ? 'addPeopleInterface peopleToAdd'
                           : 'addPeopleInterface'
                     }
                     id="addPeopleInterface"
                  >
                     <div className="topline">
                        {' '}
                        <span className="title">Add Members: </span>
                        <input
                           className="searchBox"
                           value={peopleSearchTerm}
                           onChange={e => setPeopleSearchTerm(e.target.value)}
                           onKeyUp={e => handleKeyUp(e)}
                        />
                     </div>
                     {peopleSearchTerm.length > 0 && (
                        <div className="memberSearchResultsBox">
                           {memberSearchResultElements}
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </StyledPrivacyInterface>
   );
};

export default React.memo(PrivacyInterface);
