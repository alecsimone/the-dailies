import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { getRandomString } from '../../lib/TextHandling';
import useMe from '../Account/useMe';
import LockIcon from '../Icons/Lock';
import HamburgerIcon from '../Icons/Hamburger';
import AddCollectionButton from './AddCollectionButton';
import CollectionPrivacyInterface from './CollectionPrivacyInterface';
import {
   ADD_GROUP_TO_COLLECTION_MUTATION,
   DELETE_COLLECTION_MUTATION,
   RENAME_COLLECTION_MUTATION
} from './queriesAndMutations';

const getShortestColumnID = columnData => {
   // First we need two placeholder variables
   let lowestHeight = 0;
   let lowestHeightID;
   if (!process.browser) return columnData[0].id;

   // Then we need to loop through each column
   columnData.forEach((data, index) => {
      // We need to get the height for each column. First we grab the column container, but these will all have the same height
      const thisContainer = document.querySelector(`#id-${data.id}`);

      if (thisContainer != null) {
         // So next we get their first child, which will only have as much height as its contents need
         const thisElement = thisContainer.firstElementChild;

         const height = thisElement != null ? thisElement.offsetHeight : 0;

         // If the height of all the groups in this column is less than the lowest height we've found so far (or if this is the first column), we need to set our placeholder values to that of this column
         if (index === 0 || lowestHeight > height) {
            lowestHeight = height;
            lowestHeightID = data.id;
         }
      } else if (lowestHeight !== 0) {
         lowestHeight = 0;
         lowestHeightID = data.id;
      }
   });

   // Then we just return the ID of the lowest column
   return lowestHeightID;
};
export { getShortestColumnID };

const CollectionsHeader = ({
   setActiveCollection,
   allCollections,
   activeCollection,
   canEdit
}) => {
   const [collectionTitle, setCollectionTitle] = useState(
      activeCollection.title
   );
   const [showingOptions, setShowingOptions] = useState(false);

   const [showingPrivacyInterface, setShowingPrivacyInterface] = useState(
      false
   );

   const { loggedInUserID } = useMe();

   const collectionTitleRef = useRef(null);

   const {
      id,
      title,
      userGroups,
      privacy,
      viewers,
      editors,
      columnOrders,
      author
   } = activeCollection;

   useEffect(() => {
      setCollectionTitle(title);
   }, [title]);

   const debounceKey = id;
   const [renameCollection] = useMutation(RENAME_COLLECTION_MUTATION, {
      context: {
         debounceKey
      }
   });

   const [addGroupToCollection] = useMutation(ADD_GROUP_TO_COLLECTION_MUTATION);

   const router = useRouter();
   const [deleteCollection, { loading: deletingCollection }] = useMutation(
      DELETE_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         },
         onCompleted: data => {
            const destination = {
               pathname: '/collections'
            };

            if (data.deleteCollection.lastActiveCollection != null) {
               destination.query = {
                  id: data.deleteCollection.lastActiveCollection.id
               };
               if (
                  router?.query.id != null &&
                  router?.query?.id !==
                     data.deleteCollection.lastActiveCollection.id
               ) {
                  router.push(destination);
               }
            } else {
               router.push(destination);
            }
         }
      }
   );

   const collectionsOptions = allCollections.map(collectionObj => (
      <option value={collectionObj.id} key={collectionObj.id}>
         {collectionObj.id === id ? collectionTitle : collectionObj.title}
      </option>
   ));

   let collectionSelector;
   if (allCollections.length > 1) {
      collectionSelector = (
         <select
            value={id}
            onChange={e => {
               setActiveCollection({
                  variables: {
                     collectionID: e.target.value
                  }
               });
               router.push({
                  pathname: '/collections',
                  query: {
                     id: e.target.value
                  }
               });
            }}
         >
            {collectionsOptions}
         </select>
      );
   }

   const deleteCollectionButton = (
      <button
         type="button"
         onClick={() => {
            if (deletingCollection) return;
            deleteCollection();
         }}
      >
         {deletingCollection ? 'deleting' : 'delete'} collection
      </button>
   );

   const addGroupButton = (
      <button
         type="button"
         onClick={() => {
            const newGroupID = getRandomString(25);

            // We're going to add the group to the first empty column, making a new one if we have to.
            const firstEmptyColumnIndex = columnOrders.findIndex(
               orderObj => orderObj.order.length === 0
            );

            let columnToAddToID;
            if (firstEmptyColumnIndex === -1) {
               columnToAddToID = getRandomString(25);
               columnOrders.push({
                  __typename: 'ColumnOrder',
                  id: columnToAddToID,
                  order: [newGroupID]
               });
            } else {
               columnToAddToID = columnOrders[firstEmptyColumnIndex].id;
               columnOrders[firstEmptyColumnIndex].order.push(newGroupID);
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
      <header>
         <div className="top">
            {!canEdit && <h3 className="collectionTitle">{collectionTitle}</h3>}
            {canEdit && (
               <input
                  type="text"
                  className="collectionTitle"
                  ref={collectionTitleRef}
                  value={collectionTitle}
                  onChange={e => {
                     setCollectionTitle(e.target.value);
                  }}
                  onKeyDown={e => {
                     if (e.key === 'Enter') {
                        collectionTitleRef.current.blur();
                     }
                  }}
                  onBlur={e => {
                     if (e.target.value.trim() === '') {
                        e.preventDefault();
                        alert('Please enter a name for this collection');
                        return;
                     }
                     renameCollection({
                        variables: {
                           collectionID: id,
                           newTitle: e.target.value
                        },
                        optimisticResponse: {
                           __typename: 'Mutation',
                           renameCollection: {
                              __typename: 'Collection',
                              id,
                              title: e.target.value
                           }
                        }
                     });
                  }}
               />
            )}
            <HamburgerIcon
               className={showingOptions ? 'showing' : 'hidden'}
               onClick={() => setShowingOptions(!showingOptions)}
            />
         </div>
         <div
            className={
               showingOptions ? 'headerOptions showing' : 'headerOptions hidden'
            }
         >
            <div className="left">
               {collectionSelector}
               {/* <input
                  type="text"
                  placeholder="Filter Things"
                  onChange={e => setThingFilterString(e.target.value)}
               /> */}
            </div>
            <div className="headerButtons">
               <AddCollectionButton />
               {canEdit && deleteCollectionButton}
               {canEdit && addGroupButton}
               <LockIcon
                  privacy={privacy}
                  onClick={() => {
                     if (!canEdit) return;
                     if (author.id !== loggedInUserID) return;
                     setShowingPrivacyInterface(!showingPrivacyInterface);
                  }}
               />
            </div>
         </div>
         {showingPrivacyInterface && (
            <div className="privacyInterfaceWrapper">
               <CollectionPrivacyInterface
                  collectionID={id}
                  initialPrivacy={privacy}
                  viewers={viewers}
                  editors={editors}
               />
            </div>
         )}
      </header>
   );
};
export default CollectionsHeader;
