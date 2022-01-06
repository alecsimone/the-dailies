import { toast } from 'react-toastify';
import { getRandomString } from '../../lib/TextHandling';

const getDraggableId = rawDraggableId => {
   const draggableIdSeparatorIndex = rawDraggableId.indexOf('-');
   const draggableId = rawDraggableId.substring(draggableIdSeparatorIndex + 1);
   return draggableId;
};

export { getDraggableId };

const untagCard = (thingID, things, tagID, removeTaxFromThing) => {
   const [thingData] = things.filter(thing => thing.id === thingID);

   const { partOfTags: tags } = thingData;

   let thisTag;
   const newTags = [];
   tags.forEach(tag => {
      if (tag.id === tagID) {
         thisTag = tag;
      } else {
         newTags.push(tag);
      }
   });

   const newThingData = {
      // The optimistic response needs the newThingData to have exactly this shape
      __typename: 'Thing',
      id: thingID,
      partOfStacks: [],
      partOfTags: newTags
   };

   removeTaxFromThing({
      variables: {
         tax: thisTag.title,
         thingID,
         personal: false
      },
      optimisticResponse: {
         __typename: 'Mutation',
         removeTaxFromThing: newThingData
      }
   });

   // This behavior feels kind of wonky if we're removing a tag from a thing that still has other tags. You drag the card to the untagged things group, but it doesn't show up there because it still has tags. But I don't want to remove all the tags from a thing, because that's a potentially unexpected highly destructive action. So we'll pop up a little toast that explains that the thing still has other tags.
   if (newTags.length > 0) {
      toast(
         `You removed the tag ${thisTag.title} from the thing ${
            thingData.title
         }, but it still has other tags so it did not go into the Untagged group`,
         {
            position: 'bottom-center',
            autoClose: 5000
         }
      );
   }
};

export { untagCard };

// const ungroupCard = () => {
//    console.log("let's ungroup that card!");
// };

// export { ungroupCard };

const getNewOrder = (
   originalOrder,
   draggableID,
   index,
   sourceOrDestination
) => {
   const newOrder = [...originalOrder];

   if (sourceOrDestination === 'source') {
      newOrder.splice(index, 1);
   } else if (sourceOrDestination === 'destination') {
      newOrder.splice(index, 0, draggableID);
   }

   return newOrder;
};

const getNewOrders = (source, destination, draggableID, keepSourceSame) => {
   // If the source and destination aren't the same, we can just get new orders for each of them and send those back
   if (source.droppableId !== destination.droppableId) {
      // First we get the new order of the source group
      const newSourceOrder = getNewOrder(
         source.order,
         draggableID,
         source.index,
         'source'
      );

      // Then we get the new order of the destination group
      const newDestinationOrder = getNewOrder(
         destination.order,
         draggableID,
         destination.index,
         'destination'
      );
      if (keepSourceSame) {
         return [source.order, newDestinationOrder];
      }
      return [newSourceOrder, newDestinationOrder];
   }
   let newOrder = getNewOrder(
      source.order,
      draggableID,
      source.index,
      'source'
   );
   newOrder = getNewOrder(
      newOrder,
      draggableID,
      destination.index,
      'destination'
   );
   return [newOrder, newOrder];
};

export { getNewOrders };

