import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useState, useRef, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import OrganizationCard from './OrganizationCard';
import X from '../Icons/X';
import { MemberContext } from '../Account/MemberProvider';
import TaxInput from '../ThingParts/TaxInput';

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

const OrganizationGroup = ({
   groupObj,
   allThings,
   setStateHandler,
   order,
   renameGroup,
   hideGroup,
   removeGroup,
   hideThing,
   copyThingToGroupByID,
   userGroups,
   expandThingCallback,
   expandedCards
}) => {
   const [groupTitle, setGroupTitle] = useState(groupObj.title);
   const [tagsToAdd, setTagsToAdd] = useState('');
   const titleRef = useRef(null);
   const groupRef = useRef(null);

   const { me } = useContext(MemberContext);

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
   const cards = groupObj.things.map((id, index) => {
      if (typeof id === 'string') {
         const [thisThing] = allThings.filter(thing => thing.id === id);
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
               setStateHandler={setStateHandler}
               hideThing={hideThing}
               copyThingToGroupByID={copyThingToGroupByID}
               userGroups={userGroups}
               expandThingCallback={expandThingCallback}
               expandedCards={expandedCards}
            />
         );
      }
      if (index === 0) {
         universalTags = id.partOfTags;
      }
      return (
         <OrganizationCard
            thing={id}
            groupId={groupObj.id}
            index={index}
            setStateHandler={setStateHandler}
            hideThing={hideThing}
            copyThingToGroupByID={copyThingToGroupByID}
            userGroups={userGroups}
            expandThingCallback={expandThingCallback}
            expandedCards={expandedCards}
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
                     renameGroup(groupObj.id, e.target.value);
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
                  <button onClick={() => hideGroup(groupObj.id, groupObj.type)}>
                     hide
                  </button>
               )}
               {removeGroup != null && (
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
                        removeGroup(groupObj.id);
                     }}
                  />
               )}
            </div>
         </div>
         <Droppable droppableId={groupObj.id}>
            {provided => (
               <StyledCardList
                  className="droppableWrapper"
                  ref={provided.innerRef}
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
