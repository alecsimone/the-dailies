import { useState, useEffect } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useMutation } from '@apollo/react-hooks';
import {
   desktopBreakpointPx,
   bigScreenBreakpointPx
} from '../styles/functions';
import { getRandomString } from '../lib/TextHandling';
import { SET_COLUMN_ORDER_MUTATION } from './Collections/queriesAndMutations';
import { StyledGroup } from './Collections/styles';
import LoadingRing from './LoadingRing';
import { getShortestColumnIndex } from './Collections/CollectionBody';
import { getShortestColumnID } from './Collections/CollectionsHeader';

const getColumnCount = () => {
   if (!process.browser) return 1;
   let columnCount = 1;
   if (window != null) {
      if (window.innerWidth >= bigScreenBreakpointPx) {
         columnCount = 3;
      } else if (window.innerWidth >= desktopBreakpointPx) {
         columnCount = 2;
      }
   }
   return columnCount;
};
export { getColumnCount };

const getItemForID = (id, items) => {
   const [element] = items.filter(
      itemElement => itemElement.props.groupObj.id === id
   );
   return element;
};

const Columnizer = ({ items, columnOrders, draggingGroup, canEdit }) => {
   const [columnCount, setColumnCount] = useState(getColumnCount());

   const resizeHandler = () => setColumnCount(getColumnCount());

   useEffect(() => {
      if (window == null) return;

      window.addEventListener('resize', resizeHandler);
      return () => window.removeEventListener('resize', resizeHandler);
   }, [resizeHandler]);

   if (items.length === 0) return null;

   // If we have more columnOrders than the current columnCount, we need to distribute the groups from the excess columns into the necessary columns
   const necessaryOrders = [...columnOrders];
   if (
      necessaryOrders.length > columnCount ||
      necessaryOrders.length > items.length
   ) {
      // First we figure out which is lower, the number of columns we have or the number of items
      const lowerNumber =
         columnCount < items.length ? columnCount : items.length;

      // Then we need to create an array which will hold any columns we don't have room for, so we can redistribute their items later
      let uncolumnedItems = [];

      // And we need to figure out how many unnecessary columns we have
      const unnecessaryOrdersCount = necessaryOrders.length - lowerNumber;

      // Then we need to remove that many columns, starting with any empty columns and then working back from the end of the array
      for (let i = unnecessaryOrdersCount; i > 0; i -= 1) {
         // First we check for any empty columns
         let columnToRemoveIndex = necessaryOrders.findIndex(
            column => column?.order?.length === 0
         );

         // If we don't have any empty columns, we take from the end of the array
         if (columnToRemoveIndex === -1) {
            columnToRemoveIndex = necessaryOrders.length - 1;
         }

         const removedColumns = necessaryOrders.splice(columnToRemoveIndex, 1);
         uncolumnedItems = uncolumnedItems.concat(removedColumns[0].order);
      }

      uncolumnedItems.forEach(item => {
         const shortestColumnID = getShortestColumnID(necessaryOrders);
         const shortestColumnIndex = necessaryOrders.findIndex(
            columnData => columnData.id === shortestColumnID
         );
         necessaryOrders[shortestColumnIndex].order.push(item);
      });
   }

   const columns = necessaryOrders.map((columnOrderObj, index) => (
      <div
         id={`id-${columnOrderObj.id}`}
         className="column"
         style={{ width: `${100 / columnCount}%` }}
         key={`columnizerColumn-${index}`}
      >
         <Droppable
            droppableId={columnOrderObj.id}
            isDropDisabled={!canEdit}
            key={index}
            type="group"
         >
            {provided => (
               <div
                  ref={provided.innerRef}
                  key={index}
                  {...provided.droppableProps}
                  className={draggingGroup ? 'dragging' : 'notDragging'}
               >
                  {columnOrderObj.order.length === 0 && (
                     <StyledGroup className="blankGroup">
                        Drop groups here to add them to this column
                     </StyledGroup>
                  )}
                  {columnOrderObj.order.map((columnItem, itemIndex) => {
                     const itemElement = getItemForID(columnItem, items);

                     if (itemElement == null) {
                        return null;
                     }

                     return (
                        <Draggable
                           draggableId={`${index}-${
                              itemElement.props.groupObj.id
                           }`}
                           isDragDisabled={!canEdit}
                           index={itemIndex}
                           key={`${index}-${itemElement.props.groupObj.id}`}
                        >
                           {dragProvided => (
                              <div
                                 {...dragProvided.draggableProps}
                                 {...dragProvided.dragHandleProps}
                                 ref={dragProvided.innerRef}
                                 key={itemIndex}
                                 className="groupContainer"
                              >
                                 {itemElement}
                              </div>
                           )}
                        </Draggable>
                     );
                  })}
                  {provided.placeholder}
               </div>
            )}
         </Droppable>
      </div>
   ));
   // }

   return <div className="masonryContainer">{columns}</div>;
};
export default Columnizer;
