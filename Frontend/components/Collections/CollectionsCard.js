import { useMutation } from '@apollo/react-hooks';
import { useContext, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MemberContext } from '../Account/MemberProvider';
import FlexibleThingCard from '../ThingCards/FlexibleThingCard';
import {
   COPY_THING_TO_GROUP_MUTATION,
   HANDLE_CARD_EXPANSION_MUTATION,
   REMOVE_THING_FROM_GROUP_MUTATION
} from './queriesAndMutations';
import { StyledCard } from './styles';

const CollectionsCard = ({
   data,
   index,
   userGroups,
   hiddenGroups,
   groupType,
   collectionID,
   groupID,
   hideThingHandler,
   isExpanded
}) => {
   const { me } = useContext(MemberContext);

   const [showingCopyTargets, setShowingCopyTargets] = useState(false);

   const [copyThingToCollectionGroup] = useMutation(
      COPY_THING_TO_GROUP_MUTATION
   );

   const [removeThingFromCollectionGroup] = useMutation(
      REMOVE_THING_FROM_GROUP_MUTATION
   );

   const [handleCardExpansion] = useMutation(HANDLE_CARD_EXPANSION_MUTATION);

   if (data == null) return null;

   const { id } = data;

   const expandCard = newValue => {
      handleCardExpansion({
         variables: {
            thingID: data.id,
            collectionID,
            newValue
         }
      });
   };

   // We need to make the options for the copy to group interface. You can't copy to a group that the thing is already in, so first we need to filter those groups out of the master groups list
   let filteredGroups = [];
   let groupsContainingThingCount = 0;
   if (groupType === 'manual' && userGroups != null && userGroups.length > 0) {
      filteredGroups = userGroups.filter(groupObj => {
         // First we remove any groups that are hidden
         let groupIsHidden = false;
         hiddenGroups.forEach(hiddenGroupObj => {
            if (hiddenGroupObj.id === groupObj.id) {
               groupIsHidden = true;
            }
         });
         if (groupIsHidden) return false;

         // Then we remove any groups that have this thing in them
         let groupHasThisThingAlready = false;
         groupObj.things.forEach(thing => {
            if (thing.id === id) {
               groupHasThisThingAlready = true;
               groupsContainingThingCount += 1;
            }
         });
         if (groupHasThisThingAlready) return false;

         return true;
      });
   }

   // Then we need to make an option element for each remaining group
   const copyToGroupOptions = filteredGroups.map(groupObj => (
      <option value={groupObj.id} key={groupObj.id}>
         {groupObj.title}
      </option>
   ));

   const copyInterface = (
      <div className="copyInterface">
         <button onClick={() => setShowingCopyTargets(!showingCopyTargets)}>
            {showingCopyTargets ? 'close' : 'copy'}
         </button>
         {showingCopyTargets && (
            <select
               value={null}
               onChange={e => {
                  if (e.target.value != null && e.target.value !== '') {
                     const newUserGroups = [...userGroups];
                     const targetGroupIndex = newUserGroups.findIndex(
                        targetGroupObj => targetGroupObj.id === e.target.value
                     );
                     newUserGroups[targetGroupIndex].things.push(data);

                     copyThingToCollectionGroup({
                        variables: {
                           collectionID,
                           thingID: id,
                           targetGroupID: e.target.value
                        },
                        optimisticResponse: {
                           __typename: 'Mutation',
                           copyThingToCollectionGroup: {
                              __typename: 'Collection',
                              id: collectionID,
                              userGroups: newUserGroups
                           }
                        }
                     });
                     setShowingCopyTargets(false);
                  }
               }}
            >
               <option value={null} />
               {copyToGroupOptions}
            </select>
         )}
      </div>
   );

   let canEdit = false;
   if (me && data?.author?.id === me.id) {
      canEdit = true;
   }
   if (me && ['Admin', 'Editor', 'Moderator'].includes(me.role)) {
      canEdit = true;
   }

   return (
      <Draggable
         draggableId={`${groupID}-${id}`}
         index={index}
         key={`${groupID}-${id}`}
      >
         {provided => (
            <StyledCard
               className="cardWrapper"
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               key={`${groupID}-${id}`}
            >
               <FlexibleThingCard
                  key={id}
                  expanded={isExpanded}
                  thingData={data}
                  contentType="single"
                  canEdit={canEdit}
                  titleLink
                  borderSide="top"
                  noPic
               />
               <div
                  className={
                     filteredGroups.length > 0
                        ? 'cardManagementBar'
                        : 'cardManagementBar noCopy'
                  }
               >
                  {filteredGroups.length > 0 && copyInterface}
                  <button
                     type="button"
                     onClick={() => {
                        if (groupsContainingThingCount > 1) {
                           const newUserGroups = [...userGroups];
                           const thisGroupIndex = newUserGroups.findIndex(
                              userGroupObj => userGroupObj.id === groupID
                           );
                           const newThings = newUserGroups[
                              thisGroupIndex
                           ].things.filter(thing => thing.id !== id);
                           newUserGroups[thisGroupIndex].things = newThings;
                           removeThingFromCollectionGroup({
                              variables: {
                                 collectionID,
                                 thingID: id,
                                 groupID
                              },
                              optimisticResponse: {
                                 __typename: 'Mutation',
                                 removeThingFromCollectionGroup: {
                                    __typename: 'Collection',
                                    id: collectionID,
                                    userGroups: newUserGroups
                                 }
                              }
                           });
                        } else {
                           hideThingHandler(id);
                        }
                     }}
                  >
                     {groupsContainingThingCount > 1
                        ? 'remove from group'
                        : 'hide'}
                  </button>
               </div>
            </StyledCard>
         )}
      </Draggable>
   );
};
export default CollectionsCard;