const reorderTagsHandler = (
   source,
   newSourceOrder,
   destination,
   newDestinationOrder,
   reorderTags,
   collectionID,
   addTaxToThingById,
   tagOrders
) => {
   // First we handle reordering normal groups, which is to say, not the untagged things group
   const reorderVariables = { collectionID };
   const reorderOptimisticResponse = {
      __typename: 'Mutation',
      reorderTags: []
   };

   if (source.droppableId !== 'untagged') {
      // If the source group isn't untagged things, we add the relevant variables for it to our objects
      // First though, we need to get the TagOrder id, or create one if we don't have a TagOrder already
      const tagOrderID =
         source.groupObj.tagOrderID === null
            ? getRandomString(24)
            : source.groupObj.tagOrderID;

      reorderVariables.groupOneID = tagOrderID;
      reorderVariables.tagOneID = source.droppableId;
      reorderVariables.newOrderOne = newSourceOrder;

      reorderOptimisticResponse.reorderTags.push({
         __typename: 'TagOrder',
         id: tagOrderID,
         order: newSourceOrder
      });
      tagOrders.push({
         __typename: 'TagOrder',
         id: tagOrderID,
         order: newSourceOrder,
         tag: {
            id: source.droppableId
         }
      });
   }

   if (
      destination.droppableId !== source.droppableId &&
      destination.droppableId !== 'untagged'
   ) {
      // If the destination group isn't untagged and it's not the same as the source group, we add the relevant variables for it to our objects
      // First though, we need to get the TagOrder id, or create one if we don't have a TagOrder already
      const tagOrderID =
         source.groupObj.tagOrderID === null
            ? getRandomString(24)
            : source.groupObj.tagOrderID;
      reorderVariables.groupTwoID = tagOrderID;
      reorderVariables.tagTwoID = destination.droppableId;
      reorderVariables.newOrderTwo = newDestinationOrder;

      reorderOptimisticResponse.reorderTags.push({
         __typename: 'TagOrder',
         id: tagOrderID,
         order: newDestinationOrder
      });
   }

   if (
      source.droppableId !== 'ungrouped' ||
      destination.droppableId !== 'ungrouped'
   ) {
      // If at least one of the groups is not the ungrouped or untagged things group, we send off the mutation to reorder it
      reorderTags({
         variables: reorderVariables
         // optimisticResponse: reorderOptimisticResponse
      });
   }

   // If neither of the provided groups are ungrouped or untagged things, then we're done
   if (
      source.droppableId !== 'ungrouped' &&
      destination.droppableId !== 'ungrouped'
   )
      return;

   // If one is, then we reorder the ungrouped things group
   const reorderUngroupedVariables = {
      collectionID
   };
   const reorderUngroupedOptimisticResponse = {
      __typename: 'Mutation',
      reorderUngroupedThings: {
         __typename: 'Collection',
         id: collectionID
      }
   };

   if (source.droppableId === 'ungrouped') {
      reorderUngroupedVariables.newOrder = newSourceOrder;
      reorderUngroupedOptimisticResponse.reorderUngroupedThings.ungroupedThingsOrder = newSourceOrder;
   }
   if (
      destination.droppableId !== source.droppableId &&
      destination.droppableId === 'ungrouped'
   ) {
      reorderUngroupedVariables.newOrder = newDestinationOrder;
      reorderUngroupedThings.ungroupedThingsOrder = newDestinationOrder;
   }

   reorderUngroupedThings({
      variables: reorderUngroupedVariables,
      optimisticResponse: reorderUngroupedOptimisticResponse
   });
};

export { reorderTagsHandler };

