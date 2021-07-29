import gql from 'graphql-tag';
import styled from 'styled-components';
import { setAlpha } from '../styles/functions';
import { fullMemberFields, thingCardFields } from './CardInterfaces';
import OrganizationGroup from '../components/Organize/OrganizationGroup';

const MY_BIG_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String) {
      myThings(cursor: $cursor) {
         ${thingCardFields}
      }
   }
`;
export { MY_BIG_THINGS_QUERY };

const STORE_ORGANIZE_STATE_MUTATION = gql`
   mutation STORE_ORGANIZE_STATE_MUTATION($state: String!) {
      storeOrganizeState(state: $state) {
         ${fullMemberFields}
      }
   }
`;
export { STORE_ORGANIZE_STATE_MUTATION };

const ADD_TAX_BY_ID_MUTATION = gql`
   mutation ADD_TAX_BY_ID_MUTATION($tax: ID!, $thingID: ID!, $personal: Boolean) {
      addTaxToThingById(tax: $tax, thingID: $thingID, personal: $personal) {
         ${thingCardFields}
      }
   }
`;
export { ADD_TAX_BY_ID_MUTATION };

const StyledOrganizePage = styled.section`
   padding: 2rem;
   .filterManagement {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      input.filter {
         width: 40%;
         font-size: ${props => props.theme.smallText};
      }
      button {
         font-size: ${props => props.theme.smallText};
         padding: 0.5rem;
         opacity: 0.8;
         margin-left: 2rem;
         &:hover {
            opacity: 1;
         }
      }
   }
   .tagGroup {
      width: 100%;
      display: inline-block;
      padding: 0 2rem;
      border-radius: 6px;
      vertical-align: top;
      margin-bottom: 2rem;
      background: ${props => setAlpha(props.theme.lightBlack, 0.8)};
      .header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         h3,
         input.groupTitle {
            font-size: ${props => props.theme.bigText};
            font-weight: bold;
            margin: 1.5rem 0;
         }
         input.groupTitle {
            border: none;
            margin-bottom: calc(1.5rem + 1px);
            &:focus {
               border-bottom: 1px solid ${props => props.theme.mainText};
               outline: none;
               margin-bottom: 1.5rem;
            }
         }
         .buttons {
            display: flex;
            align-items: center;
            button {
               padding: 0.5rem 1rem;
               font-size: ${props => props.theme.smallText};
               border-radius: 6px;
            }
            svg.x {
               cursor: pointer;
               height: calc(${props => props.theme.smallText} + 1rem);
               opacity: 0.6;
               transition: all 0.2s;
               &:hover {
                  opacity: 1;
                  transform: scale(1.1);
               }
               margin-left: 2rem;
            }
         }
      }
   }
   .masonryContainer {
      display: flex;
      width: auto;
      margin-left: -2rem;
      .column {
         padding-left: 2rem;
         flex-grow: 1;
      }
      .smallThingCard {
         max-width: none;
         opacity: 1;
      }
   }
   button.more {
      font-size: ${props => props.theme.bigText};
      padding: 0.5rem 1rem;
      display: block;
      margin: 3rem auto;
   }
