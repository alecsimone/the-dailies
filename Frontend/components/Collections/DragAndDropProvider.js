import { DragDropContext } from 'react-beautiful-dnd';

const DragAndDropProvider = ({ children }) => {
   const dragEndHelper = () => {
      console.log('looks like you dropped something');
   };

   return (
      <DragDropContext onDragEnd={dragEndHelper}>{children}</DragDropContext>
   );
};

export default DragAndDropProvider;
