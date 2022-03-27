import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { getRandomString } from '../lib/TextHandling';
import {
   desktopBreakpointPx,
   bigScreenBreakpointPx
} from '../styles/functions';
import { StyledGroup } from './Collections/styles';

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

const Columnizer = ({
   items,
   columnOrders,
   canEdit,
   addItemButtonFunction
}) => {
   if (items.length === 0) return null;

   const makeColumn = (columnOrderObj, index) => {
      const addItemButton = addItemButtonFunction(
         columnOrderObj.id != null && columnOrderObj.id !== 'blankColumn'
            ? columnOrderObj.id
            : getRandomString(25)
      );

      return (
         <div
            id={`id-${columnOrderObj.id}`}
            className="column"
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
                     className="dropArea"
                  >
                     {columnOrderObj.order.length === 0 && (
                        <StyledGroup className="blankGroup">
                           Drop groups here to add
                           {columnOrderObj.id === 'blankColumn'
                              ? ' a new '
                              : ' them to this '}
                           column
                        </StyledGroup>
                     )}
                     {columnOrderObj.order.map((columnItem, itemIndex) => {
                        const itemElement = getItemForID(columnItem, items);

                        if (itemElement == null) {
                           return null;
                        }

                        return itemElement;
                     })}
                     {provided.placeholder}
                     {addItemButton}
                  </div>
               )}
            </Droppable>
         </div>
      );
   };

   // const makeColumnProper = (columnOrderObj, index) => (
   //    <div
   //       id={`id-${columnOrderObj.id}`}
   //       className="column"
   //       key={`columnizerColumn-${index}`}
   //    >
   //       <Droppable
   //          droppableId={columnOrderObj.id}
   //          isDropDisabled={!canEdit}
   //          key={index}
   //          type="group"
   //       >
   //          {provided => (
   //             <div
   //                ref={provided.innerRef}
   //                key={index}
   //                {...provided.droppableProps}
   //                className="dropArea"
   //             >
   //                {columnOrderObj.order.length === 0 && (
   //                   <StyledGroup className="blankGroup">
   //                      Drop groups here to add
   //                      {columnOrderObj.id === 'blankColumn'
   //                         ? ' a new '
   //                         : ' them to this '}
   //                      column
   //                   </StyledGroup>
   //                )}
   //                {columnOrderObj.order.map((columnItem, itemIndex) => {
   //                   const itemElement = getItemForID(columnItem, items);

   //                   if (itemElement == null) {
   //                      return null;
   //                   }

   //                   return (
   //                      <Draggable
   //                         draggableId={`${index}-${
   //                            itemElement.props.groupObj.id
   //                         }`}
   //                         isDragDisabled={!canEdit}
   //                         index={itemIndex}
   //                         key={`${index}-${itemElement.props.groupObj.id}`}
   //                      >
   //                         {dragProvided => (
   //                            <div
   //                               {...dragProvided.draggableProps}
   //                               {...dragProvided.dragHandleProps}
   //                               ref={dragProvided.innerRef}
   //                               key={itemIndex}
   //                               className="groupContainer"
   //                            >
   //                               {itemElement}
   //                            </div>
   //                         )}
   //                      </Draggable>
   //                   );
   //                })}
   //                {provided.placeholder}
   //             </div>
   //          )}
   //       </Droppable>
   //    </div>
   // );

   const columns = columnOrders.map((columnOrderObj, index) =>
      makeColumn(columnOrderObj, index)
   );

   if (
      columnOrders.length > 0 &&
      columnOrders[columnOrders.length - 1].order.length > 0
   ) {
      const blankColumnOrderObj = {
         __typename: 'ColumnOrder',
         id: 'blankColumn',
         order: []
      };
      const blankColumn = makeColumn(blankColumnOrderObj, columnOrders.length);
      columns.push(blankColumn);
   }

   return (
      <div className="overflowWrapper">
         <div className="masonryContainer">{columns}</div>
      </div>
   );
};
export default Columnizer;
