import { useMutation } from '@apollo/react-hooks';
import { useState } from 'react';
import Columnizer, { getColumnCount } from '../Columnizer';
import { groupSort, makeGroups } from './cardHandling';
import { REMOVE_TAX_MUTATION } from '../ThingParts/Taxes';
import {
   ADD_TAX_BY_ID_MUTATION,
   MOVE_CARD_TO_GROUP_MUTATION,
   REORDER_GROUPS_MUTATION,
   DELETE_GROUP_FROM_COLLECTION_MUTATION,
   SET_COLUMN_ORDER_MUTATION
} from './queriesAndMutations';
import { getRandomString } from '../../lib/TextHandling';
import CollectionsGroup from './CollectionsGroup';

const getItemForID = (id, items) => {
   const [element] = items.filter(
      itemElement => itemElement.props.groupObj.id === id
   );
   return element;
};

const getShortestColumnIndex = (columnData, groups, isTagOrder) => {
   // We need to get the approximate height of each column. So we'll map through our columns and create an array of each one's height

   const orderPropertyName = isTagOrder ? 'tagOrder' : 'groupOrder';

   const columnHeights = columnData.map(columnOrdersObject => {
      let columnHeight = 1;
      columnOrdersObject.order.forEach(groupID => {
         // We need to get the group data so we can figure out how many things it has within it
         const groupElement = getItemForID(groupID, groups);
         if (
            groupElement != null &&
            groupElement.props != null &&
            groupElement.props.groupObj != null &&
            groupElement.props.groupObj.things != null
         ) {
            const { length } = groupElement.props.groupObj.things;
            if (length === 0) {
               // If it has no things, we give it one height point
               columnHeight += 1;
            } else if (length === 1) {
               // If it has one thing in it, we give it two height points
               columnHeight += 2;
            } else {
               // If it has more than one thing, we give it as many height points as it has things
               columnHeight += length;
            }
         }
      });
      return columnHeight;
   });

   // Then we figure out which column has the lowest height value
   let lowestValueIndex = 0;
   let currentLowestValue = columnHeights[0];
   columnHeights.forEach((height, index) => {
      if (height < currentLowestValue) {
         currentLowestValue = columnHeights[index];
         lowestValueIndex = index;
      }
   });

   // And we return the index of that column
   return lowestValueIndex;
};
export { getShortestColumnIndex };

const CollectionBody = ({ activeCollection }) => {
   const {
      id,
      userGroups,
      hiddenGroups,
      hiddenThings,
      columnOrders,
      expandedCards
   } = activeCollection;

   const [removeTaxFromThing] = useMutation(REMOVE_TAX_MUTATION);

   const [reorderGroups] = useMutation(REORDER_GROUPS_MUTATION);

   const [moveCardToGroup] = useMutation(MOVE_CARD_TO_GROUP_MUTATION);

   const [addTaxToThingById] = useMutation(ADD_TAX_BY_ID_MUTATION);

   const [deleteGroupFromCollection] = useMutation(
      DELETE_GROUP_FROM_COLLECTION_MUTATION,
      {
         context: {
            debounceKey: id
         }
      }
   );

   const [draggingGroup, setDraggingGroup] = useState(false);

   const deleteGroupHandler = (title, groupID) => {
      if (!confirm(`Are you sure you want to remove the group ${title}?`))
         return;
      const newUserGroups = userGroups.filter(
         thisGroupObj => thisGroupObj.id !== groupID
      );
      columnOrders.forEach(columnOrderObj => {
         columnOrderObj.order = columnOrderObj.order.filter(
            thisID => thisID !== groupID
         );
      });
      deleteGroupFromCollection({
         variables: {
            collectionID: id,
            groupID
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteGroupFromCollection: {
               __typename: 'Collection',
               id,
               userGroups: newUserGroups
            }
         }
      });
   };

   const groupElements = userGroups.map(groupObj => (
      <CollectionsGroup
         groupObj={groupObj}
         key={groupObj.id}
         collectionID={id}
         userGroups={userGroups}
         hiddenGroups={hiddenGroups}
         hiddenThings={hiddenThings}
         deleteGroupHandler={deleteGroupHandler}
         expandedCards={expandedCards}
      />
   ));

   // First we need to figure out how many columns we're expecting to have
   const columnCount = getColumnCount();

   if (columnOrders == null || columnOrders.length === 0) {
      // If we have no column orders, we need to make them. First we're going to make sure we have an array of the proper length, which is full of objects with id and order properties
      for (let i = 0; i < columnCount && i < groupElements.length; i += 1) {
         columnOrders.push({
            id: getRandomString(24),
            order: []
         });
      }

      // Then we're going to loop through all our groups, adding each one to the shortest column
      groupElements.forEach(groupElement => {
         const shortestColumn = getShortestColumnIndex(
            columnOrders,
            groupElements
         );
         if (columnOrders[shortestColumn])
            columnOrders[shortestColumn].order.push(
               groupElement.props.groupObj.id
            );
      });

      // Then we'll send off the update
      const columnIDs = columnOrders.map(orderObj => orderObj.id);
      const newOrders = columnOrders.map(orderObj => orderObj.order);
   } else if (
      columnOrders != null &&
      columnOrders.length < columnCount &&
      columnOrders.length < groupElements.length
   ) {
      // If we have some columns, but not enough, we have to make up the difference. First we add order objects to our columnOrders array to make up the difference
      for (
         let i = columnOrders.length;
         i < columnCount && i < groupElements.length;
         i += 1
      ) {
         columnOrders.push({ id: getRandomString(24), order: [] });
      }

      // Then we need to find the groups that don't have columns
      const unColumnedElements = groupElements.filter(element => {
         let isColumned = false;
         columnOrders.forEach(orderObj => {
            if (orderObj.order.includes(element.props.groupObj.id)) {
               isColumned = true;
            }
         });
         return !isColumned;
      });

      // Then we're going to loop through all those groups, adding each one to the shortest column
      unColumnedElements.forEach(groupElement => {
         const shortestColumn = getShortestColumnIndex(
            columnOrders,
            groupElements
         );
         if (columnOrders[shortestColumn])
            columnOrders[shortestColumn].order.push(
               groupElement.props.groupObj.id
            );
      });

      // Then we'll send off the update
      const columnIDs = columnOrders.map(orderObj => orderObj.id);
      const newOrders = columnOrders.map(orderObj => orderObj.order);
   } else {
      // If we have as many columnOrders as we do columns, we just need to check if every group is in a column. If it's not, we add it to one and then update the order
      const unColumnedElements = groupElements.filter(element => {
         let isColumned = false;
         columnOrders.forEach(orderObj => {
            if (orderObj.order.includes(element.props.groupObj.id)) {
               isColumned = true;
            }
         });
         return !isColumned;
      });

      // Then we're going to loop through all those groups, adding each one to the shortest column
      unColumnedElements.forEach(groupElement => {
         const shortestColumn = getShortestColumnIndex(
            columnOrders,
            groupElements
         );
         if (columnOrders[shortestColumn])
            columnOrders[shortestColumn].order.push(
               groupElement.props.groupObj.id
            );
      });

      if (unColumnedElements.length > 0) {
         // Then we'll send off the update
         const columnIDs = columnOrders.map(orderObj => orderObj.id);
         const newOrders = columnOrders.map(orderObj => orderObj.order);
      }
   }

   return (
      <section className="collectionBody">
         <div className="groupsWrapper">
            <Columnizer
               items={groupElements}
               collectionID={id}
               columnOrders={columnOrders}
               draggingGroup={draggingGroup}
            />
         </div>
      </section>
   );
};
export default CollectionBody;
