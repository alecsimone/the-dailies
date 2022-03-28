import gql from 'graphql-tag';
import { home } from '../../config';
import {
   collectionGroupFields,
   fullCollectionFields,
   fullPersonalLinkFields
} from '../../lib/CardInterfaces';
import { getRandomString } from '../../lib/TextHandling';
import { getColumnOrderIDsToDelete } from './CollectionsGroup';

const discardCard = (client, source, linkID, moveCardToGroup) => {
   // First we need to get the source group object for our optimistic response
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

   // We're going to use the moveCardToGroup mutation, which is set up to return multiple groups (in case you're moving from one group to another, but here we're moving from one group to nowhere). So our optimistic response is going to be an array containing the groupObj for the group we're moving the card out of.
   const optimisticResponse = {
      __typename: 'Mutation',
      moveCardToGroup: []
   };

   // The only change we need to make to the group object is to take this link out of the included links array and remove its ID from the order array
   const newSourceGroupObj = JSON.parse(JSON.stringify(sourceGroupObj));

   newSourceGroupObj.includedLinks = newSourceGroupObj.includedLinks.filter(
      linkObj => linkObj.id !== linkID
   );
   newSourceGroupObj.order = newSourceGroupObj.order.filter(
      orderId => orderId !== linkID
   );

   optimisticResponse.moveCardToGroup.push(newSourceGroupObj);

   moveCardToGroup({
      variables,
      optimisticResponse
   });
};
export { discardCard };

const addThingToGroup = (
   client,
   destination,
   thingID,
   loggedInUserID,
   addLinkToCollectionGroup
) => {
   const url = `${home}/thing?id=${thingID}`;
   const groupID = destination.droppableId;

   // We need to get the groupObj for our destination group so we can use it in our optimistic response
   const groupObj = client.readFragment({
      id: `CollectionGroup:${groupID}`,
      fragment: gql`
         fragment GroupForAddThing on CollectionGroup {
            ${collectionGroupFields}
      }`
   });

   // Then we can also check if the link is already in that group and alert the user if it is before quitting
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

   // Then we just make an object for our new link, push it into the old included links array, add its ID to the order array in the proper position, and call our mutation
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
};
export { addThingToGroup };

const reorderCards = (client, source, destination, linkID, reorderGroup) => {
   const groupID = source.droppableId;
   const newPosition = destination.index;

   // First we'll get the data object for the group we're reordering
   const groupObj = client.readFragment({
      id: `CollectionGroup:${groupID}`,
      fragment: gql`
         fragment GroupForReorder on CollectionGroup {
            ${collectionGroupFields}
      }`
   });

   // Then we need to figure out where in the group it's moving from
   const oldPosition = groupObj.order.indexOf(linkID);

   const newGroupObj = JSON.parse(JSON.stringify(groupObj));

   // We take it out of the old spot and put it back in at the new spot
   newGroupObj.order.splice(oldPosition, 1);
   newGroupObj.order.splice(newPosition, 0, linkID);

   // And then call our mutation
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
};
export { reorderCards };

