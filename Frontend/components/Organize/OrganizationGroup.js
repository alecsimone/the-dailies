import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useState, useRef } from 'react';
import OrganizationCard from './OrganizationCard';
import X from '../Icons/X';

const StyledCardList = styled.div`
   .blankSpace {
      background: ${props => props.theme.midBlack};
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
   }
`;

const OrganizationGroup = ({
   groupObj,
   setStateHandler,
   order,
   renameGroup,
   hideGroup,
   removeGroup,
   hideThing
}) => {
   const [groupTitle, setGroupTitle] = useState(groupObj.title);
   const titleRef = useRef(null);

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
         hideThing={hideThing}
      />
   ));

   return (
      <div className="tagGroup">
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
      </div>
   );
};

export default OrganizationGroup;
