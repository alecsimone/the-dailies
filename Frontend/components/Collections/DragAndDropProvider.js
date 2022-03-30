import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { DragDropContext } from 'react-beautiful-dnd';
import useMe from '../Account/useMe';
import {
   addThingToGroup,
   discardCard,
   discardGroup,
   moveCardToGroupHandler,
   moveGroupToColumnHandler,
   reorderCards,
   reorderColumnHandler
} from './dragHelpers';
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

   const client = useApolloClient();

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

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
      if (type === 'group') {
         const allColumns = document.querySelectorAll(
            '.collectionBody .column .dropArea'
         );
         allColumns.forEach(column => {
            column.classList.remove('dragging');
         });
      }

      const dashLocation = draggableId.lastIndexOf('-');
      const itemID = draggableId.substring(dashLocation + 1);

      if (type === 'card') {
         if (destination == null) {
            discardCard(client, source, itemID, moveCardToGroup);
         } else if (source.droppableId === 'MyThings') {
            if (destination.droppableId === 'MyThings') return; // You can't reorder things within the myThings bar

            addThingToGroup(
               client,
               destination,
               itemID,
               loggedInUserID,
               addLinkToCollectionGroup
            );
         } else if (source.droppableId === destination.droppableId) {
            reorderCards(client, source, destination, itemID, reorderGroup);
         } else {
            moveCardToGroupHandler(
               client,
               source,
               destination,
               draggableId,
               itemID,
               moveCardToGroup
            );
         }
      } else if (type === 'group') {
         if (destination == null) {
            if (!confirm('Are you sure you want to delete that group?')) return;
            discardGroup(client, itemID, deleteGroupFromCollection);
         } else if (source.droppableId === destination.droppableId) {
            reorderColumnHandler(
               client,
               source,
               destination,
               itemID,
               reorderColumn
            );
         } else {
            moveGroupToColumnHandler(
               client,
               source,
               destination,
               itemID,
               moveGroupToColumn
            );
         }
      } else {
         console.log("I don't know what you just dragged");
      }
   };

   const dragStartHelper = ({ source, type, draggableId, mode }) => {
      if (type === 'group') {
         const allColumns = document.querySelectorAll(
            '.collectionBody .column .dropArea'
         );
         allColumns.forEach(column => {
            column.classList.add('dragging');
         });
      }
   };

   return (
      <DragDropContext onDragEnd={dragEndHelper} onDragStart={dragStartHelper}>
         {children}
      </DragDropContext>
   );
};

export default DragAndDropProvider;
