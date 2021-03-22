import { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import Router from 'next/router';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import { setLightness, setAlpha } from '../../styles/functions';
import AuthorLink from './AuthorLink';
import ColorSelector from './ColorSelector';
import PrivacyDropdown from './PrivacyDropdown';
import TrashIcon from '../Icons/Trash';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import TimeAgo from '../TimeAgo';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import { useSearchResultsSelector } from '../../lib/RichTextHandling';
import { PUBLIC_THINGS_QUERY } from '../Archives/PublicThings';
import ArrowIcon from '../Icons/Arrow';
import { smallThingCardFields } from '../../lib/CardInterfaces';

const DELETE_THING_MUTATION = gql`
   mutation DELETE_THING_MUTATION($id: ID!) {
      deleteThing(id: $id) {
         ${smallThingCardFields}
      }
   }
`;

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

const ADD_VIEWER_TO_THING_MUTATION = gql`
   mutation ADD_VIEWER_TO_THING_MUTATION($thingID: ID!, $memberID: ID!) {
      addViewerToThing(thingID: $thingID, memberID: $memberID) {
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
`;

const REMOVE_VIEWER_FROM_THING_MUTATION = gql`
   mutation REMOVE_VIEWER_FROM_THING_MUTATION($thingID: ID!, $memberID: ID!) {
      removeViewerFromThing(thingID: $thingID, memberID: $memberID) {
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
`;

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   align-items: center;
   flex-wrap: wrap;
   padding: 2rem 1rem 0;
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
         ${props => props.theme.mobileBreakpoint} {
            justify-content: center;
         }
         align-items: center;
         flex-grow: 0;
         max-width: 100%;
         position: relative;
         span.uneditable {
            margin-left: 3rem;
         }
         span.addedViewersCount {
            margin-left: 1rem;
         }
         &.editable {
            cursor: pointer;
         }
         > * {
            ${props => props.theme.mobileBreakpoint} {
               margin: 0;
            }
         }
         &.editing {
            svg.collapseButton {
               width: ${props => props.theme.smallHead};
               height: ${props => props.theme.smallHead};
               rect {
                  fill: ${props => props.theme.lowContrastGrey};
               }
               &.smallScreen {
                  margin: auto;
                  display: block;
                  ${props => props.theme.mobileBreakpoint} {
                     display: none;
                  }
               }
               &.bigScreen {
                  display: none;
                  ${props => props.theme.mobileBreakpoint} {
                     display: block;
                  }
               }
            }
            > * {
               width: 100%;
               margin: 2rem 0;
               ${props => props.theme.mobileBreakpoint} {
                  width: auto;
                  margin: 0;
                  margin-left: 2rem;
               }
            }
            .colorSelector {
               margin-left: 0;
            }
            .privacySelectorWrapper {
               position: relative;
               display: flex;
               align-items: center;
               justify-content: space-between;
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
         .addedMembersCounter {
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
            cursor: pointer;
            margin-left: 1rem;
            svg.x {
               transform: rotate(45deg);
               width: calc(
                  ${props => props.theme.smallText} / 1.4
               ); /* because it's rotated, this roughly makes its height equal to its height had we not rotated it */
               height: auto;
               margin-right: 1rem;
               transition: transform 0.25s;
            }
            &.adding {
               svg.x {
                  transform: rotate(0deg);
               }
            }
            .addPeopleInterface {
               position: absolute;
               width: 100%;
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
                  span.title {
                     white-space: nowrap;
                  }
                  input.searchBox {
                     font-size: ${props => props.theme.smallText};
                     width: 0;
                     flex-grow: 1;
                     margin: 0 1rem;
                  }
               }
               .memberSearchResult {
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
      flex-grow: 1;
      margin-left: 0;
      margin-right: 3rem;
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
         .authorImg {
            width: 3rem;
            height: 3rem;
            border-radius: 100%;
            margin-right: 1rem;
            ${props => props.theme.midScreenBreakpoint} {
               margin-top: 6px;
            }
         }
      }
      a,
      a:visited {
         line-height: 1;
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

const debouncedMemberSearch = debounce(
   (memberSearch, searchTerm) => memberSearch(searchTerm),
   200,
   true
);

const ThingMeta = ({ canEdit }) => {
   const { me } = useContext(MemberContext);
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
         ],
         onError: err => alert(err.message)
      }
   );

   const [searchMembers, { loading: searchLoading }] = useLazyQuery(
      SEARCH_MEMBERS_QUERY,
      {
         onCompleted: data => {
            const filteredData = data.searchMembers.filter(member => {
               if (member.id === me.id) return false;
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

   const [addViewerToThing] = useMutation(ADD_VIEWER_TO_THING_MUTATION, {
      onCompleted: data => {
         if (
            data &&
            data.addViewerToThing &&
            data.addViewerToThing.__typename === 'Thing'
         ) {
            toast(`${addedMemberRef.current} can now view this Thing`, {
               position: 'bottom-center',
               autoClose: 3000
            });
         }
      },
      onError: err => alert(err.message)
   });

   const [removeViewerFromThing] = useMutation(
      REMOVE_VIEWER_FROM_THING_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const closeResults = () => {
      setPeopleSearchTerm('');

      resetResultsSelector();

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

      const selectedMember = searchResultsRef.current[index];
      addViewerToThing({
         variables: {
            memberID: selectedMember.id,
            thingID: id
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
      memberSearchResultElements = <div>Searching members...</div>;
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
               {individualViewPermissions.length > 0 && (
                  <span className="addedViewersCount">
                     +{individualViewPermissions.length}
                  </span>
               )}
            </div>
         )}
         {editing && (
            <div className="selections metaPiece editing">
               <ArrowIcon
                  pointing="right"
                  className="collapseButton bigScreen"
                  onClick={() => setEditing(false)}
               />
               {canEdit && (
                  <ColorSelector initialColor={color} type="Thing" id={id} />
               )}
               <div className="privacySelectorWrapper">
                  {canEdit ? (
                     <PrivacyDropdown initialPrivacy={privacy} id={id} />
                  ) : (
                     <span className="uneditable">{privacy}</span>
                  )}
                  {privacy !== 'Public' &&
                     individualViewPermissions &&
                     individualViewPermissions.length > 0 && (
                        <div
                           className="addedMembersCounter"
                           onClick={e => {
                              if (
                                 e.target.closest('.extraViewersContainer') ==
                                 null
                              ) {
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
                        className={`addPeopleContainer${
                           addingPeople ? ' adding' : ''
                        }`}
                        onClick={e => {
                           if (
                              e.target.closest('.addPeopleInterface') == null
                           ) {
                              setAddingPeople(!addingPeople);
                              if (!addingPeople) {
                                 setShowingExtraViewers(false);
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
                                 <span className="title">Add Members: </span>
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
                                 memberSearchResultElements}
                           </div>
                        )}
                     </div>
                  )}
               </div>
               <ArrowIcon
                  pointing="up"
                  className="collapseButton smallScreen"
                  onClick={() => setEditing(false)}
               />
            </div>
         )}
      </StyledThingMeta>
   );
};
ThingMeta.propTypes = {
   canEdit: PropTypes.bool
};

export default ThingMeta;
