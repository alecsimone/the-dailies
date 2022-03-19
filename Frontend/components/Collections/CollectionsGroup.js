import { useEffect, useState, useRef, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { StyledGroup } from './styles';
import CollectionsCard from './CollectionsCard';
import {
   DELETE_GROUP_FROM_COLLECTION_MUTATION,
   HIDE_GROUP_ON_COLLECTION_MUTATION,
   HIDE_TAG_ON_COLLECTION_MUTATION,
   RENAME_GROUP_MUTATION,
   HIDE_THING_ON_COLLECTION_MUTATION,
   SET_COLUMN_ORDER_MUTATION,
   ADD_LINK_TO_GROUP_MUTATION,
   ADD_NOTE_MUTATION
} from './queriesAndMutations';
import X from '../Icons/X';
import LinkIcon from '../Icons/Link';
import SearchIcon from '../Icons/Search';
import { getUniversalTags, groupSort } from './cardHandling';
import TaxInput from '../ThingParts/TaxInput';
import useMe from '../Account/useMe';
import { getRandomString } from '../../lib/TextHandling';
import ThingSearchInput from '../ThingParts/ThingSearchInput';
import { home } from '../../config';
import ContentIcon from '../Icons/ContentIcon';

const StyledCardList = styled.div``;

const CollectionsGroup = ({
   groupObj,
   collectionID,
   userGroups,
   hiddenGroups,
   hiddenThings,
   deleteGroupHandler,
   expandedCards,
   canEdit
}) => {
   const { id, includedLinks, notes, title, type, order } = groupObj;
   const {
      loggedInUserID,
      memberFields: { displayName }
   } = useMe('CollectionsGroup', 'displayName');

   const [groupTitle, setGroupTitle] = useState(title);
   const titleRef = useRef(null);

   const [searchingThings, setSearchingThings] = useState(false);

   const [linkToAdd, setLinkToAdd] = useState('');

   const groupRef = useRef(null);

   useEffect(() => {
      setGroupTitle(title);
   }, [title]);

   const [renameGroupOnCollection] = useMutation(RENAME_GROUP_MUTATION, {
      context: {
         debounceKey: collectionID
      }
   });

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [addNoteToGroup] = useMutation(ADD_NOTE_MUTATION, {
      onError: err => alert(err.message)
   });

   const handleLinkInputKeydown = e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      const now = new Date();
      const newGroupObj = JSON.parse(JSON.stringify(groupObj));
      newGroupObj.includedLinks.push({
         __typename: 'PersonalLink',
         id: `temporary-${getRandomString(12)}`,
         url: e.target.value,
         owner: {
            __typename: 'Member',
            id: loggedInUserID
         },
         title: null,
         description: null,
         partOfTags: [],
         createdAt: now.toISOString(),
         updatedAt: now.toISOString()
      });

      addLinkToCollectionGroup({
         variables: {
            url: e.target.value,
            groupID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addLinkToCollectionGroup: newGroupObj
         }
      });

      setLinkToAdd('');
   };

   // filteredThings = groupSort(filteredThings, groupObj.order);

   // Then we make a new array with the full data for each of our things
   // let filteredFullThingData = filteredThings.map(thing => {
   //    const [fullData] = fullThingData.filter(data => data.id === thing.id);
   //    return fullData;
   // });
   // Then we need to filter that array again, because some things that are part of the collection will have been removed by the Filter Things input in the CollectionHeader. Those will be undefined when they're converted to FullThingData, so we just remove any undefined items from the array
   // filteredFullThingData = filteredFullThingData.filter(data => data != null);

   // const thingElements = filteredFullThingData.map((thing, index) => (
   //    <CollectionsCard
   //       data={thing}
   //       index={index}
   //       key={thing.id}
   //       userGroups={userGroups}
   //       hiddenGroups={hiddenGroups}
   //       groupType={type}
   //       collectionID={collectionID}
   //       groupID={id}
   //       hideThingHandler={hideThingHandler}
   //       isExpanded={expandedCards.includes(thing.id)}
   //    />
   // ));

   const linksAndNotes = includedLinks.concat(notes);

   const sortedItems = groupSort(linksAndNotes, order);
   const linkElements = sortedItems.map((item, index) => (
      <CollectionsCard
         data={item}
         index={index}
         key={item.id}
         userGroups={userGroups}
         hiddenGroups={hiddenGroups}
         groupType={type}
         collectionID={collectionID}
         groupID={id}
         canEdit={canEdit}
      />
   ));

   const sendNewGroupTitle = e => {
      const newTitle = e.target.value;

      const thisGroupIndex = userGroups.findIndex(
         userGroupObj => userGroupObj.id === id
      );

      const copiedUserGroups = [...userGroups];
      copiedUserGroups[thisGroupIndex].title = newTitle;

      renameGroupOnCollection({
         variables: {
            collectionID,
            groupID: id,
            newTitle
         },
         optimisticResponse: {
            __typename: 'Mutation',
            renameGroupOnCollection: {
               __typename: 'Collection',
               id: collectionID,
               userGroups: copiedUserGroups
            }
         }
      });
   };

   return (
      <StyledGroup ref={groupRef} id={groupObj.id} className="collectionGroup">
         <header className="groupHeader">
            {!canEdit && <h4 className="groupTitle">{groupTitle}</h4>}
            {canEdit && (
               <input
                  className="groupTitle"
                  placeholder="Group Title"
                  ref={titleRef}
                  value={groupTitle}
                  onChange={e => setGroupTitle(e.target.value)}
                  onBlur={sendNewGroupTitle}
                  onKeyDown={e => {
                     if (e.key === 'Enter') {
                        e.preventDefault();
                        titleRef.current.blur();
                     }
                  }}
               />
            )}
            {canEdit && (
               <div className="buttons">
                  <X
                     titleText="Delete Group"
                     onClick={() => deleteGroupHandler(title, id)}
                  />
               </div>
            )}
         </header>
         <Droppable
            droppableId={id}
            isDropDisabled={!canEdit}
            key={id}
            type="card"
         >
            {provided => (
               <StyledCardList
                  className="droppableWrapper"
                  ref={provided.innerRef}
                  key={id}
                  {...provided.droppableProps}
               >
                  {linkElements.length === 0 && (
                     <div className="blankSpace">
                        Drop cards here to add them to this group
                     </div>
                  )}
                  {linkElements}
                  {provided.placeholder}
               </StyledCardList>
            )}
         </Droppable>
         {canEdit && (
            <footer className="collectionsGroupFooter">
               {!searchingThings && (
                  <input
                     type="url"
                     placeholder="add link to group"
                     value={linkToAdd}
                     onChange={e => setLinkToAdd(e.target.value)}
                     onKeyDown={handleLinkInputKeydown}
                  />
               )}
               {searchingThings && (
                  <ThingSearchInput
                     placeholder="search things to add"
                     onChosenResult={selectedPost => {
                        const thingID = selectedPost.id;
                        const url = `${home}/thing?id=${thingID}`;

                        const newGroupObj = JSON.parse(
                           JSON.stringify(groupObj)
                        );

                        const now = new Date();
                        const temporaryID = `temporary-${getRandomString(12)}`;

                        newGroupObj.includedLinks.push({
                           __typename: 'PersonalLink',
                           id: temporaryID,
                           url,
                           owner: {
                              __typename: 'Member',
                              id: loggedInUserID
                           },
                           title: null,
                           description: null,
                           partOfTags: [],
                           createdAt: now.toISOString(),
                           updatedAt: now.toISOString()
                        });

                        newGroupObj.order.push(temporaryID);

                        addLinkToCollectionGroup({
                           variables: {
                              url,
                              groupID: id
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              addLinkToCollectionGroup: newGroupObj
                           }
                        });
                     }}
                     additionalResultsFilter={thingData => {
                        let isAlreadyIncluded = false;
                        includedLinks.forEach(includedLink => {
                           if (includedLink.url.includes(thingData.id)) {
                              isAlreadyIncluded = true;
                           }
                        });
                        return !isAlreadyIncluded;
                     }}
                  />
               )}
               <div className="buttons">
                  {!searchingThings && (
                     <SearchIcon onClick={() => setSearchingThings(true)} />
                  )}
                  {searchingThings && (
                     <LinkIcon onClick={() => setSearchingThings(false)} />
                  )}
                  <div
                     className="contentIconWrapper"
                     onClick={() => {
                        const newGroupObj = JSON.parse(
                           JSON.stringify(groupObj)
                        );

                        const temporaryID = `note-${getRandomString(12)}`;

                        newGroupObj.notes.push({
                           __typename: 'Note',
                           id: temporaryID,
                           content: 'New note'
                        });
                        newGroupObj.order.push(temporaryID);

                        addNoteToGroup({
                           variables: {
                              groupID: id
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              addNoteToGroup: newGroupObj
                           }
                        });
                     }}
                  >
                     <ContentIcon />
                     <div className="badge">+</div>
                  </div>
               </div>
            </footer>
         )}
      </StyledGroup>
   );
};
export default CollectionsGroup;
