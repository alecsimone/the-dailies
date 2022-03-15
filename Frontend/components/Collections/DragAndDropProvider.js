import { DragDropContext } from 'react-beautiful-dnd';

const DragAndDropProvider = ({ children }) => {
   const dragEndHelper = ({ source, destination, draggableId, type }) => {
      console.log(source, destination, draggableId);

      const dashLocation = draggableId.lastIndexOf('-');
      const itemID = draggableId.substring(dashLocation + 1);

      if (type === 'card') {
         if (draggableId.startsWith('thingCard')) {
            console.log(`you dragged a thing card with id ${itemID}`);
         } else {
            console.log(`you dragged a link card with id ${itemID}`);
         }
         if (destination == null) {
            console.log("you're getting rid of it!");
         } else if (source.droppableId === 'MyThings') {
            if (destination.droppableId === 'MyThings') {
               // You can't reorder things within the myThings bar
               return;
            }
            console.log("You're adding it to a collection!");
         } else if (source.droppableId === destination.droppableId) {
            console.log("you're reordering it!");
         } else {
            console.log("you're moving it!");
         }
      } else if (type === 'group') {
         console.log(`you dragged a group with ID ${itemID}`);
         if (destination == null) {
            console.log("you're getting rid of it!");
         } else if (source.droppableId === destination.droppableId) {
            console.log("you're reordering it!");
         } else {
            console.log("you're moving it!");
         }
      } else {
         console.log("I don't know what you just dragged");
      }
   };

   return (
      <DragDropContext onDragEnd={dragEndHelper}>{children}</DragDropContext>
   );
};

export default DragAndDropProvider;
