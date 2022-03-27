import React, { useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { Draggable } from 'react-beautiful-dnd';
import { StyledGroup } from './styles';
import CollectionsCard from './CollectionsCard';
import {
   RENAME_GROUP_MUTATION,
   ADD_LINK_TO_GROUP_MUTATION,
   ADD_NOTE_MUTATION,
   DELETE_GROUP_FROM_COLLECTION_MUTATION
} from './queriesAndMutations';
import X from '../Icons/X';
import LinkIcon from '../Icons/Link';
import SearchIcon from '../Icons/Search';
import { groupSort } from './cardHandling';
import useMe from '../Account/useMe';
import { getRandomString } from '../../lib/TextHandling';
import ThingSearchInput from '../ThingParts/ThingSearchInput';
import { home } from '../../config';
import ContentIcon from '../Icons/ContentIcon';
import ArrowIcon from '../Icons/Arrow';
import { dynamicallyResizeElement } from '../../styles/functions';
import { fullCollectionFields } from '../../lib/CardInterfaces';

const StyledCardList = styled.div``;

const CollectionsGroup = ({ index, groupObj, collectionID, canEdit }) => {
   const { id, includedLinks, notes, title, type, order } = groupObj;
   const {
      loggedInUserID,
      memberFields: { displayName }
   } = useMe('CollectionsGroup', 'displayName');

   const [showingCards, setShowingCards] = useState(true);

   const [groupTitle, setGroupTitle] = useState(title);
   const titleRef = useRef(null);

   const [searchingThings, setSearchingThings] = useState(false);

   const [linkToAdd, setLinkToAdd] = useState('');

   const groupRef = useRef(null);

   useEffect(() => {
      setGroupTitle(title);
   }, [title]);

   useEffect(() => {
      dynamicallyResizeElement(titleRef.current, false);
   }, []);

   const [renameGroupOnCollection] = useMutation(RENAME_GROUP_MUTATION, {
      context: {
         debounceKey: collectionID
      }
   });

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [deleteGroupFromCollection, { client }] = useMutation(
      DELETE_GROUP_FROM_COLLECTION_MUTATION,
      {
         context: {
            debounceKey: id
         }
      }
   );

   const deleteGroupHandler = (title, groupID) => {
      if (!confirm(`Are you sure you want to remove the group ${title}?`))
         return;
      const collectionObj = client.readFragment({
         id: `Collection:${collectionID}`,
         fragment: gql`
            fragment CollectionForDeletion on Collection
            {
               ${fullCollectionFields}
            }
         `
      });

      let { userGroups, columnOrders } = collectionObj;

      const newUserGroups = userGroups.filter(
         thisGroupObj => thisGroupObj.id !== id
      );
      columnOrders.forEach(columnOrderObj => {
         columnOrderObj.order = columnOrderObj.order.filter(
            thisID => thisID !== id
         );
      });

      // We need to delete any blank column orders at the end of the array of column orders so we don't have a bunch of blank columns at the end of our collection
      const columnOrdersToDelete = [];
      let i = columnOrders.length - 1;
      let collectionOrder = columnOrders[i].order;
      while (collectionOrder != null && collectionOrder.length === 0 && i > 0) {
         collectionOrder = columnOrders[i].order;
         if (collectionOrder.length === 0) {
            columnOrdersToDelete.push(columnOrders[i].id);
         }

         i -= 1;
      }
      columnOrders = columnOrders.filter(
         orderObj => !columnOrdersToDelete.includes(orderObj.id)
      );

      deleteGroupFromCollection({
         variables: {
            collectionID,
            groupID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteGroupFromCollection: {
               __typename: 'Collection',
               id: collectionID,
               userGroups: newUserGroups,
               columnOrders
            }
         }
      });
   };

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

   // Then we need to filter that array again, because some things that are part of the collection will have been removed by the Filter Things input in the CollectionHeader. Those will be undefined when they're converted to FullThingData, so we just remove any undefined items from the array
   // filteredFullThingData = filteredFullThingData.filter(data => data != null);

   const linksAndNotes = includedLinks.concat(notes);

   const sortedItems = groupSort(linksAndNotes, order);
   const linkElements = sortedItems.map((item, index) => (
      <CollectionsCard
         data={item}
         index={index}
         key={item.id}
         groupType={type}
         collectionID={collectionID}
         groupID={id}
         canEdit={canEdit}
      />
   ));

   const sendNewGroupTitle = e => {
      if (e.target.value === title) return;
      const newTitle = e.target.value;

      renameGroupOnCollection({
         variables: {
            collectionID,
            groupID: id,
            newTitle
         },
         optimisticResponse: {
            __typename: 'Mutation',
            renameGroupOnCollection: {
               __typename: 'CollectionGroup',
               id,
               title: newTitle
            }
         }
      });
   };

   return (
      <Draggable
         draggableId={`${index}-${id}`}
         isDragDisabled={!canEdit}
         index={index}
         key={`${index}-${id}`}
      >
         {dragProvided => (
            <div
               {...dragProvided.draggableProps}
               {...dragProvided.dragHandleProps}
               ref={dragProvided.innerRef}
               key={index}
               className="groupContainer"
            >
               <StyledGroup
                  ref={groupRef}
                  id={groupObj.id}
                  className="collectionGroup"
               >
                  <header className="groupHeader">
                     {!canEdit && <h4 className="groupTitle">{groupTitle}</h4>}
                     {canEdit && (
                        <textarea
                           className="groupTitle"
                           placeholder="Group Title"
                           ref={titleRef}
                           value={groupTitle}
                           onChange={e => {
                              setGroupTitle(e.target.value);
                              dynamicallyResizeElement(e.target, false);
                           }}
                           onBlur={sendNewGroupTitle}
                           onKeyDown={e => {
                              if (e.key === 'Enter') {
                                 e.preventDefault();
                                 titleRef.current.blur();
                              }
                              if (e.key === 'Escape') {
                                 setGroupTitle(title);
                                 titleRef.current.blur();
                              }
                           }}
                        />
                     )}
                     {canEdit && (
                        <div className="buttons">
                           <ArrowIcon
                              pointing={showingCards ? 'up' : 'down'}
                              onClick={() => setShowingCards(!showingCards)}
                           />
                           <X
                              titleText="Delete Group"
                              onClick={() => deleteGroupHandler(title, id)}
                           />
                        </div>
                     )}
                  </header>
                  {showingCards && (
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
                  )}
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
                                 const temporaryID = `temporary-${getRandomString(
                                    12
                                 )}`;

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
                                    if (
                                       includedLink.url.includes(thingData.id)
                                    ) {
                                       isAlreadyIncluded = true;
                                    }
                                 });
                                 return !isAlreadyIncluded;
                              }}
                           />
                        )}
                        <div className="buttons">
                           {!searchingThings && (
                              <SearchIcon
                                 onClick={() => setSearchingThings(true)}
                              />
                           )}
                           {searchingThings && (
                              <LinkIcon
                                 onClick={() => setSearchingThings(false)}
                              />
                           )}
                           <div
                              className="contentIconWrapper"
                              onClick={() => {
                                 const newGroupObj = JSON.parse(
                                    JSON.stringify(groupObj)
                                 );

                                 const temporaryID = `note-${getRandomString(
                                    12
                                 )}`;

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
            </div>
         )}
      </Draggable>
   );
};
export default CollectionsGroup;
