import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { useState, useRef, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import OrganizationCard from './OrganizationCard';
import X from '../Icons/X';
import { ADD_TAXES_TO_THINGS_MUTATION } from '../../lib/organizeHandling';
import { MemberContext } from '../Account/MemberProvider';

const StyledCardList = styled.div`
   .blankSpace {
      background: ${props => props.theme.midBlack};
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
   }
`;

const StyledOrganizationGroup = styled.div`
   input.tagAdder {
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
   hideThing
}) => {
   const [groupTitle, setGroupTitle] = useState(groupObj.title);
   const [tagsToAdd, setTagsToAdd] = useState('');
   const titleRef = useRef(null);

   const { me } = useContext(MemberContext);

   const [addTaxesToThings] = useMutation(ADD_TAXES_TO_THINGS_MUTATION, {
      onCompleted: data => console.log(data)
   });

   if (order != null) {
      groupObj.things.sort((a, b) => {
         const [aData] = allThings.filter(thing => thing.id === a);
         const [bData] = allThings.filter(thing => thing.id === b);

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

   const cards = groupObj.things.map((id, index) => {
      if (typeof id === 'string') {
         const [thisThing] = allThings.filter(thing => thing.id === id);
         return (
            <OrganizationCard
               thing={thisThing}
               groupId={groupObj.id}
               index={index}
               setStateHandler={setStateHandler}
               hideThing={hideThing}
            />
         );
      }
      return (
         <OrganizationCard
            thing={id}
            groupId={groupObj.id}
            index={index}
            setStateHandler={setStateHandler}
            hideThing={hideThing}
         />
      );
   });

   return (
      <StyledOrganizationGroup className="tagGroup">
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
            <form
               onSubmit={e => {
                  e.preventDefault();

                  // First we need an array of the IDs of all the things we're adding the taxes to
                  const thingIDs = groupObj.things.map(thingID => {
                     if (typeof thingID === 'string') return thingID;
                     return thingID.id;
                  });

                  // Then we need to create a new array with those things with the added taxes so we can do an optimistic response
                  const theseThings = [];
                  thingIDs.forEach(thingID => {
                     const [thisThing] = allThings.filter(
                        thing => thing.id === thingID
                     );
                     if (thisThing != null) {
                        theseThings.push(thisThing);
                     }
                  });
                  const copiedThings = [...theseThings];

                  // First we make an array of all the taxes we're going to add
                  const taxesArray = tagsToAdd.split(',');

                  // For each tax, we need to make an object for it, and then add that object to each thing
                  taxesArray.forEach(tax => {
                     // First we'll search through allThings to see if we already know about this tag

                     // If not, we'll make a placeholder object for it
                     const taxObj = {
                        __typename: 'Tag',
                        title: tax,
                        author: me,
                        id: `placeholder-${tax}`
                     };

                     // Then we add that tag to each thing in our things array
                     copiedThings.forEach(thing =>
                        thing.partOfTags.push(taxObj)
                     );
                  });

                  // Then we do the mutation
                  addTaxesToThings({
                     variables: {
                        taxes: tagsToAdd,
                        thingIDs,
                        personal: false
                     },
                     optimisticResponse: {
                        __typename: 'Mutation',
                        addTaxesToThings: copiedThings
                     }
                  });
                  setTagsToAdd('');
               }}
            >
               <input
                  type="text"
                  className="tagAdder"
                  placeholder="+ Add Tag To All Things"
                  value={tagsToAdd}
                  onChange={e => setTagsToAdd(e.target.value)}
               />
            </form>
         )}
      </StyledOrganizationGroup>
   );
};

export default OrganizationGroup;