const reorderGroupsHandler = (
   source,
   newSourceOrder,
   destination,
   newDestinationOrder,
   reorderGroups,
   collectionID,
   reorderUngroupedThings
) => {
   // First we handle reordering normal groups, which is to say, not the ungrouped things group
   const reorderVariables = {};
   const reorderOptimisticResponse = {
      __typename: 'Mutation',
      reorderGroups: []
   };

   if (source.droppableId !== 'ungrouped') {
      // If the source group isn't ungrouped things, we add the relevant variables for it to our objects
      reorderVariables.groupOneID = source.droppableId;
      reorderVariables.newOrderOne = newSourceOrder;

      reorderOptimisticResponse.reorderGroups.push({
         __typename: 'CollectionGroup',
         id: source.droppableId,
         order: newSourceOrder
      });
   }

   if (
      destination.droppableId !== source.droppableId &&
      destination.droppableId !== 'ungrouped'
   ) {
      // If the destination group isn't ungrouped and it's not the same as the source group, we add the relevant variables for it to our objects
      reorderVariables.groupTwoID = destination.droppableId;
      reorderVariables.newOrderTwo = newDestinationOrder;

      reorderOptimisticResponse.reorderGroups.push({
         __typename: 'CollectionGroup',
         id: destination.droppableId,
         order: newDestinationOrder
      });
   }

   if (
      source.droppableId !== 'ungrouped' ||
      destination.droppableId !== 'ungrouped'
   ) {
      // If at least one of the groups is not the ungrouped or untagged things group, we send off the mutation to reorder it
      reorderGroups({
         variables: reorderVariables,
         optimisticResponse: reorderOptimisticResponse
      });
   }

   // If neither of the provided groups are ungrouped or untagged things, then we're done
   if (
      source.droppableId !== 'ungrouped' &&
      destination.droppableId !== 'ungrouped'
   )
      return;

   // If one is, then we reorder the ungrouped things group. First we set up our objects for the mutation variables and optimistic response
   const reorderUngroupedVariables = {
      collectionID
   };
   const reorderUngroupedOptimisticResponse = {
      __typename: 'Mutation',
      reorderUngroupedThings: {
         __typename: 'Collection',
         id: collectionID
      }
   };

   // Then we need to make our new ungrouped things order
   if (source.droppableId === 'ungrouped') {
      // If we're moving from the ungrouped things group, we set the newSourceOrder to be the newOrder in both the variables and the optimistic response
      reorderUngroupedVariables.newOrder = newSourceOrder;
      reorderUngroupedOptimisticResponse.reorderUngroupedThings.ungroupedThingsOrder = newSourceOrder;
   }

   if (
      destination.droppableId !== source.droppableId &&
      destination.droppableId === 'ungrouped'
   ) {
      // If we're moving to the ungrouped things group, we set the newDestinationORder to be the newOrder in both the variables and the optimistic response
      reorderUngroupedVariables.newOrder = newDestinationOrder;
      reorderUngroupedOptimisticResponse.reorderUngroupedThings.ungroupedThingsOrder = newDestinationOrder;
   }

   reorderUngroupedThings({
      variables: reorderUngroupedVariables,
      optimisticResponse: reorderUngroupedOptimisticResponse
   });
};

export { reorderGroupsHandler };

const moveCardToGroupHandler = (
   moveCardToGroup,
   thingID,
   fromGroupObj,
   toGroupObj
) => {
   // We start by preparing the objects we'll eventually use for our mutation
   const variables = {
      thingID
   };
   const optimisticResponse = {
      __typename: 'Mutation',
      moveCardToGroup: []
   };

   // Then we add the data for the group we're moving the card from
   // We need the data of the thing we're moving so we can put it in our optimistic response
   let thingData;
   if (fromGroupObj.id != null) {
      // Then we need to figure out what things will be in this group after the move
      const newFromGroupThings = [];
      // So we go through each thing in the group
      fromGroupObj.things.forEach(thing => {
         if (thing.id === thingID) {
            // If it's the thing we're moving, we grab its data to use in the optimistic response
            thingData = thing;
         } else {
            // If it's not the thing we're moving, we put it in the array of things that will be in the group after the move
            newFromGroupThings.push(thing);
         }
      });
      // If we're moving from the ungrouped things group, we don't need to send data about the from group along with the mutation. But if it's from a different group, we do
      if (fromGroupObj.id !== 'ungrouped') {
         variables.fromGroupID = fromGroupObj.id;
         optimisticResponse.moveCardToGroup.push({
            __typename: 'CollectionGroup',
            id: fromGroupObj.id,
            things: newFromGroupThings
         });
      }
   }

   // If the group we're moving the card to is different from the one we're moving it from, we add the data for that group as well. This should always be the case, because we only call this function when we're moving a card from one group to another, but let's just be sure.
   if (fromGroupObj.id !== toGroupObj.id && toGroupObj.id != null) {
      // We have a different function that handles removing cards from a group by dragging them to the ungrouped things group, so we don't handle that here
      if (toGroupObj.id !== 'ungrouped') {
         variables.toGroupID = toGroupObj.id;
         optimisticResponse.moveCardToGroup.push({
            __typename: 'CollectionGroup',
            id: toGroupObj.id,
            things: [...toGroupObj.things, thingData]
         });
      }
   }

   moveCardToGroup({
      variables,
      optimisticResponse
   });
};

