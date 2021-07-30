import { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
   desktopBreakpointPx,
   bigScreenBreakpointPx
} from '../styles/functions';

const getColumnCount = () => {
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

const getItemForID = (id, items) => {
   const [element] = items.filter(
      itemElement => itemElement.props.groupObj.id === id
   );
   return element;
};

const Columnizer = ({ items, columnOrders, defaultGroupOrderRef }) => {
   const [columnCount, setColumnCount] = useState(getColumnCount());

   const resizeHandler = () => setColumnCount(getColumnCount());

   useEffect(() => {
      if (window == null) return;

      window.addEventListener('resize', resizeHandler);
      return () => window.removeEventListener('resize', resizeHandler);
   }, [resizeHandler]);

   // Then we make an array with a length of our columnCount (but no more than the number of items we have so we don't get empty columns) full of empty arrays
   const columnsArray = [];
   const newOrderArray = [];
   for (let i = 0; i < columnCount && i < items.length; i++) {
      columnsArray.push([]);
      newOrderArray.push([]);
   }

   // Now we loop through our items and put them into their columns
   items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columnsArray[columnIndex].push(item);
      newOrderArray[columnIndex].push(item.props.groupObj.id);
   });
   defaultGroupOrderRef.current = newOrderArray;

   let columns;
   if (columnOrders == null || columnOrders.length === 0) {
      columns = columnsArray.map((columnItems, index) => (
         <div
            className="column"
            style={{ width: `${100 / columnCount}%` }}
            key={`columnizerColumn-${index}`}
         >
            <Droppable droppableId={`${index}`} key={index} type="group">
               {provided => (
                  <div
                     ref={provided.innerRef}
                     key={index}
                     {...provided.droppableProps}
                  >
                     {columnItems.map((columnItem, itemIndex) => (
                        <Draggable
                           draggableId={`${index}-${
                              columnItem.props.groupObj.id
                           }`}
                           index={itemIndex}
                           key={`${index}-${columnItem.props.groupObj.id}`}
                        >
                           {dragProvided => (
                              <div
                                 {...dragProvided.draggableProps}
                                 {...dragProvided.dragHandleProps}
                                 ref={dragProvided.innerRef}
                                 key={itemIndex}
                              >
                                 {columnItem}
                              </div>
                           )}
                        </Draggable>
                     ))}
                     {provided.placeholder}
                  </div>
               )}
            </Droppable>
         </div>
      ));
   } else {
      const notYetOrderedGroups = items.filter(item => {
         let groupIsOrdered = false;
         columnOrders.forEach(orderArray => {
            if (orderArray.includes(item.props.groupObj.id)) {
               groupIsOrdered = true;
            }
         });
         return !groupIsOrdered;
      });

      const allColumnData = [...columnOrders];
      notYetOrderedGroups.forEach(groupElement => {
         // Get the approximate height of each column
         const columnHeights = allColumnData.map(columnItemsArray => {
            let columnHeight = 1;
            columnItemsArray.forEach(itemID => {
               const itemElement = getItemForID(itemID, items);
               if (
                  itemElement != null &&
                  itemElement.props != null &&
                  itemElement.props.groupObj != null &&
                  itemElement.props.groupObj.things != null
               ) {
                  const { length } = itemElement.props.groupObj.things;
                  if (length === 0) {
                     columnHeight += 1;
                  } else if (length === 1) {
                     columnHeight += 2;
                  } else {
                     columnHeight += length;
                  }
               }
            });
            return columnHeight;
         });

         // Add the new element to the shortest column. First we have to figure out which column is the shortest
         let lowestValueIndex = 0;
         let currentLowestValue = columnHeights[0];
         columnHeights.forEach((height, index) => {
            if (height < currentLowestValue) {
               currentLowestValue = columnHeights[index];
               lowestValueIndex = index;
            }
         });

         // Then we push the current element into it
         allColumnData[lowestValueIndex].push(groupElement.props.groupObj.id);
      });

      columns = allColumnData.map((columnItems, index) => (
         <div
            className="column"
            style={{ width: `${100 / columnCount}%` }}
            key={`columnizerColumn-${index}`}
         >
            <Droppable droppableId={`${index}`} key={index} type="group">
               {provided => (
                  <div
                     ref={provided.innerRef}
                     key={index}
                     {...provided.droppableProps}
                  >
                     {columnItems.length === 0 && (
                        <div className="blankGroup">
                           Drop groups here to add them to this column
                        </div>
                     )}
                     {columnItems.map((columnItem, itemIndex) => {
                        const itemElement = getItemForID(columnItem, items);

                        return (
                           <Draggable
                              draggableId={`${index}-${
                                 itemElement.props.groupObj.id
                              }`}
                              index={itemIndex}
                              key={`${index}-${itemElement.props.groupObj.id}`}
                           >
                              {dragProvided => (
                                 <div
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    ref={dragProvided.innerRef}
                                    key={itemIndex}
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
   }

   return <div className="masonryContainer">{columns}</div>;
};
export default Columnizer;