`;
export { StyledOrganizePage };

const makeValuesStringFromObject = object => {
   const keys = Object.keys(object);
   let valuesString = '';
   keys.forEach(key => {
      let value = object[key];
      if (typeof value === 'object' && value !== null) {
         valuesString += makeValuesStringFromObject(value);
      } else if (value != null) {
         if (!isNaN(value)) {
            value = value.toString();
         }
         valuesString += value.toLowerCase();
      }
   });
   return valuesString;
};

const defaultState = {
   filterString: '',
   hiddenThings: [],
   groupByTag: false,
   hiddenTags: [],
   hiddenGroups: [],
   userGroups: [],
   groupOrders: []
};
export { defaultState };

const getDraggableId = rawDraggableId => {
   const draggableIdSeparatorIndex = rawDraggableId.indexOf('-');
   const draggableId = rawDraggableId.substring(draggableIdSeparatorIndex + 1);
   return draggableId;
};
export { getDraggableId };

const ungroupCard = (draggableId, userGroups, source, setStateHandler) => {
   // We need to remove it from the source group

   // First we make a copy of the userGroups array
   const userGroupsCopy = [...userGroups];

   // And find the group we're dropping onto within it
   const sourceGroupIndex = userGroupsCopy.findIndex(
      groupObj => groupObj.id === source.droppableId
   );

   // Then we remove the thing from that group
   const newThings = userGroupsCopy[sourceGroupIndex].things.filter(
      thingID => thingID !== draggableId
   );
   userGroupsCopy[sourceGroupIndex].things = newThings;

   // And push to state
   setStateHandler('userGroups', userGroupsCopy);
};
export { ungroupCard };

const untagCard = (
   defaultOrderRef,
   draggableId,
   source,
   myThings,
   removeTaxFromThing
) => {
   // Remove the tag
   const [tagObj] = defaultOrderRef.current.filter(
      groupObj => groupObj.id === source.droppableId
   );

   const [thingData] = myThings.filter(thing => thing.id === draggableId);

   const newTags = thingData.partOfTags.filter(
      tag => tag.title !== tagObj.title
   );
   const newThingData = { ...thingData };
   newThingData.partOfTags = newTags;

   removeTaxFromThing({
      variables: {
         tax: tagObj.title,
         thingID: thingData.id,
         personal: false
      },
      optimisticResponse: {
         __typename: 'Mutation',
         removeTaxFromThing: newThingData
      }
   });
};
export { untagCard };

const getNewOrder = (
   groupOrders,
   group,
   defaultOrderRef,
   draggableId,
   type
) => {
   // Check if there's an order for the group in state
   const [order] = groupOrders.filter(
      orderObj => orderObj.id === group.droppableId
   );

   // If there is, copy it
   let newOrder;
   if (order != null) {
      newOrder = [...order.order];
   } else {
      // If there isn't, make one from the defaultOrderRef
      const [defaultOrder] = defaultOrderRef.current.filter(
         orderObj => orderObj.id === group.droppableId
      );
      newOrder = [...defaultOrder.order];
   }
   // And then rearrange it
   if (type === 'source') {
      newOrder.splice(group.index, 1);
   } else if (type === 'destination') {
      newOrder.splice(group.index, 0, draggableId);
   }
   return newOrder;
};

const getNewOrders = (
   groupOrders,
   source,
   destination,
   defaultOrderRef,
   draggableId
) => {
   // If the source and destination aren't the same, we can just get new orders for each of them and send those back
   if (source.droppableId !== destination.droppableId) {
      // First we get the new order of the source group
      const newSourceOrder = getNewOrder(
         groupOrders,
         source,
         defaultOrderRef,
         draggableId,
         'source'
      );

      // Then we get the new order of the destination group
      const newDestinationOrder = getNewOrder(
         groupOrders,
         destination,
         defaultOrderRef,
         draggableId,
         'destination'
      );
      return [newSourceOrder, newDestinationOrder];
   }

   // If the source and destination are the same group, we need to update that group's order slightly differently.
   // First, we check if there's an order for the group in state
   const [order] = groupOrders.filter(
      orderObj => orderObj.id === source.droppableId
   );

   // If there is, copy it
   let newOrder;
   if (order != null) {
      newOrder = [...order.order];
   } else {
      // If there isn't, make one from the defaultOrderRef
      const [defaultOrder] = defaultOrderRef.current.filter(
         orderObj => orderObj.id === source.droppableId
      );
      newOrder = [...defaultOrder.order];
   }
   newOrder.splice(source.index, 1);
   newOrder.splice(destination.index, 0, draggableId);
   return [newOrder];
};
export { getNewOrders };

const makeNewGroupOrdersArray = (
   groupOrders,
   source,
   destination,
   newSourceOrder,
   newDestinationOrder
) => {
   // First we make a copy of the groupOrders array
   const groupOrdersCopy = [...groupOrders];

   // Then we update the source order array. First we try to find it in the old array
   const indexOfSource = groupOrdersCopy.findIndex(
      orderObj => orderObj.id === source.droppableId
   );
   // If we can't find it, we just add the new order
   if (indexOfSource !== -1) {
      groupOrdersCopy[indexOfSource].order = newSourceOrder;
   } else {
      // If we do find it in the old array, we replace it with the new one
      groupOrdersCopy.push({
         id: source.droppableId,
         order: newSourceOrder
      });
   }

   // If the source and the destination aren't the same, we also need to update the destination order
   if (
      source.droppableId !== destination.droppableId &&
      newDestinationOrder != null
   ) {
      // Then we update the destination order array. First we try to find it in the old array
      const indexOfDestination = groupOrdersCopy.findIndex(
         orderObj => orderObj.id === destination.droppableId
      );
      // If we can't find it, we just add the new order
      if (indexOfDestination !== -1) {
         groupOrdersCopy[indexOfDestination].order = newDestinationOrder;
      } else {
         // If we do find it in the old array, we replace it with the new one
         groupOrdersCopy.push({
            id: destination.droppableId,
            order: newDestinationOrder
         });
      }
   }
   return groupOrdersCopy;
};
export { makeNewGroupOrdersArray };

const addTagToCard = (
   myThings,
   draggableId,
   defaultOrderRef,
   destination,
   addTaxByID
) => {
   // First let's get the data for the thing to use in our optimistic response
   const [thingData] = myThings.filter(thing => thing.id === draggableId);

   // We need to find the title of the tag we're adding, which is easiest to grab from the defaultOrderRef
   const [orderObj] = defaultOrderRef.current.filter(
      tagObj => tagObj.id === destination.droppableId
   );
   thingData.partOfTags.push({
      __typename: 'Tag',
      id: destination.droppableId,
      title: orderObj.title
   });

   // Then we add the tag
   addTaxByID({
      variables: {
         tax: destination.droppableId,
         thingID: draggableId,
         personal: false
      },
      optimisticResponse: {
         __typename: 'Mutation',
         addTaxToThingByById: thingData
      }
   });
};
export { addTagToCard };

const addCardToGroup = (
   draggableId,
   userGroups,
   destination,
   source,
   setStateHandler
) => {
   // We need to add it to the destination group

   // First we make a copy of the userGroups array
   const userGroupsCopy = [...userGroups];

   // And find the group we're dropping onto within it
   const destinationGroupIndex = userGroupsCopy.findIndex(
      groupObj => groupObj.id === destination.droppableId
   );

   // Then we add the thing to that group
   userGroupsCopy[destinationGroupIndex].things.push(draggableId);

   if (source.droppableId !== 'ungrouped') {
      // And find the group we're dragging from within it
      const sourceGroupIndex = userGroupsCopy.findIndex(
         groupObj => groupObj.id === source.droppableId
      );

      // And remove it from the original group
      const newThings = userGroupsCopy[sourceGroupIndex].things.filter(
         thingID => thingID !== draggableId
      );
      userGroupsCopy[sourceGroupIndex].things = newThings;
   }

   // And push to state
   setStateHandler('userGroups', userGroupsCopy);
};
export { addCardToGroup };

const sortByUpdatedTime = (a, b) => {
   const aDate = new Date(a.updatedAt);
   const bDate = new Date(b.updatedAt);

   const aTimestamp = aDate.getTime();
   const bTimestamp = bDate.getTime();

   return bTimestamp - aTimestamp;
};
export { sortByUpdatedTime };

const makeTagsArrayFromThings = things => {
   // We start our array of tags with an object for cards with no tags
   const tagsArray = [
      { id: 'tagless', title: 'Tagless', type: 'tag', things: [] }
   ];

   // Then we go through all of our things
   things.forEach(thing => {
      // If they're not part of any things, we add them to the tagless object's things array
      if (thing.partOfTags.length === 0) {
         const indexOfTaglessObj = tagsArray.findIndex(
            tagObj => tagObj.id === 'tagless'
         );
         tagsArray[indexOfTaglessObj].things.push(thing);
      } else {
         // If they are part of some tags, we go through each tag they're a part of
         thing.partOfTags.forEach(tag => {
            // We check if we've seen that tag already
            const indexOfTagObj = tagsArray.findIndex(
               tagObj => tagObj.id === tag.id
            );
            if (indexOfTagObj === -1) {
               // If we haven't, we add it to our array of tags with this thing in its things array
               tagsArray.push({
                  id: tag.id,
                  title: tag.title,
                  type: 'tag',
                  things: [thing]
               });
            } else {
               // If we have, we add this thing to the tag's things array
               tagsArray[indexOfTagObj].things.push(thing);
            }
         });
      }
   });
   return tagsArray;
};
export { makeTagsArrayFromThings };

const makeTagGroups = (
   tagsArray,
   defaultOrderRef,
   groupOrders,
   setStateHandler,
   hideGroup,
   hideThing,
   allThings
) => {
   const tagGroups = tagsArray.map(tagObj => {
      const defaultOrder = tagObj.things.map(thing => thing.id);
      const refIndex = defaultOrderRef.current.findIndex(
         orderObj => orderObj.id === tagObj.id
      );
      if (refIndex === -1) {
         defaultOrderRef.current.push({
            id: tagObj.id,
            title: tagObj.title,
            order: defaultOrder
         });
      } else {
         defaultOrderRef.current[refIndex].order = defaultOrder;
      }

      const [groupOrder] = groupOrders.filter(
         orderObj => orderObj.id === tagObj.id
      );

      return (
         <OrganizationGroup
            groupObj={tagObj}
            allThings={allThings}
            setStateHandler={setStateHandler}
            order={groupOrder == null ? null : groupOrder.order}
            hideGroup={hideGroup}
            hideThing={hideThing}
         />
      );
   });
   return tagGroups;
};
export { makeTagGroups };

const makeUserGroups = (
   userGroups,
   things,
   defaultOrderRef,
   hiddenGroups,
   groupOrders,
   setStateHandler,
   renameGroup,
   hideGroup,
   removeGroup,
   hideThing,
   copyThingToGroupByID
) => {
   // First we make a copy of the user groups
   const userGroupsCopy = [...userGroups];

   // Then we need to make a group for all the ungrouped things
   const ungroupedThings = things.filter(thing => {
      // We'll go through each thing, and for each thing, we'll check each group to see if it's in it
      let isGrouped = false;
      userGroups.forEach(group => {
         const [foundThing] = group.things.filter(
            groupedThingID => groupedThingID === thing.id
         );
         if (foundThing != null) {
            isGrouped = true;
         }
      });
      // Things that aren't grouped pass the filter test to make it into our new group
      return !isGrouped;
   });
   // Then we need to make an array with the ids of all the things in this group
   const thingIDs = ungroupedThings.map(thing => thing.id);

   // Then we add the ungrouped things group to our user group
   userGroupsCopy.push({
      id: 'ungrouped',
      title: 'Ungrouped',
      type: 'manual',
      things: thingIDs
   });

   // now we need to make a list of the default order for each group so we know where to put things when we rearrange them
   userGroupsCopy.forEach(groupObj => {
      // First we find the default order of this group
      const defaultOrder = groupObj.things.map(thingID => thingID);

      // Then we check if we've already got it stored in our defaultOrderRef
      const refIndex = defaultOrderRef.current.findIndex(
         orderObj => orderObj.id === groupObj.id
      );
      if (refIndex === -1) {
         // If we don't, we add it
         defaultOrderRef.current.push({
            id: groupObj.id,
            title: groupObj.title,
            order: defaultOrder
         });
      } else {
         // If we do, we update it
         defaultOrderRef.current[refIndex].order = defaultOrder;
      }
   });

   const filteredGroupElements = userGroupsCopy.filter(
      groupObj => !hiddenGroups.includes(groupObj.id)
   );
   const groupElements = filteredGroupElements.map(groupObj => {
      // First we have to check state to see if we've set a custom order for this group
      const [groupOrder] = groupOrders.filter(
         orderObj => orderObj.id === groupObj.id
      );

      // Then we can create the component for the group
      return (
         <OrganizationGroup
            key={groupObj.id}
            groupObj={groupObj}
            allThings={things}
            setStateHandler={setStateHandler}
            renameGroup={renameGroup}
            order={groupOrder == null ? null : groupOrder.order}
            hideGroup={hideGroup}
            removeGroup={groupObj.id === 'ungrouped' ? null : removeGroup}
            hideThing={hideThing}
            copyThingToGroupByID={copyThingToGroupByID}
            userGroups={userGroups}
         />
      );
   });
   return groupElements;
};
export { makeUserGroups };