export { moveCardToGroupHandler };

const addTagToCard = (addTaxToThingById, thingID, fromGroupObj, toGroupObj) => {
   if (
      fromGroupObj == null ||
      fromGroupObj.things == null ||
      toGroupObj.id == null
   )
      return;

   const variables = {
      thingID,
      personal: false
   };

   const [thingData] = fromGroupObj.things.filter(
      thing => thing.id === thingID
   );

   if (fromGroupObj.id !== toGroupObj.id) {
      if (toGroupObj.id !== 'untagged') {
         variables.tax = toGroupObj.id;

         thingData.partOfTags.push({
            __typename: 'Tag',
            id: toGroupObj.id,
            title: toGroupObj.title
         });
      } else {
      }
   }

   const optimisticResponse = {
      __typename: 'Mutation',
      addTaxToThingById: thingData
   };

   addTaxToThingById({
      variables,
      optimisticResponse
   });
};

export { addTagToCard };

const prepareProvidedData = (
   source,
   destination,
   groupElements,
   groupSort,
   groupByTag,
   tagColumnOrders,
   columnOrders,
   type,
   rawDraggableId
) => {
   // We need to pull the things in the source and destination groups out of the groupElements array and then attach them to the source and destination groups we're passing to handleDragEnd
   if (source != null && type === 'card') {
      const [sourceGroupElement] = groupElements.filter(
         el => el.props.groupObj.id === source.droppableId
      );
      source.groupObj = sourceGroupElement.props.groupObj;
      const idList = source.groupObj.things.map(thing => thing.id);
      source.order = groupSort(idList, source.groupObj.order);
   }

   if (source != null && type === 'group') {
      // We need to add the order for the source group to its object here

      if (groupByTag) {
         // If we're grouped by tag, we want the relevant tag order
         const thisOrderIndex = tagColumnOrders.findIndex(
            orderObj => orderObj.id === source.droppableId
         );
         source.order = tagColumnOrders[thisOrderIndex].order;
      } else {
         // Otherwise we want the relevant regular column order
         const thisOrderIndex = columnOrders.findIndex(
            orderObj => orderObj.id === source.droppableId
         );
         source.order = columnOrders[thisOrderIndex].order;
      }
   }

   if (destination != null && type === 'card') {
      const [destinationGroupElement] = groupElements.filter(
         el => el.props.groupObj.id === destination.droppableId
      );
      destination.groupObj = destinationGroupElement.props.groupObj;
      const idList = destination.groupObj.things.map(thing => thing.id);
      destination.order = groupSort(idList, destination.groupObj.order);
   }

   if (destination != null && type === 'group') {
      // We need to add the order for the destination group to its object here

      if (groupByTag) {
         // If we're grouped by tag, we want the relevant tag order
         const thisOrderIndex = tagColumnOrders.findIndex(
            orderObj => orderObj.id === destination.droppableId
         );
         destination.order = tagColumnOrders[thisOrderIndex].order;
      } else {
         // Otherwise we want the relevant regular column order
         const thisOrderIndex = columnOrders.findIndex(
            orderObj => orderObj.id === destination.droppableId
         );
         destination.order = columnOrders[thisOrderIndex].order;
      }
   }

   const draggableId = getDraggableId(rawDraggableId);

   return {
      source,
      destination,
      draggableId
   };
};
export { prepareProvidedData };

