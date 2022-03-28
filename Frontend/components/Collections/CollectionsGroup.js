import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import gql from 'graphql-tag';
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

const getColumnOrderIDsToDelete = (columnOrders, columnOrderOrder) => {
   // We'll need an array to hold the IDs of the columnOrders we need to delete
   const columnOrdersToDelete = [];

   // We're going to loop backwards through the columnOrderOrder array, collecting the IDs of any columnOrders that have no groups in them. The idea is that we can have blank columnOrders if they're in the middle of a collection, but we don't want any left at the end of one.
   let i = columnOrders.length - 1;

   // Our process is going to be getting the next columnOrderID out of the columnOrderOrder array
   let columnOrderID = columnOrderOrder[i];
   // Then getting the relevant columnOrder
   let thisColumnOrder = columnOrders.find(
      orderObj => orderObj.id === columnOrderID
   );
   // And checking if its order is empty
   let nextOrder = thisColumnOrder.order;

   while (nextOrder != null && nextOrder.length === 0 && i > 0) {
      columnOrderID = columnOrderOrder[i];
      thisColumnOrder = columnOrders.find(
         orderObj => orderObj.id === columnOrderID
      );
      nextOrder = thisColumnOrder.order;

      if (nextOrder.length === 0) {
         columnOrdersToDelete.push(thisColumnOrder.id);
      }

      i -= 1;
   }
   return columnOrdersToDelete;
};

export { getColumnOrderIDsToDelete };

const CollectionsGroup = ({ index, groupObj, collectionID, canEdit }) => {
   const { id, includedLinks, notes, title, type, order } = groupObj;
   const {
      loggedInUserID,
      memberFields: { displayName }
   } = useMe('CollectionsGroup', 'displayName');

   const [showingCards, setShowingCards] = useState(true); // Allows us to collapse the group

   const [groupTitle, setGroupTitle] = useState(title);
   const titleRef = useRef(null);

   const [searchingThings, setSearchingThings] = useState(false); // Allows us to toggle the input in the footer between adding links and searching things

   const [linkToAdd, setLinkToAdd] = useState('');

   const groupRef = useRef(null);

   useEffect(() => {
      // We need this effect to change the group title when the subscription updates it
      setGroupTitle(title);
   }, [title]);

   useEffect(() => {
      dynamicallyResizeElement(titleRef.current, false);
   }); // This used to have an empty dependency array, but we kept getting missized elements, so I took it away. Might be worth putting back if things are getting jittery or slow. Or if it doesn't solve the problem.

   const [renameGroupOnCollection] = useMutation(RENAME_GROUP_MUTATION, {
      context: {
         debounceKey: collectionID
      }
   });

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [deleteGroupFromCollection] = useMutation(
      DELETE_GROUP_FROM_COLLECTION_MUTATION
   );

   const client = useApolloClient();

   const deleteGroupHandler = (title, groupID) => {
      if (!confirm(`Are you sure you want to remove the group ${title}?`))
         return;

      // First let's get the full collection data. We don't want to pass in all the userGroups, because then this group would rerender when we change any of them, so we're going to get them out of the cache here.
      const collectionObj = client.readFragment({
         id: `Collection:${collectionID}`,
         fragment: gql`
            fragment CollectionForDeletion on Collection
            {
               ${fullCollectionFields}
            }
         `
      });

      let { userGroups, columnOrders, columnOrderOrder } = collectionObj;

      // Then we filter this group out from our userGroups and columnOrders
      const newUserGroups = userGroups.filter(
         thisGroupObj => thisGroupObj.id !== id
      );
      columnOrders.forEach(columnOrderObj => {
         columnOrderObj.order = columnOrderObj.order.filter(
            thisID => thisID !== id
         );
      });

      // We need to delete any blank column orders at the end of the array of column orders so we don't have a bunch of blank columns at the end of our collection
      const columnOrdersToDelete = getColumnOrderIDsToDelete(
         columnOrders,
         columnOrderOrder
      );
      columnOrders = columnOrders.filter(
         orderObj => !columnOrdersToDelete.includes(orderObj.id)
      );
      columnOrderOrder = columnOrderOrder.filter(
         colID => !columnOrdersToDelete.includes(colID)
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
               columnOrders,
               columnOrderOrder
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

   const linksAndNotes = includedLinks.concat(notes);

   const sortedItems = groupSort(linksAndNotes, order);
   const cardElements = sortedItems.map((item, cardIndex) => (
      <CollectionsCard
         data={item}
         index={cardIndex}
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

   const searchThingsInput = (
      <ThingSearchInput
         placeholder="search things to add"
         onChosenResult={selectedPost => {
            const thingID = selectedPost.id;
            const url = `${home}/thing?id=${thingID}`;

            const newGroupObj = JSON.parse(JSON.stringify(groupObj));

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
               if (includedLink.url.includes(`/thing?id=${thingData.id}`)) {
                  isAlreadyIncluded = true;
               }
            });
            return !isAlreadyIncluded;
         }}
      />
   );

   const addNoteButton = (
      <div
         className="contentIconWrapper"
         onClick={() => {
            const newGroupObj = JSON.parse(JSON.stringify(groupObj));

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
   );

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
                              titleText={
                                 showingCards
                                    ? 'Collapse Group'
                                    : 'Expand Group'
                              }
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
                              {cardElements.length === 0 && (
                                 <div className="blankSpace">
                                    Drop cards here to add them to this group
                                 </div>
                              )}
                              {cardElements}
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
                        {searchingThings && searchThingsInput}
                        <div className="buttons">
                           {!searchingThings && (
                              <SearchIcon
                                 onClick={() => setSearchingThings(true)}
                                 titleText="Switch input to search things"
                              />
                           )}
                           {searchingThings && (
                              <LinkIcon
                                 onClick={() => setSearchingThings(false)}
                                 titleText="Switch input to add links"
                              />
                           )}
                           {addNoteButton}
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
