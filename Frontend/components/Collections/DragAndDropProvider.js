import { useApolloClient, useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import { useContext, useEffect, useRef, useState } from 'react';
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
import { setAlpha } from '../../styles/functions';
import { isTouchEnabled } from './CollectionsCard';
import { ModalContext } from '../ModalProvider';

const StyledDragArea = styled.div`
   height: 100%;
   &.draggingGroup {
      .masonryContainer .column .dropArea {
         /* padding-bottom: 16rem; */
         transition: 0.25s all;
         background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
         .addGroupButton {
            margin: 16rem auto 0 auto;
            transition: margin 0.25s ease-out;
         }
      }
   }
   &.touch {
      &.draggingCard {
         .collectionBody .overflowWrapper {
            overflow-x: hidden;
         }
         section.threeColumns .myThingsBar.visible {
            background: none;
            .dragWrapper {
               opacity: 0;
               &.isBeingDragged {
                  opacity: 1 !important;
               }
            }
         }
      }
   }
`;

const DragAndDropProvider = ({ children }) => {
   const { loggedInUserID } = useMe();

   const [isDraggingGroup, setIsDraggingGroup] = useState(false);
   const [isDraggingCard, setIsDraggingCard] = useState(false);

   const { setThingsSidebarIsOpen } = useContext(ModalContext);

   const dragAreaRef = useRef(null);
   useEffect(() => {
      // We need to do this in an empty dependency effect so that it's not messed up by server side rendering.
      if (isTouchEnabled()) {
         dragAreaRef.current.classList.add('touch');
      }
   }, []);

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
      setIsDraggingGroup(false);
      setIsDraggingCard(false);
      if (type === 'card') {
         const cardBeingDragged = document.querySelector('.isBeingDragged');
         cardBeingDragged.classList.remove('isBeingDragged');
      }
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

   const dragStartHelper = ({ type, draggableId }) => {
      if (type === 'group') {
         setIsDraggingGroup(true);
      } else if (type === 'card') {
         setIsDraggingCard(true);
         const cardBeingDragged = document.querySelector(
            `[data-rbd-draggable-id='${draggableId}']`
         );
         cardBeingDragged.classList.add('isBeingDragged');
      }
      // if (type === 'group') {
      //    const allColumns = document.querySelectorAll(
      //       '.collectionBody .column .dropArea'
      //    );
      //    allColumns.forEach(column => {
      //       column.classList.add('dragging');
      //    });
      // }
   };

   return (
      <DragDropContext onDragEnd={dragEndHelper} onDragStart={dragStartHelper}>
         <StyledDragArea
            className={`dragArea${isDraggingGroup ? ' draggingGroup' : ''}${
               isDraggingCard ? ' draggingCard' : ''
            }${isTouchEnabled() ? ' touch' : ''}`}
            ref={dragAreaRef}
         >
            {children}
         </StyledDragArea>
      </DragDropContext>
   );
};

export default DragAndDropProvider;