const moveCardToGroupHandler = (
   client,
   source,
   destination,
   draggableId,
   linkID,
   moveCardToGroup
) => {
   const cardType = draggableId.includes('-note-') ? 'note' : 'link';

   // We need to get the data object for the card we're moving so we can add it to the destination group in our optimistic responsea
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

   // Then we need to get the source and destination groups to use in the optimistic response
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

   // We can also check if the link is already in the destination group, and if it is we can alert the user and quit
   let linkAlreadyIncluded = false;
   destinationGroupObj.includedLinks.forEach(linkData => {
      if (cardType === 'link') {
         if (linkData.url === linkObj.url) {
            linkAlreadyIncluded = true;
         }
      } else if (cardType === 'note') {
         if (linkData.id === linkID) {
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

   // The moveCardToGroup mutation returns an array with both the source and destination group objects in it. So we'll start with an empty array and then once we've got each object modified correctly, we'll push it into that array
   const optimisticResponse = {
      __typename: 'Mutation',
      moveCardToGroup: []
   };

   // The source group object needs to have the link or note disconnected from it and then its id removed from the order array
   const newSourceGroupObj = JSON.parse(JSON.stringify(sourceGroupObj));
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

   // The destination group needs to have the link or note connected to it and then its ID added to the order array in the correct position
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

   // And then we can call our mutation
   moveCardToGroup({
      variables,
      optimisticResponse
   });
};
export { moveCardToGroupHandler };

const discardGroup = (client, groupID, deleteGroupFromCollection) => {
   // We're going to need the collection data object for our optimistic response, which we'll get from the group object
   const groupObj = client.readFragment({
      id: `CollectionGroup:${groupID}`,
      fragment: gql`
         fragment GroupForDeletion on CollectionGroup {
            inCollection {
               id
            }
         }
      `
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

   // Then we make a copy of the collectionObj and disconnect the grop from it
   const newCollectionObj = JSON.parse(JSON.stringify(collectionObj));
   newCollectionObj.userGroups = newCollectionObj.userGroups.filter(
      newGroupObj => newGroupObj.id !== groupID
   );

   // Remove the group from its column order
   const columnOrderIndex = newCollectionObj.columnOrders.findIndex(orderObj =>
      // We want the index of the columnOrder whose order includes this group's id
      orderObj.order.includes(groupID)
   );
   // And then we can replace that order with one that no longer includes this group's id
   newCollectionObj.columnOrders[
      columnOrderIndex
   ].order = newCollectionObj.columnOrders[columnOrderIndex].order.filter(
      id => id !== groupID
   );

   // And delete any empty columns at the end of our collection
   const columnOrdersToDelete = getColumnOrderIDsToDelete(
      newCollectionObj.columnOrders,
      newCollectionObj.columnOrderOrder
   );

   // First we filter out the columnOrders themselves
   newCollectionObj.columnOrders = newCollectionObj.columnOrders.filter(
      orderObj => !columnOrdersToDelete.includes(orderObj.id)
   );
   // And then we filter out the columnOrder IDs from the columnOrderOrder
   newCollectionObj.columnOrderOrder = newCollectionObj.columnOrderOrder.filter(
      colID => !columnOrdersToDelete.includes(colID)
   );

   // And now we're ready to call our mutation
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
};
export { discardGroup };

const reorderColumnHandler = (
   client,
   source,
   destination,
   groupID,
   reorderColumn
) => {
   const columnID = source.droppableId;
   const newPosition = destination.index;

   // We're just going to need the columnOrder object for this one
   const orderObj = client.readFragment({
      id: `ColumnOrder:${columnID}`,
      fragment: gql`
         fragment ColumnToReorder on ColumnOrder {
            id
            order
         }
      `
   });

   // We find the old position of the group in this column
   const oldPosition = orderObj.order.indexOf(groupID);

   // Then make a copy of the columnOrder object
   const newOrderObj = JSON.parse(JSON.stringify(orderObj));

   // And remove the groupID from its old position and add it back in at its new one
   newOrderObj.order.splice(oldPosition, 1);
   newOrderObj.order.splice(newPosition, 0, groupID);

   // Then we can call our mutation
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
};
export { reorderColumnHandler };

const moveGroupToColumnHandler = (
   client,
   source,
   destination,
   groupID,
   moveGroupToColumn
) => {
   // We need to get the collection data, which we can pull through the group object
   const groupObj = client.readFragment({
      id: `CollectionGroup:${groupID}`,
      fragment: gql`
         fragment GroupToMove on CollectionGroup {
            inCollection {
               __typename
               id
               columnOrders {
                  __typename
                  id
                  order
               }
               columnOrderOrder
            }
         }
      `
   });
   const collectionData = groupObj.inCollection;

   // Then we need to get the source order index within columnOrders and the order itself
   const sourceColumnID = source.droppableId;
   const sourceOrderIndex = collectionData.columnOrders.findIndex(
      orderObj => orderObj.id === sourceColumnID
   );
   const sourceOrderObj = collectionData.columnOrders[sourceOrderIndex];

   // And the same for the destination: the order index within columnOrders and the order itself
   const destinationColumnID = destination.droppableId;
   const destinationOrderIndex = collectionData.columnOrders.findIndex(
      orderObj => orderObj.id === destinationColumnID
   );
   const destinationOrderObj =
      collectionData.columnOrders[destinationOrderIndex];

   const variables = {
      groupID,
      sourceColumnID,
      destinationColumnID,
      newPosition: destination.index
   };

   const optimisticResponse = {
      __typename: 'Mutation',
      moveGroupToColumn: collectionData
   };

   // Then we make a copy of the sourceOrder object and remove the groupID from it
   const newSourceOrderObj = JSON.parse(JSON.stringify(sourceOrderObj));
   newSourceOrderObj.order = newSourceOrderObj.order.filter(
      existingID => existingID !== groupID
   );

   // And replace the source order object in our optimistic response
   optimisticResponse.moveGroupToColumn.columnOrders[
      sourceOrderIndex
   ] = newSourceOrderObj;

   let newDestinationOrderObj;
   if (destination.droppableId === 'blankColumn') {
      // If we're moving the group to a blank column, we need to create a new order object for it with just the groupID in it, and then add the groupID to our columnOrderOrder array
      const newColumnID = getRandomString(25);
      newDestinationOrderObj = {
         __typename: 'ColumnOrder',
         id: newColumnID,
         order: [groupID]
      };
      optimisticResponse.moveGroupToColumn.columnOrders.push(
         newDestinationOrderObj
      );
      optimisticResponse.moveGroupToColumn.columnOrderOrder.push(newColumnID);
   } else {
      // If we're moving the group to an existing column, we just need to add its ID to that column's order array in the proper position and update our optimistic response
      newDestinationOrderObj = JSON.parse(JSON.stringify(destinationOrderObj));
      newDestinationOrderObj.order.splice(destination.index, 0, groupID);
      optimisticResponse.moveGroupToColumn.columnOrders[
         destinationOrderIndex
      ] = newDestinationOrderObj;
   }

   // Then we need to delete any empty columns left at the end of our collection
   const columnOrdersToDelete = getColumnOrderIDsToDelete(
      optimisticResponse.moveGroupToColumn.columnOrders,
      optimisticResponse.moveGroupToColumn.columnOrderOrder
   );

   optimisticResponse.moveGroupToColumn.columnOrders = optimisticResponse.moveGroupToColumn.columnOrders.filter(
      orderObj => !columnOrdersToDelete.includes(orderObj.id)
   );

   optimisticResponse.moveGroupToColumn.columnOrderOrder = collectionData.columnOrderOrder.filter(
      colID => !columnOrdersToDelete.includes(colID)
   );

   // And we're ready to call our mutation
   moveGroupToColumn({
      variables,
      optimisticResponse
   });
};
export { moveGroupToColumnHandler };
