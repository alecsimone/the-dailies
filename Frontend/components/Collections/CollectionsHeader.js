import { useMutation } from '@apollo/react-hooks';
import { useState, useRef, useEffect } from 'react';
import { getRandomString } from '../../lib/TextHandling';
import { getColumnCount } from '../Columnizer';
import AddCollectionButton from './AddCollectionButton';
import { getShortestColumnIndex } from './CollectionBody';
import {
   ADD_GROUP_TO_COLLECTION_MUTATION,
   DELETE_COLLECTION_MUTATION,
   RENAME_COLLECTION_MUTATION,
   SET_GROUP_BY_TAG_MUTATION,
   SHOW_HIDDEN_GROUPS_ON_COLLECTION_MUTATION,
   SHOW_HIDDEN_TAGS_ON_COLLECTION_MUTATION,
   SHOW_HIDDEN_THINGS_ON_COLLECTION_MUTATION
} from './queriesAndMutations';

const getShortestColumnID = columnData => {
   // First we need two placeholder variables
   let lowestHeight = 0;
   let lowestHeightID;

   // Then we need to loop through each column
   columnData.forEach((data, index) => {
      // We need to get the height for each column. First we grab the column container, but these will all have the same height
      const thisContainer = document.querySelector(`#${data.id}`);
      // So next we get their first child, which will only have as much height as its contents need
      const thisElement = thisContainer.firstElementChild;

      const height = thisElement != null ? thisElement.offsetHeight : 0;

      // If the height of all the groups in this column is less than the lowest height we've found so far (or if this is the first column), we need to set our placeholder values to that of this column
      if (index === 0 || lowestHeight > height) {
         lowestHeight = height;
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
   setThingFilterString
}) => {
   const [collectionTitle, setCollectionTitle] = useState(
      activeCollection.title
   );
   const collectionTitleRef = useRef(null);

   const {
      groupByTag,
      id,
      title,
      userGroups,
      hiddenGroups,
      hiddenTags,
      hiddenThings,
      columnOrders
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

   const [setCollectionGroupByTag] = useMutation(SET_GROUP_BY_TAG_MUTATION, {
      variables: {
         collectionID: id,
         groupByTag: !groupByTag
      },
      optimisticResponse: {
         __typename: 'Mutation',
         setCollectionGroupByTag: {
            __typename: 'Collection',
            id,
            groupByTag: !groupByTag
         }
      },
      context: {
         debounceKey
      }
   });

   const [addGroupToCollection] = useMutation(ADD_GROUP_TO_COLLECTION_MUTATION);

   const [deleteCollection, { loading: deletingCollection }] = useMutation(
      DELETE_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         }
      }
   );

   const [showHiddenGroupsOnCollection] = useMutation(
      SHOW_HIDDEN_GROUPS_ON_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            showHiddenGroupsOnCollection: {
               __typename: 'Collection',
               id,
               hiddenGroups: []
            }
         },
         context: {
            debounceKey
         }
      }
   );

   const [showHiddenTagsOnCollection] = useMutation(
      SHOW_HIDDEN_TAGS_ON_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            showHiddenTagsOnCollection: {
               __typename: 'Collection',
               id,
               hiddenTags: []
            }
         },
         context: {
            debounceKey
         }
      }
   );

   const [showHiddenThingsOnCollection] = useMutation(
      SHOW_HIDDEN_THINGS_ON_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            showHiddenThingsOnCollection: {
               __typename: 'Collection',
               id,
               hiddenThings: []
            }
         },
         context: {
            debounceKey
         }
      }
   );

   const collectionsOptions = allCollections.map(collectionObj => (
      <option value={collectionObj.id} key={collectionObj.id}>
         {collectionObj.title}
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

   const groupByTagButton = (
      <button type="button" onClick={setCollectionGroupByTag}>
         {groupByTag ? 'group manually' : 'group by tag'}
      </button>
   );

   const addGroupButton = (
      <button
         type="button"
         onClick={() => {
            const newGroupID = getRandomString(25);

            // First we need to figure out if we have all the columns we're supposed to
            const columnCount = getColumnCount();
            let columnToAddToID;
            if (columnOrders.length >= columnCount) {
               // If we do, we find the shortest column and add the new group to it
               columnToAddToID = getShortestColumnID(columnOrders);
               const columnIndex = columnOrders.findIndex(
                  columnData => columnData.id === columnToAddToID
               );
               columnOrders[columnIndex].order.push(newGroupID);
            } else {
               // If we don't, we make a new column with our new group in it
               columnToAddToID = getRandomString(25);
               columnOrders.unshift({
                  __typename: 'ColumnOrder',
                  id: columnToAddToID,
                  order: [newGroupID]
               });
            }
            addGroupToCollection({
               variables: {
                  collectionID: id,
                  newGroupID,
                  columnID: columnToAddToID
               },
               optimisticResponse: {
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
                           things: [],
                           order: [],
                           createdAt: Date.now,
                           updatedAt: Date.now
                        }
                     ]
                  },
                  columnOrders
               }
            });
         }}
      >
         add group
      </button>
   );

   const showHiddenGroupsButton = (
      <button type="button" onClick={showHiddenGroupsOnCollection}>
         show hidden groups
      </button>
   );

   const showHiddenTagsButton = (
      <button type="button" onClick={showHiddenTagsOnCollection}>
         show hidden tags
      </button>
   );

   const showHiddenThingsButton = (
      <button type="button" onClick={showHiddenThingsOnCollection}>
         show hidden things
      </button>
   );

   return (
      <header>
         <input
            type="text"
            className="collectionTitle"
            ref={collectionTitleRef}
            value={collectionTitle}
            onChange={e => {
               setCollectionTitle(e.target.value);
               if (e.target.value.trim() === '') return;
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
            onKeyDown={e => {
               if (e.key === 'Enter') {
                  collectionTitleRef.current.blur();
               }
            }}
            onBlur={e => {
               if (e.target.value.trim() === '') {
                  e.preventDefault();
                  alert('Please enter a name for this collection');
               }
            }}
         />
         <div className="headerOptions">
            <div className="left">
               {collectionSelector}
               <input
                  type="text"
                  placeholder="Filter Things"
                  onChange={e => setThingFilterString(e.target.value)}
               />
            </div>
            <div className="headerButtons">
               <AddCollectionButton />
               {deleteCollectionButton}
               {groupByTagButton}
               {!groupByTag &&
                  hiddenGroups.length > 0 &&
                  showHiddenGroupsButton}
               {groupByTag && hiddenTags.length > 0 && showHiddenTagsButton}
               {hiddenThings.length > 0 && showHiddenThingsButton}
               {!groupByTag && addGroupButton}
            </div>
         </div>
      </header>
   );
};
export default CollectionsHeader;
