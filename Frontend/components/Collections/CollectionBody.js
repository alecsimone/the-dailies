import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { getRandomString } from '../../lib/TextHandling';
import { dynamicallyResizeElement } from '../../styles/functions';
import Columnizer from '../Columnizer';
import CollectionsGroup from './CollectionsGroup';
import { ADD_GROUP_TO_COLLECTION_MUTATION } from './queriesAndMutations';
import { StyledCollectionBody } from './styles';

const resizeAllGroupTitles = () => {
   console.log('hello');
   const groupTitles = document.querySelectorAll('textarea.groupTitle');
   for (const groupTitle of groupTitles) {
      dynamicallyResizeElement(groupTitle, false);
   }
};

const CollectionBody = ({ activeCollection, canEdit }) => {
   // Another pretty simple component. This one exists just to create the items that will populate Columnizer, to handle adding groups, and to set the page Head data (page title and opengraph data).
   const {
      id,
      userGroups,
      columnOrders,
      columnOrderOrder = [],
      title,
      author
   } = activeCollection;

   useEffect(() => {
      window.addEventListener('resize', resizeAllGroupTitles);
      return () => window.removeEventListener('resize', resizeAllGroupTitles);
   }, []);

   // Theoretically, we should always be getting a columnOrderOrder that orders every column. On the off chance we don't though, this little block is here to make up the differences. It's probably unecessary, so it's pretty quick and dirty, but it was helpful when introducing columnOrderOrders and it could be a nice little failsafe at some point too I guess.
   if (columnOrderOrder.length < columnOrders.length) {
      columnOrders.forEach(orderObj => {
         if (!columnOrderOrder.includes(orderObj.id)) {
            columnOrderOrder.push(orderObj.id);
         }
      });
   }

   const [addGroupToCollection] = useMutation(ADD_GROUP_TO_COLLECTION_MUTATION);

   const groupElements = userGroups.map((groupObj, index) => (
      <CollectionsGroup
         index={index}
         groupObj={groupObj}
         key={groupObj.id}
         collectionID={id}
         canEdit={canEdit}
      />
   ));

   const makeAddGroupButton = columnToAddToID => (
      <button
         className="addGroupButton"
         type="button"
         onClick={() => {
            // First we make an ID for the new group we're adding, so we can use it in multiple places
            const newGroupID = getRandomString(25);

            // Then we check if the column we're adding the group to already exists or if we need to make a new one
            const columnToAddToIndex = columnOrders.findIndex(
               orderObj => orderObj.id === columnToAddToID
            );

            if (columnToAddToIndex === -1) {
               // If the column doesn't exist, we make a new order for it and add it to our columnOrderOrder
               columnOrders.push({
                  __typename: 'ColumnOrder',
                  id: columnToAddToID,
                  order: [newGroupID]
               });
               columnOrderOrder.push(columnToAddToID);
            } else {
               // If it does exist, we can simply add the new group to its order
               columnOrders[columnToAddToIndex].order.push(newGroupID);
            }

            // Then we just need to make an object for the new group and add it into our userGroups, along with the new columnOrders and columnOrderOrder, in our optimistic response.
            const now = new Date();
            const optimisticResponse = {
               __typename: 'Mutation',
               addGroupToCollection: {
                  __typename: 'Collection',
                  id,
                  userGroups: [
                     ...userGroups,
                     {
                        __typename: 'CollectionGroup',
                        id: newGroupID,
                        title: 'Untitled Group',
                        includedLinks: [],
                        inCollection: {
                           __typename: 'Collection',
                           id
                        },
                        notes: [],
                        order: [],
                        createdAt: now.toISOString(),
                        updatedAt: now.toISOString()
                     }
                  ],
                  columnOrders,
                  columnOrderOrder
               }
            };
            addGroupToCollection({
               variables: {
                  collectionID: id,
                  newGroupID,
                  columnID: columnToAddToID
               },
               optimisticResponse
            });
         }}
      >
         add group
      </button>
   );

   return (
      <StyledCollectionBody>
         <Head>
            <title>{title} - Ouryou</title>
            <meta property="og:title" content={title} />
            <meta
               property="og:description"
               content={`A collection by ${author.displayName}`}
               key="ogDescription"
            />
         </Head>
         <Columnizer
            items={groupElements}
            columnOrders={columnOrders}
            columnOrderOrder={columnOrderOrder}
            canEdit={canEdit}
            addItemButtonFunction={makeAddGroupButton}
         />
      </StyledCollectionBody>
   );
};
export default React.memo(CollectionBody);