const reorderColumnsHandler = (
   source,
   destination,
   draggableId,
   groupByTag,
   collectionID,
   columnOrders,
   tagColumnOrders,
   setColumnOrder
) => {
   // We aren't going to support removing groups by dragging to empty space, because that's too similar to what it's like to drag into a column, and removing groups is easy enough already. So if the destination is null, we're just going to back out.
   if (destination == null) return;

   // If the group is dropped back where it started, we don't need to do anything. This needs to stay below the destination == null check or else destination might be undefined
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   )
      return;

   // Otherwise, we need to rearrange the groups. First we need to get the new orders for the source and destination groups
   const [newSourceOrder, newDestinationOrder] = getNewOrders(
      source,
      destination,
      draggableId,
      false
   );

   // Then we start forming our objects for the mutation variables. We won't need an optimistic response because we're going to edit columnOrders directly. We're doing it this way so we can start with the data we need for rearranging a single column and add the data we need for moving into a second column if necessary
   const columnOrderVariables = {
      columnIDs: [source.droppableId],
      newOrders: [newSourceOrder],
      isTagOrder: groupByTag,
      collectionID
   };

   const currentColumnOrder = groupByTag ? tagColumnOrders : columnOrders;

   // We're going to update columnOrders directly instead of doing an optimistic response, but only for the source group for now
   const sourceIndex = currentColumnOrder.findIndex(
      orderObj => orderObj.id === source.droppableId
   );
   currentColumnOrder[sourceIndex].order = newSourceOrder;

   if (source.droppableId !== destination.droppableId) {
      // If the source and destination are different, now we add in the data for the destination group
      columnOrderVariables.columnIDs.push(destination.droppableId);
      columnOrderVariables.newOrders.push(newDestinationOrder);

      // And update columnOrders
      const destinationIndex = currentColumnOrder.findIndex(
         orderObj => orderObj.id === destination.droppableId
      );
      currentColumnOrder[destinationIndex].order = newDestinationOrder;
   }

   setColumnOrder({
      variables: columnOrderVariables
   });
};

export { reorderColumnsHandler };

const reorderCardsHandler = (
   source,
   destination,
   groupByTag,
   collectionID,
   draggableId,
   addTaxToThingById,
   removeTaxFromThing,
   things,
   tagOrders,
   reorderTags,
   reorderGroups,
   reorderUngroupedThings,
   moveCardToGroup
) => {
   // If the destination is empty, or if the card is dragged to one of the null groups (and it's not being rearranged within that null group, or from one of the null groups), we want to remove it from the group
   if (
      source.droppableId !== 'untagged' &&
      source.droppableId !== 'ungrouped' && // If it's not from a null group
      (destination == null || // And it's going to an empty space
         ((destination.droppableId === 'untagged' ||
            destination.droppableId === 'ungrouped') && // or one of the null groups
            source.droppableId !== destination.droppableId)) // and it's not going to the same group it started in
   ) {
      if (groupByTag) {
         untagCard(draggableId, things, source.droppableId, removeTaxFromThing);
      }
      // We don't need to ungroup a card if we're using manual groups, because the moveCardToGroup function will do that for us
   }

   // If the destination is null, that's all we want to do
   if (destination == null) return;

   // If the card is dropped back where it started, we don't need to do anything. This needs to stay below the destination == null checks or else destination might be undefined
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   )
      return;

   // Then we need to update the orders of the respective groups. The getNewOrders function still works if the groups are the same.
   const [newSourceOrder, newDestinationOrder] = getNewOrders(
      source,
      destination,
      draggableId,
      groupByTag && source.droppableId !== destination.droppableId
   );

   if (groupByTag) {
      reorderTagsHandler(
         source,
         newSourceOrder,
         destination,
         newDestinationOrder,
         reorderTags,
         collectionID,
         addTaxToThingById,
         tagOrders
      );
   } else {
      reorderGroupsHandler(
         source,
         newSourceOrder,
         destination,
         newDestinationOrder,
         reorderGroups,
         collectionID,
         reorderUngroupedThings
      );
   }

   // If the thing was dragged onto a different group from where it started, add it to that group, and if it's a manual group, remove it from the original group
   if (
      destination.droppableId !== source.droppableId &&
      destination.droppableId !== 'untagged'
   ) {
      if (groupByTag === true) {
         addTagToCard(
            addTaxToThingById,
            draggableId,
            source.groupObj,
            destination.groupObj
         );
      } else {
         moveCardToGroupHandler(
            moveCardToGroup,
            draggableId,
            source.groupObj,
            destination.groupObj
         );
      }
   }
};

export { reorderCardsHandler };
