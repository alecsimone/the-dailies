import { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import Router from 'next/router';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import { ThingContext } from '../../pages/thing';
import { setLightness, setAlpha } from '../../styles/functions';
import { fullThingFields } from '../../lib/CardInterfaces';
import AuthorLink from './AuthorLink';
import ShortLink from './ShortLink';
import ColorSelector from './ColorSelector';
import PrivacyDropdown from './PrivacyDropdown';
import ThingSourceLink from './ThingSourceLink';
import TrashIcon from '../Icons/Trash';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import TimeAgo from '../TimeAgo';
import { ALL_THINGS_QUERY } from '../../pages/index';
import { PUBLIC_THINGS_QUERY } from '../Archives/PublicThings';

const DELETE_THING_MUTATION = gql`
   mutation DELETE_THING_MUTATION($id: ID!) {
      deleteThing(id: $id) {
         __typename
         id
      }
   }
`;

const SEARCH_FRIENDS_QUERY = gql`
   query SEARCH_FRIENDS_QUERY($string: String!) {
      searchFriends(string: $string) {
         __typename
         id
         displayName
         avatar
      }
   }
`;

const ADD_VIEWER_TO_THING_MUTATION = gql`
   mutation ADD_VIEWER_TO_THING_MUTATION($thingID: ID!, $memberID: ID!) {
      addViewerToThing(thingID: $thingID, memberID: $memberID) {
         ${fullThingFields}
      }
   }
`;

const REMOVE_VIEWER_FROM_THING_MUTATION = gql`
   mutation REMOVE_VIEWER_FROM_THING_MUTATION($thingID: ID!, $memberID: ID!) {
      removeViewerFromThing(thingID: $thingID, memberID: $memberID) {
         ${fullThingFields}
      }
   }
`;

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   align-items: center;
   flex-wrap: wrap;
   padding: 0 1rem;
   margin-top: 0rem;
   color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
   ${props => props.theme.mobileBreakpoint} {
      padding-left: 1.25rem;
      margin-top: 1rem;
   }
   .metaPiece {
      margin: 0;
      flex-grow: 1;
      &:first-child {
         margin-top: 0.5rem;
      }
      &.selections {
         display: flex;
         flex-wrap: wrap;
         justify-content: space-between;
         flex-grow: 0;
         max-width: 100%;
         position: relative;
         span.uneditable {
            margin-left: 3rem;
         }
         &.editable {
            cursor: pointer;
         }
         > * {
            margin: 2rem 0;
            ${props => props.theme.mobileBreakpoint} {
               margin: 0;
            }
         }
         &.editing {
            > * {
               margin: 2rem 0;
               ${props => props.theme.mobileBreakpoint} {
                  margin: 0;
                  margin-left: 2rem;
               }
            }
         }
         .colorDisplay {
            position: absolute;
            left: 0.5rem;
            bottom: 0.75rem;
            width: 2rem;
            height: 2rem;
            border-radius: 3px;
            border: 1px solid ${props => props.theme.lowContrastGrey};
         }
         .addedFriendsCounter {
            position: relative;
            cursor: pointer;
            .extraViewersContainer {
               position: absolute;
               width: 30rem;
               height: auto;
               background: ${props => props.theme.lightBlack};
               border: 3px solid
                  ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
               z-index: 2;
               right: 0;
               top: calc(100% + 1rem);
               color: ${props => props.theme.mainText};
               .extraViewer {
                  padding: 0.5rem 1rem;
                  background: ${props => props.theme.deepBlack};
                  &:hover {
                     background: ${props => props.theme.lightBlack};
                  }
                  border-bottom: 2px solid
                     ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  svg.x {
                     width: ${props => props.theme.smallText};
                     opacity: 0.6;
                     &:hover {
                        opacity: 1;
                     }
                  }
               }
            }
         }
         .addPeopleContainer {
            position: relative;
            cursor: pointer;
            margin-left: 1rem;
            svg.x {
               transform: rotate(45deg);
               width: calc(
                  ${props => props.theme.smallText} / 1.4
               ); /* because it's rotated, this roughly makes its height equal to its height had we not rotated it */
               height: auto;
               margin-right: 1rem;
            }
            .addPeopleInterface {
               position: absolute;
               width: 40rem;
               height: auto;
               background: ${props => props.theme.lightBlack};
               border: 3px solid
                  ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
               z-index: 2;
               right: 0;
               top: calc(100% + 1rem);
               color: ${props => props.theme.mainText};
               .topline {
                  padding: 1rem;
                  background: ${props => props.theme.deepBlack};
                  display: flex;
                  cursor: auto;
                  input.searchBox {
                     font-size: ${props => props.theme.smallText};
                     width: 60%;
                     margin: 0 1rem;
                  }
               }
               .friendSearchResult {
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
            }
         }
         svg.editThis {
            width: ${props => props.theme.smallText};
            height: auto;
            margin-left: 1rem;
            cursor: pointer;
            opacity: 0.4;
            &:hover {
               opacity: 0.8;
            }
         }
      }
      ${props => props.theme.mobileBreakpoint} {
         margin: 0;
         &:first-child {
            margin-top: 0;
         }
         &.selections {
            justify-content: space-around;
         }
      }
   }
   select,
   span.uneditable {
      color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
      margin-left: 2rem;
   }
   select {
      border-radius: 0;
      border-top: none;
      border-right: none;
      border-left: none;
      appearance: none;
      padding-right: 30px;
      cursor: pointer;
   }
   .info {
      font-size: ${props => props.theme.smallText};
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      .authorBlock {
         display: inline-flex;
         align-items: center;
         margin-right: 1rem;
         flex-grow: 0;
         cursor: pointer;
         .authorLink {
            margin-bottom: 2px;
         }
         .authorImg {
            width: 3rem;
            height: 3rem;
            border-radius: 100%;
            margin-right: 1rem;
         }
      }
      a.authorLink,
      a.authorLink:visited {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
         &:hover {
            color: ${props => setLightness(props.theme.majorColor, 50)};
         }
      }
   }
   .trash {
      width: 3rem;
      height: 3rem;
      margin: 0 1rem;
      cursor: pointer;
      ${props => props.theme.mobileBreakpoint} {
         opacity: 0.75;
         &:hover {
            opacity: 1;
         }
      }
      &.deleting {
         ${props => props.theme.twist};
      }
   }
   .link {
      font-size: ${props => props.theme.smallText};
      width: 100%;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      a,
      a:visited {
         color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
         margin-left: 0.5rem;
         &:hover {
            color: ${props => setLightness(props.theme.lowContrastGrey, 80)};
            text-decoration: none;
         }
      }
      svg {
         width: ${props => props.theme.smallText};
         height: auto;
         margin-left: 1rem;
         cursor: pointer;
         opacity: 0.4;
         &:hover {
            opacity: 0.8;
         }
      }
      form {
         display: inline-block;
         max-width: 90%;
         overflow: hidden;
         margin-left: 0.5rem;
         input {
            font-size: ${props => props.theme.smallText};
            color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
            padding: 0;
            background: hsla(0, 0%, 100%, 0.1);
            &[aria-disabled='true'] {
               background: hsla(0, 0%, 100%, 0.25);
            }
         }
      }
   }
`;

const debouncedFriendSearch = debounce(
   (friendSearch, searchTerm) => friendSearch(searchTerm),
   200,
   true
);

const ThingMeta = ({ canEdit }) => {
   const fullThingData = useContext(ThingContext);
   const {
      id,
      author,
      color,
      privacy,
      createdAt,
      individualViewPermissions
   } = fullThingData;

   const [editing, setEditing] = useState(false);
   const [addingPeople, setAddingPeople] = useState(false);
   const [peopleSearchTerm, setPeopleSearchTerm] = useState('');
   const [friendSearchResults, setFriendSearchResults] = useState([]);
   const [highlightedIndex, setHighlightedIndex] = useState(-1);
   const [showingExtraViewers, setShowingExtraViewers] = useState(false);

   const searchResultsRef = useRef(friendSearchResults);
   const highlightedIndexRef = useRef(highlightedIndex);
   const addedFriendRef = useRef('');

   const [deleteThing, { loading: deleting }] = useMutation(
      DELETE_THING_MUTATION,
      {
         onCompleted: data => {
            Router.push({
               pathname: '/'
            });
         },
         refetchQueries: [
            { query: ALL_THINGS_QUERY },
            { query: PUBLIC_THINGS_QUERY }
         ]
      }
   );

   const [searchFriends, { loading: searchLoading }] = useLazyQuery(
      SEARCH_FRIENDS_QUERY,
      {
         onCompleted: data => {
            const filteredData = data.searchFriends.filter(friend => {
               let hasViewPermission = false;
               individualViewPermissions.forEach(individualViewer => {
                  if (individualViewer.id === friend.id) {
                     hasViewPermission = true;
                  }
               });
               return !hasViewPermission;
            });
            const trimmedData = filteredData.slice(0, 10);
            setFriendSearchResults(trimmedData);
            searchResultsRef.current = trimmedData;
         }
      }
   );

   const [addViewerToThing] = useMutation(ADD_VIEWER_TO_THING_MUTATION, {
      onCompleted: data => {
         if (
            data &&
            data.addViewerToThing &&
            data.addViewerToThing.__typename === 'Thing'
         ) {
            toast(`${addedFriendRef.current} can now view this Thing`, {
               position: 'bottom-center',
               autoClose: 3000
            });
         }
      }
   });

   const [removeViewerFromThing] = useMutation(
      REMOVE_VIEWER_FROM_THING_MUTATION,
      {
         onCompleted: data => console.log(data)
      }
   );

   const closeResults = () => {
      setPeopleSearchTerm('');
      setFriendSearchResults([]);
      searchResultsRef.current = [];
      setHighlightedIndex(-1);
      highlightedIndexRef.current = -1;

      // const thisBox = document.querySelector(`#addToInterface_${id}`);
      // thisBox.removeEventListener('keydown', navigateResultsRef.current);

      setAddingPeople(false);
   };

   const chooseResult = selectedIndex => {
      let index = selectedIndex;
      if (selectedIndex == null) {
         // If we click on a result, we pass the index when we call the function. If we select it with the keyboard, we don't, but we can get it from the highlightedIndexRef
         index = highlightedIndexRef.current;
      }

      const selectedFriend = searchResultsRef.current[index];
      addViewerToThing({
         variables: {
            memberID: selectedFriend.id,
            thingID: id
         }
      });
      addedFriendRef.current = selectedFriend.displayName;
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

   const friendSearch = searchTerm => {
      const searchResults = searchFriends({
         variables: {
            string: searchTerm
         }
      });
   };

   const handleKeyUp = e => {
      if (e.key === 'Escape') closeResults();
      if (e.key === 'Enter' || e.key === 'Tab') return;
      if (peopleSearchTerm === '') return;

      debouncedFriendSearch(friendSearch, peopleSearchTerm);
   };

   let friendSearchResultElements;
   if (searchLoading) {
      friendSearchResultElements = <div>Searching friends...</div>;
   } else if (friendSearchResults.length > 0) {
      friendSearchResultElements = friendSearchResults.map((result, index) => (
         <div
            className={
               index === highlightedIndex
                  ? 'friendSearchResult highlighted'
                  : 'friendSearchResult'
            }
            key={index}
            onClick={() => chooseResult(index)}
         >
            {result.displayName}
         </div>
      ));
   } else if (friendSearchResults.length === 0) {
      friendSearchResultElements = (
         <div className="friendSearchResult">No friends found</div>
      );
   }

   if (id == null) {
      return (
         <StyledThingMeta>
            <div className="info">Loading...</div>
         </StyledThingMeta>
      );
   }

   const editButton = canEdit ? (
      <EditThis onClick={() => setEditing(!editing)} />
   ) : (
      ''
   );

   const extraViewersList = individualViewPermissions.map(viewer => (
      <div className="extraViewer">
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
               removeViewerFromThing({
                  variables: {
                     memberID: viewer.id,
                     thingID: id
                  }
               });
               if (newIndividualViewersList.length === 0) {
                  setShowingExtraViewers(false);
               }
            }}
         />
      </div>
   ));
   const extraViewersElements = (
      <div className="extraViewersContainer">{extraViewersList}</div>
   );

   return (
      <StyledThingMeta className="thingMeta">
         <div className="info metaPiece">
            {author && <AuthorLink author={author} />}{' '}
            {createdAt && (
               <span className="ago">
                  <TimeAgo time={createdAt} toggleable />
               </span>
            )}
         </div>
         {canEdit && (
            <TrashIcon
               className={deleting ? 'trash deleting' : 'trash'}
               onClick={() => {
                  if (confirm('Are you sure you want to delete this thing?')) {
                     deleteThing({
                        variables: {
                           id
                        }
                     });
                  }
               }}
            />
         )}
         {!editing && (
            <div
               className={`selections metaPiece${canEdit ? ' editable' : ''}`}
               onClick={() => {
                  if (canEdit) setEditing(true);
               }}
            >
               {canEdit && (
                  <div
                     className="colorDisplay uneditable"
                     style={{
                        background: color == null ? 'transparent' : color
                     }}
                  />
               )}
               <span className="uneditable">{privacy}</span>
               {editButton}
            </div>
         )}
         {editing && (
            <div className="selections metaPiece editing">
               {canEdit && (
                  <ColorSelector initialColor={color} type="Thing" id={id} />
               )}
               {canEdit ? (
                  <PrivacyDropdown initialPrivacy={privacy} id={id} />
               ) : (
                  <span className="uneditable">{privacy}</span>
               )}
               {privacy === 'Private' &&
                  individualViewPermissions &&
                  individualViewPermissions.length > 0 && (
                     <div
                        className="addedFriendsCounter"
                        onClick={e => {
                           if (
                              e.target.closest('.extraViewersContainer') == null
                           ) {
                              setShowingExtraViewers(!showingExtraViewers);
                           }
                        }}
                     >
                        +{individualViewPermissions.length} Friend
                        {showingExtraViewers && extraViewersElements}
                     </div>
                  )}
               {privacy === 'Private' && (
                  <div
                     className="addPeopleContainer"
                     onClick={e => {
                        if (e.target.closest('.addPeopleInterface') == null) {
                           setAddingPeople(!addingPeople);
                           if (!addingPeople) {
                              window.setTimeout(() => {
                                 const thisBox = document.querySelector(
                                    '#addPeopleInterface'
                                 );
                                 thisBox.addEventListener(
                                    'keydown',
                                    navigateResultsRef.current
                                 );

                                 const thisInput = thisBox.querySelector(
                                    'input.searchBox'
                                 );
                                 thisInput.focus();
                              }, 1);
                           }
                        }
                     }}
                  >
                     <X color="lowContrastGrey" rotation={45} />
                     {addingPeople && (
                        <div
                           className="addPeopleInterface"
                           id="addPeopleInterface"
                        >
                           <div className="topline">
                              {' '}
                              <span className="title">Add Friends: </span>
                              <input
                                 className="searchBox"
                                 value={peopleSearchTerm}
                                 onChange={e =>
                                    setPeopleSearchTerm(e.target.value)
                                 }
                                 onKeyUp={e => handleKeyUp(e)}
                              />
                           </div>
                           {peopleSearchTerm.length > 0 &&
                              friendSearchResultElements}
                        </div>
                     )}
                  </div>
               )}
               {editButton}
            </div>
         )}
      </StyledThingMeta>
   );
};
ThingMeta.propTypes = {
   canEdit: PropTypes.bool
};

export default ThingMeta;
