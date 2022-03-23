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

const CollectionBody = ({ activeCollection, canEdit }) => {
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
         canEdit={canEdit}
      />
   ));

   return (
      <section className="collectionBody">
         <div className="groupsWrapper">
            <Columnizer
               items={groupElements}
               collectionID={id}
               columnOrders={columnOrders}
               draggingGroup={draggingGroup}
               canEdit={canEdit}
            />
         </div>
      </section>
   );
};
export default CollectionBody;
