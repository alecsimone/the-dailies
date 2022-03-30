import React, { useRef, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { getRandomString } from '../lib/TextHandling';
import { StyledGroup } from './Collections/styles';

const getItemForID = (id, items) => {
   const [element] = items.filter(
      itemElement => itemElement.props.groupObj.id === id
   );
   return element;
};

const Columnizer = ({
   items,
   columnOrders,
   columnOrderOrder,
   canEdit,
   addItemButtonFunction
}) => {
   // The overflowWrapper should be scrollable by dragging even on non-touch devices. These are some hooks we'll need to facilitate that.
   // The scrollPosRef will keep track of how far we've dragged
   const scrollPosRef = useRef({
      left: 0,
      x: 0
   });
   // Our scrolling state will keep track of whether we're scrolling or not. This is mostly useful as a way of preventing the drag from happening if we start it by clicking on a card/group that's already Draggable in its own right.
   const [scrolling, setScrolling] = useState(false);
   // The scrollerRef will reference the overflowWrapper (or whatever element ends up being the draggable one)
   const scrollerRef = useRef(null);

   // If we didn't get any items, we don't need to do anything, so let's just get out of here.
   if (items.length === 0) return null;

   const makeColumn = (columnOrderObj, index) => {
      // We create the addItemButton with a function so that we can pass the columnToAddToID to it. This ID is just the id from the columnOrderObj, unless it's our blank placeholder column, in which case it's a new random string.
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
            // onScroll={e => console.log(e.target.scrollTop)}
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
                     {columnOrderObj.order.map(columnItem => {
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
      // We only want to scroll if they're clicking on something that's not Draggable itself
      const draggableParent = e.target.closest('[data-rbd-draggable-id]');
      if (draggableParent == null) {
         // If we're going to scroll, we need to update the scrollPosRef to represent the starting mouse position of the drag, and setScrolling to true
         scrollPosRef.current = {
            left: scrollerRef.current.scrollLeft,
            x: e.clientX
         };
         setScrolling(true);
      }
   };

   const dragToScroll = e => {
      if (scrolling) {
         // First we figure out how far the mouse has dragged during this scroll by subtracting the mouse position at the start of the click from its current position
         const dx = e.clientX - scrollPosRef.current.x;
         // scrollPosRef.current.left represents how far the element was scrolled at the start of the drag, and dx represents how far we've dragged so far. So we subtract the dragged distance from the initial scroll value to get the new scroll value.
         scrollerRef.current.scrollLeft = scrollPosRef.current.left - dx;
      }
   };

   const endDragToScroll = e => {
      setScrolling(false);
   };

   // We need to specify the order of the columns, otherwise they'll be rendered in alphabetical order by their ID, which will mess us up if a new column comes before an older one alphabetically.
   const orderedColumnOrders = JSON.parse(JSON.stringify(columnOrders)).sort(
      (a, b) => {
         const aIndex = columnOrderOrder.indexOf(a.id);
         const bIndex = columnOrderOrder.indexOf(b.id);

         if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
         }
         if (aIndex === -1 && bIndex !== -1) {
            return 1;
         }
         if (bIndex === -1 && aIndex !== -1) {
            return -1;
         }
         if (a.id < b.id) {
            return -1;
         }
         return 1;
      }
   );

   const columns = orderedColumnOrders.map((columnOrderObj, index) =>
      makeColumn(columnOrderObj, index)
   );

   // If our last column is not already empty, we want to put an empty column at the end so that users can drag a group into it to create a new column
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
