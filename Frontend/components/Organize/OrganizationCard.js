import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';

const StyledCard = styled.div`
   /* display: inline-block; */
   margin-bottom: 2rem;
   background: ${props => props.theme.midBlack};
   width: 100%;
   article {
      width: 100%;
      border-right: none;
      max-width: none;
      &.smallThingCard {
         opacity: 1;
      }
   }
   .hider {
      font-size: ${props => props.theme.miniText};
      padding: 1rem;
      text-align: right;
      button {
         opacity: 0.6;
         padding: 0.5rem;
         &:hover {
            opacity: 1;
         }
      }
   }
`;

const OrganizationCard = ({ thing, groupId, index, hideThing }) => {
   if (thing == null) return null;

   return (
      <Draggable
         draggableId={`${groupId}-${thing.id}`}
         index={index}
         key={thing.id}
      >
         {provided => (
            <StyledCard
               className="cardWrapper"
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               key={thing.id}
            >
               <SmallThingCard data={thing} key={thing.id} borderSide="top" />
               <div className="hider">
                  <button onClick={() => hideThing(thing.id)}>hide</button>
               </div>
            </StyledCard>
         )}
      </Draggable>
   );
};

export default OrganizationCard;
