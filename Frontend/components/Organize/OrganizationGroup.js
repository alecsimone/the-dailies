import { Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useState, useRef, useContext } from 'react';
import OrganizationCard from './OrganizationCard';
import X from '../Icons/X';
import TaxInput from '../ThingParts/TaxInput';
import { OrganizeContext } from '../../pages/organize';
import {
   renameGroup,
   hideGroup,
   removeGroup
} from '../../lib/organizeHandling';

const StyledCardList = styled.div`
   .blankSpace {
      background: ${props => props.theme.midBlack};
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
   }
`;

const StyledOrganizationGroup = styled.div`
   input.addTax {
      font-size: ${props => props.theme.smallText};
      margin-bottom: 2rem;
   }
`;

const OrganizationGroup = ({ groupObj, order }) => {
   const [groupTitle, setGroupTitle] = useState(groupObj.title);
   const titleRef = useRef(null);
   const groupRef = useRef(null);

   const {
      allThings,
      userGroups,
      setStateHandler,
      hiddenThings,
      hiddenTags,
      hiddenGroups
   } = useContext(OrganizeContext);

   if (order != null) {
      groupObj.things.sort((a, b) => {
         const [aData] = allThings.filter(thing => thing.id === a);
         const [bData] = allThings.filter(thing => thing.id === b);

         if (aData == null) return 1;
         if (bData == null) return -1;

         const aIndex = order.indexOf(aData.id);
         const bIndex = order.indexOf(bData.id);

         if (aIndex === -1) {
            return 1;
         }

         if (bIndex === -1) {
            return -1;
         }

         return aIndex - bIndex;
      });
   }

   let universalTags = [];
   const filteredThings = groupObj.things.filter(thing => {
      if (typeof thing === 'string') {
         if (hiddenThings.includes(thing)) return false;
      } else if (hiddenThings.includes(thing.id)) return false;
      return true;
   });
   const cards = filteredThings.map((thing, index) => {
      if (typeof thing === 'string') {
         const [thisThing] = allThings.filter(
            thingData => thingData.id === thing
         );
         if (thisThing == null) return null;
         if (index === 0) {
            universalTags = thisThing.partOfTags;
         } else {
            universalTags = universalTags.filter(tag => {
               let tagPresent = false;
               thisThing.partOfTags.forEach(thingTag => {
                  if (tag.id === thingTag.id) {
                     tagPresent = true;
                  }
               });
               return tagPresent;
            });
         }
         return (
            <OrganizationCard
               thing={thisThing}
               groupId={groupObj.id}
               index={index}
            />
         );
      }
      if (index === 0) {
         universalTags = thing.partOfTags;
      }
      return (
         <OrganizationCard
            thing={thing}
            groupId={groupObj.id}
            index={index}
            key={thing.id}
         />
      );
   });

   return (
      <StyledOrganizationGroup className="tagGroup" ref={groupRef}>
         <div className="header">
            {(groupObj.type === 'tag' || groupObj.id === 'ungrouped') && (
               <h3>{groupObj.title}</h3>
            )}
            {groupObj.type === 'manual' && groupObj.id !== 'ungrouped' && (
               <input
                  type="text"
                  className="groupTitle"
                  ref={titleRef}
                  value={groupTitle}
                  onChange={e => {
                     setGroupTitle(e.target.value);
                     renameGroup(
                        groupObj.id,
                        e.target.value,
                        userGroups,
                        setStateHandler
                     );
                  }}
                  onKeyDown={e => {
                     if (e.key === 'Enter') {
                        e.preventDefault();
                        titleRef.current.blur();
                     }
                  }}
               />
            )}
            <div className="buttons">
               {hideGroup != null && (
                  <button
                     type="button"
                     onClick={() =>
                        hideGroup(
                           groupObj.id,
                           groupObj.type,
                           setStateHandler,
                           groupObj.type === 'tag' ? hiddenTags : hiddenGroups
                        )
                     }
                  >
                     hide
                  </button>
               )}
               {removeGroup != null && groupObj.id !== 'ungrouped' && (
                  <X
                     onClick={() => {
                        if (
                           !confirm(
                              `Are you sure you want to remove the group ${
                                 groupObj.title
                              }?`
                           )
                        )
                           return;
                        removeGroup(groupObj.id, userGroups, setStateHandler);
                     }}
                  />
               )}
            </div>
         </div>
         <Droppable droppableId={groupObj.id} key={groupObj.id} type="card">
            {provided => (
               <StyledCardList
                  className="droppableWrapper"
                  ref={provided.innerRef}
                  key={groupObj.id}
                  {...provided.droppableProps}
               >
                  {cards.length === 0 && (
                     <div className="blankSpace">
                        Drop cards here to add them to this group
                     </div>
                  )}
                  {cards}
                  {provided.placeholder}
               </StyledCardList>
            )}
         </Droppable>
         {cards.length > 0 && (
            <TaxInput
               id={groupObj.things}
               tags={universalTags}
               personal={false}
               thingData={allThings}
               containerRef={groupRef.current}
            />
         )}
      </StyledOrganizationGroup>
   );
};

export default OrganizationGroup;
