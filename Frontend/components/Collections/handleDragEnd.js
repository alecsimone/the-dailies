import {
   reorderColumnsHandler,
   reorderCardsHandler,
   prepareProvidedData
} from './dragHelpers';

const handleDragEnd = ({
   collectionID,
   destination,
   source,
   rawDraggableId,
   type,
   things,
   removeTaxFromThing,
   reorderGroups,
   reorderTags,
   reorderUngroupedThings,
   moveCardToGroup,
   addTaxToThingById,
   setColumnOrder,
   columnOrders,
   tagColumnOrders,
   tagOrders,
   groupSort,
   groupElements
}) => {
   // First we need to massage the data that react-beautiful-dnd provides us by adding some more info to the source and destination groups and removing prefixes from the draggableId
   const {
      source: fullSource,
      destination: fullDestination,
      draggableId
   } = prepareProvidedData(
      source,
      destination,
      groupElements,
      groupSort,
      groupByTag,
      tagColumnOrders,
      columnOrders,
      type,
      rawDraggableId
   );

   // If it's a group being rearranged at the column level
   if (type === 'group') {
      reorderColumnsHandler(
         fullSource,
         fullDestination,
         draggableId,
         groupByTag,
         collectionID,
         columnOrders,
         tagColumnOrders,
         setColumnOrder
      );
      return;
   }

   // If it's a card being rearranged at the group level
   if (type === 'card') {
      reorderCardsHandler(
         fullSource,
         fullDestination,
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
      );
   }
};

export default handleDragEnd;
