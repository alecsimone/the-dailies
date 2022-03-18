import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { DragDropContext } from 'react-beautiful-dnd';
import { home } from '../../config';
import {
   collectionGroupFields,
   fullCollectionFields,
   fullPersonalLinkFields
} from '../../lib/CardInterfaces';
import { getRandomString } from '../../lib/TextHandling';
import useMe from '../Account/useMe';
import {
   ADD_LINK_TO_GROUP_MUTATION,
   DELETE_GROUP_FROM_COLLECTION_MUTATION,
   MOVE_CARD_TO_GROUP_MUTATION,
   MOVE_GROUP_TO_COLUMN_MUTATION,
   REORDER_COLUMN_MUTATION,
   REORDER_GROUP_MUTATION
} from './queriesAndMutations';

const DragAndDropProvider = ({ children }) => {
   const { loggedInUserID } = useMe();

   const [addLinkToCollectionGroup, { client }] = useMutation(
      ADD_LINK_TO_GROUP_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const [moveCardToGroup] = useMutation(MOVE_CARD_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [moveGroupToColumn] = useMutation(MOVE_GROUP_TO_COLUMN_MUTATION, {
      onError: err => alert(err.message)
   });

   const [reorderGroup] = useMutation(REORDER_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [reorderColumn] = useMutation(REORDER_COLUMN_MUTATION, {
      onError: err => alert(err.message)
   });

   const [deleteGroupFromCollection] = useMutation(
      DELETE_GROUP_FROM_COLLECTION_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const dragEndHelper = ({ source, destination, draggableId, type }) => {
      const dashLocation = draggableId.lastIndexOf('-');
      const itemID = draggableId.substring(dashLocation + 1);

      if (type === 'card') {
         if (destination == null) {
            const linkID = itemID;

            const sourceGroupID = source.droppableId;
            const sourceGroupObj = client.readFragment({
               id: `CollectionGroup:${sourceGroupID}`,
               fragment: gql`
                  fragment SourceGroupForMoveThing on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            const variables = {
               linkID,
               sourceGroupID
            };

            const optimisticResponse = {
               __typename: 'Mutation',
               moveCardToGroup: []
            };

            const newSourceGroupObj = JSON.parse(
               JSON.stringify(sourceGroupObj)
            );
            newSourceGroupObj.includedLinks = newSourceGroupObj.includedLinks.filter(
               linkObj => linkObj.id !== linkID
            );
            optimisticResponse.moveCardToGroup.push(newSourceGroupObj);

            moveCardToGroup({
               variables,
               optimisticResponse
            });
         } else if (source.droppableId === 'MyThings') {
            if (destination.droppableId === 'MyThings') {
               // You can't reorder things within the myThings bar
               return;
            }

            const url = `${home}/thing?id=${itemID}`;
            const groupID = destination.droppableId;

            const groupObj = client.readFragment({
               id: `CollectionGroup:${groupID}`,
               fragment: gql`
                  fragment GroupForAddThing on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            let linkAlreadyIncluded = false;
            groupObj.includedLinks.forEach(linkData => {
               if (linkData.url === url) {
                  linkAlreadyIncluded = true;
               }
            });
            if (linkAlreadyIncluded) {
               alert("You've already added that link to that group.");
               return;
            }

            const now = new Date();
            const newGroupObj = JSON.parse(JSON.stringify(groupObj));

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

            newGroupObj.order.splice(destination.index, 0, temporaryID);

            addLinkToCollectionGroup({
               variables: {
                  url,
                  groupID,
                  position: destination.index
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  addLinkToCollectionGroup: newGroupObj
               }
            });
         } else if (source.droppableId === destination.droppableId) {
            const linkID = itemID;
            const groupID = source.droppableId;
            const newPosition = destination.index;

            const groupObj = client.readFragment({
               id: `CollectionGroup:${groupID}`,
               fragment: gql`
                  fragment GroupForReorder on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            const oldPosition = groupObj.order.indexOf(linkID);

            const newGroupObj = JSON.parse(JSON.stringify(groupObj));

            newGroupObj.order.splice(oldPosition, 1);
            newGroupObj.order.splice(newPosition, 0, linkID);

            reorderGroup({
               variables: {
                  groupID,
                  linkID,
                  newPosition
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  reorderGroup: newGroupObj
               }
            });
         } else {
            const linkID = itemID;
            const cardType = draggableId.includes('-note-') ? 'note' : 'link';

            let linkObj;
            if (cardType === 'link') {
               linkObj = client.readFragment({
                  id: `PersonalLink:${linkID}`,
                  fragment: gql`
                     fragment LinkToMove on PersonalLink {
                        ${fullPersonalLinkFields}
                     }`
               });
            } else if (cardType === 'note') {
               linkObj = client.readFragment({
                  id: `Note:${linkID}`,
                  fragment: gql`
                     fragment NoteToMove on Note {
                        id
                        content
                     }
                  `
               });
            }

            const sourceGroupID = source.droppableId;
            const sourceGroupObj = client.readFragment({
               id: `CollectionGroup:${sourceGroupID}`,
               fragment: gql`
                  fragment SourceGroupForMoveThing on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            const destinationGroupID = destination.droppableId;
            const destinationGroupObj = client.readFragment({
               id: `CollectionGroup:${destinationGroupID}`,
               fragment: gql`
                  fragment DestinationGroupForMoveThing on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            let linkAlreadyIncluded = false;
            destinationGroupObj.includedLinks.forEach(linkData => {
               if (cardType === 'link') {
                  if (linkData.url === linkObj.url) {
                     linkAlreadyIncluded = true;
                  }
               } else if (cardType === 'note') {
                  if (linkData.id === itemID) {
                     linkAlreadyIncluded = true;
                  }
               }
            });
            if (linkAlreadyIncluded) {
               alert(`You've already added that ${cardType} to that group.`);
               return;
            }

            const newPosition = destination.index;

            const variables = {
               linkID,
               cardType,
               sourceGroupID,
               destinationGroupID,
               newPosition
            };

            const optimisticResponse = {
               __typename: 'Mutation',
               moveCardToGroup: []
            };

            const newSourceGroupObj = JSON.parse(
               JSON.stringify(sourceGroupObj)
            );
            if (cardType === 'link') {
               newSourceGroupObj.includedLinks = newSourceGroupObj.includedLinks.filter(
                  linkObj => linkObj.id !== linkID
               );
            } else if (cardType === 'note') {
               newSourceGroupObj.notes = newSourceGroupObj.notes.filter(
                  noteObj => noteObj.id !== linkID
               );
            }
            newSourceGroupObj.order = newSourceGroupObj.order.filter(
               existingID => existingID !== linkID
            );
            optimisticResponse.moveCardToGroup.push(newSourceGroupObj);

            const newDestinationGroupObj = JSON.parse(
               JSON.stringify(destinationGroupObj)
            );
            if (cardType === 'link') {
               newDestinationGroupObj.includedLinks.push(linkObj);
            } else if (cardType === 'note') {
               newDestinationGroupObj.notes.push(linkObj);
            }
            newDestinationGroupObj.order.splice(newPosition, 0, linkID);
            optimisticResponse.moveCardToGroup.push(newDestinationGroupObj);

            moveCardToGroup({
               variables,
               optimisticResponse
            });
         }
      } else if (type === 'group') {
         if (destination == null) {
            if (!confirm('Are you sure you want to delete that group?')) return;

            const groupID = itemID;

            const groupObj = client.readFragment({
               id: `CollectionGroup:${groupID}`,
               fragment: gql`
                  fragment GroupForDeletion on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });
            const { id: collectionID } = groupObj.inCollection;
            const collectionObj = client.readFragment({
               id: `Collection:${collectionID}`,
               fragment: gql`
                  fragment CollectionForDeletion on Collection
                  {
                     ${fullCollectionFields}
                  }
               `
            });

            const newCollectionObj = JSON.parse(JSON.stringify(collectionObj));
            newCollectionObj.userGroups = newCollectionObj.userGroups.filter(
               groupObj => groupObj.id !== groupID
            );

            deleteGroupFromCollection({
               variables: {
                  collectionID,
                  groupID
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  deleteGroupFromCollection: newCollectionObj
               }
            });
         } else if (source.droppableId === destination.droppableId) {
            const groupID = itemID;
            const columnID = source.droppableId;
            const newPosition = destination.index;

            const orderObj = client.readFragment({
               id: `ColumnOrder:${columnID}`,
               fragment: gql`
                  fragment ColumnToReorder on ColumnOrder {
                     id
                     order
                  }
               `
            });

            const oldPosition = orderObj.order.indexOf(groupID);

            const newOrderObj = JSON.parse(JSON.stringify(orderObj));

            newOrderObj.order.splice(oldPosition, 1);
            newOrderObj.order.splice(newPosition, 0, groupID);

            reorderColumn({
               variables: {
                  columnID,
                  groupID,
                  newPosition
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  reorderColumn: newOrderObj
               }
            });
         } else {
            const groupID = itemID;
            const groupObj = client.readFragment({
               id: `CollectionGroup:${groupID}`,
               fragment: gql`
                  fragment GroupToMove on CollectionGroup {
                     ${collectionGroupFields}
                  }`
            });

            const sourceColumnID = source.droppableId;
            const sourceOrderObj = client.readFragment({
               id: `ColumnOrder:${sourceColumnID}`,
               fragment: gql`
                  fragment SourceColumnForMoveGroup on ColumnOrder {
                     id
                     order
                  }
               `
            });

            const destinationColumnID = destination.droppableId;
            const destinationOrderObj = client.readFragment({
               id: `ColumnOrder:${destinationColumnID}`,
               fragment: gql`
                  fragment SourceColumnForMoveGroup on ColumnOrder {
                     id
                     order
                  }
               `
            });

            const variables = {
               groupID,
               sourceColumnID,
               destinationColumnID,
               newPosition: destination.index
            };

            const optimisticResponse = {
               __typename: 'Mutation',
               moveGroupToColumn: []
            };

            const newSourceOrderObj = JSON.parse(
               JSON.stringify(sourceOrderObj)
            );
            newSourceOrderObj.order = newSourceOrderObj.order.filter(
               existingID => existingID !== groupID
            );
            optimisticResponse.moveGroupToColumn.push(newSourceOrderObj);

            const newDestinationOrderObj = JSON.parse(
               JSON.stringify(destinationOrderObj)
            );
            newDestinationOrderObj.order.splice(destination.index, 0, groupID);
            optimisticResponse.moveGroupToColumn.push(newDestinationOrderObj);

            moveGroupToColumn({
               variables,
               optimisticResponse
            });
         }
      } else {
         console.log("I don't know what you just dragged");
      }
   };

   return (
      <DragDropContext onDragEnd={dragEndHelper}>{children}</DragDropContext>
   );
};

export default DragAndDropProvider;
