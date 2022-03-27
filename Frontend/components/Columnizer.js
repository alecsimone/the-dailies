import React, { useRef, useState } from 'react';
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
   const scrollPosRef = useRef({
      left: 0,
      x: 0
   });
   const [scrolling, setScrolling] = useState(false);
   const scrollerRef = useRef(null);

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

   const startDragToScroll = e => {
      // If they're clicking on something that's draggable, we don't want to scroll
      const draggableParent = e.target.closest('[data-rbd-draggable-id]');
      if (draggableParent == null) {
         scrollPosRef.current = {
            left: scrollerRef.current.scrollLeft,
            x: e.clientX
         };
         setScrolling(true);
      }
   };

   const dragToScroll = e => {
      if (scrolling) {
         const dx = e.clientX - scrollPosRef.current.x;
         scrollerRef.current.scrollLeft = scrollPosRef.current.left - dx;
      }
   };

   const endDragToScroll = e => {
      setScrolling(false);
   };

   const orderedColumnOrders = JSON.parse(JSON.stringify(columnOrders)).sort(
      (a, b) => {
         // const aIndex = columnOrderOrder.indexOf(a.id);
         // const bIndex = columnOrderOrder.indexOf(b.id);

         // if (aIndex !== -1 && bIndex !== -1) {
         //    return aIndex - bIndex;
         // }
         // if (aIndex === -1 && bIndex !== -1) {
         //    return 1;
         // }
         // if (bIndex === -1 && aIndex !== -1) {
         //    return -1;
         // }
         if (a.id < b.id) {
            return -1;
         }
         return 1;
      }
   );

   const columns = orderedColumnOrders.map((columnOrderObj, index) =>
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
      <div
         className={scrolling ? 'overflowWrapper scrolling' : 'overflowWrapper'}
         ref={scrollerRef}
         onMouseDown={startDragToScroll}
         onMouseMove={dragToScroll}
         onMouseUp={endDragToScroll}
      >
         <div className="masonryContainer">{columns}</div>
      </div>
   );
};
export default Columnizer;
