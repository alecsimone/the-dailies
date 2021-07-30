import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useState, useContext } from 'react';
import SmallThingCard from '../ThingCards/SmallThingCard';
import { OrganizeContext } from '../../pages/organize';
import {
   hideThing,
   copyThingToGroupByID,
   expandThingCallback
} from '../../lib/organizeHandling';

const StyledCard = styled.div`
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      &.noCopy {
         justify-content: flex-end;
      }
      button {
         opacity: 0.6;
         padding: 0.5rem;
         &:hover {
            opacity: 1;
         }
      }
      .copyInterface {
         display: flex;
         align-items: center;
         select {
            padding: 0.5rem;
            padding-right: 4rem;
            margin-left: 2rem;
            font-size: ${props => props.theme.miniText};
            cursor: pointer;
         }
         option {
         }
      }
   }
`;

const OrganizationCard = ({ thing, groupId, index }) => {
   const [showingCopyTargets, setShowingCopyTargets] = useState(false);
   const {
      userGroups,
      expandedCards,
      groupByTag,
      hiddenThings,
      setStateHandler
   } = useContext(OrganizeContext);

   if (thing == null) return null;
   if (hiddenThings.includes(thing.id)) return null;

   // We need to make the options for the copy to group interface. You can't copy to a group that the thing is already in, so first we need to filter those groups out of the master groups list
   let filteredGroups = [];
   if (userGroups != null && userGroups.length > 0) {
      filteredGroups = userGroups.filter(
         groupObj => !groupObj.things.includes(thing.id)
      );
   }

   // Then we need to make an option element for each remaining group
   const copyToGroupOptions = filteredGroups.map(groupObj => (
      <option value={groupObj.id} key={groupObj.id}>
         {groupObj.title}
      </option>
   ));

   const groupsContainingThing = userGroups.filter(groupObj =>
      groupObj.things.includes(thing.id)
   );

   const expandThingHandler = newValue => {
      expandThingCallback(
         thing.id,
         groupId,
         newValue,
         expandedCards,
         setStateHandler
      );
   };

   const [isExpanded] = expandedCards.filter(
      expansionObj =>
         expansionObj.thingID === thing.id && expansionObj.groupID === groupId
   );

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
               <SmallThingCard
                  data={thing}
                  key={thing.id}
                  borderSide="top"
                  expansionCallback={expandThingHandler}
                  defaultExpansion={isExpanded != null}
               />
               <div
                  className={
                     filteredGroups.length > 0 ? 'hider' : 'hider noCopy'
                  }
               >
                  {filteredGroups.length > 0 && (
                     <div className="copyInterface">
                        <button
                           onClick={() =>
                              setShowingCopyTargets(!showingCopyTargets)
                           }
                        >
                           {showingCopyTargets ? 'close' : 'copy'}
                        </button>
                        {showingCopyTargets && (
                           <select
                              value={null}
                              onChange={e => {
                                 if (
                                    e.target.value != null &&
                                    e.target.value !== ''
                                 ) {
                                    copyThingToGroupByID(
                                       thing.id,
                                       e.target.value,
                                       userGroups,
                                       setStateHandler
                                    );
                                    setShowingCopyTargets(false);
                                 }
                              }}
                           >
                              <option value={null} />
                              {copyToGroupOptions}
                           </select>
                        )}
                     </div>
                  )}
                  <button
                     type="button"
                     onClick={() =>
                        hideThing(
                           thing.id,
                           groupId,
                           userGroups,
                           groupByTag,
                           hiddenThings,
                           setStateHandler
                        )
                     }
                  >
                     {groupsContainingThing.length > 1
                        ? 'remove from group'
                        : 'hide'}
                  </button>
               </div>
            </StyledCard>
         )}
      </Draggable>
   );
};

export default OrganizationCard;
