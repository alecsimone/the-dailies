import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import React from 'react';
import { getRandomString } from '../../lib/TextHandling';
import Columnizer from '../Columnizer';
import CollectionsGroup from './CollectionsGroup';
import { ADD_GROUP_TO_COLLECTION_MUTATION } from './queriesAndMutations';

const CollectionBody = ({ activeCollection, canEdit }) => {
   const { id, userGroups, columnOrders, title, author } = activeCollection;

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
            const newGroupID = getRandomString(25);

            const columnToAddToIndex = columnOrders.findIndex(
               orderObj => orderObj.id === columnToAddToID
            );

            if (columnToAddToIndex === -1) {
               columnOrders.push({
                  __typename: 'ColumnOrder',
                  id: columnToAddToID,
                  order: [newGroupID]
               });
            } else {
               columnOrders[columnToAddToIndex].order.push(newGroupID);
            }

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
                  columnOrders
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
      <section className="collectionBody">
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
            collectionID={id}
            columnOrders={columnOrders}
            canEdit={canEdit}
            addItemButtonFunction={makeAddGroupButton}
         />
      </section>
   );
};
export default React.memo(CollectionBody);
