import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import OrganizationCard from './OrganizationCard';

const StyledCardList = styled.div``;

const OrganizationGroup = ({ groupObj, setStateHandler, order }) => {
   if (order != null) {
      groupObj.things.sort((a, b) => {
         const aIndex = order.indexOf(a.id);
         const bIndex = order.indexOf(b.id);

         if (aIndex === -1) {
            return 1;
         }

         if (bIndex === -1) {
            return -1;
         }

         return aIndex - bIndex;
      });
   }

   const cards = groupObj.things.map((thing, index) => (
      <OrganizationCard
         thing={thing}
         groupId={groupObj.id}
         index={index}
         setStateHandler={setStateHandler}
      />
   ));

   return (
      <div className="tagGroup">
         <div className="header">
            <h3>{groupObj.title}</h3>
            <button
               onClick={() =>
                  setStateHandler('hiddenTags', [...hiddenTags, groupObj.id])
               }
            >
               hide
            </button>
         </div>
         <Droppable droppableId={groupObj.id}>
            {provided => (
               <StyledCardList
                  className="droppableWrapper"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
               >
                  {cards}
                  {provided.placeholder}
               </StyledCardList>
            )}
         </Droppable>
      </div>
   );
};

export default OrganizationGroup;
