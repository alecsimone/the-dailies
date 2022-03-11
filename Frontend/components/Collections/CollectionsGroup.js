import { useEffect, useState, useRef, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { StyledGroup } from './styles';
import CollectionsCard from './CollectionsCard';
import {
   DELETE_GROUP_FROM_COLLECTION_MUTATION,
   HIDE_GROUP_ON_COLLECTION_MUTATION,
   HIDE_TAG_ON_COLLECTION_MUTATION,
   RENAME_GROUP_MUTATION,
   HIDE_THING_ON_COLLECTION_MUTATION,
   SET_COLUMN_ORDER_MUTATION,
   ADD_LINK_TO_GROUP_MUTATION
} from './queriesAndMutations';
import X from '../Icons/X';
import { getUniversalTags, groupSort } from './cardHandling';
import TaxInput from '../ThingParts/TaxInput';
import useMe from '../Account/useMe';
import { getRandomString } from '../../lib/TextHandling';

const StyledCardList = styled.div``;

const CollectionsGroup = ({
   groupObj,
   collectionID,
   userGroups,
   hiddenGroups,
   hiddenThings,
   deleteGroupHandler,
   expandedCards
}) => {
   const { id, includedLinks, title, type } = groupObj;
   const {
      loggedInUserID,
      memberFields: { displayName }
   } = useMe('CollectionsGroup', 'displayName');

   const fullThingData = [];

   const [groupTitle, setGroupTitle] = useState(title);
   const titleRef = useRef(null);

   const [linkToAdd, setLinkToAdd] = useState('');

   const groupRef = useRef(null);

   useEffect(() => {
      setGroupTitle(title);
   }, [title]);

   const [hideGroupOnCollection] = useMutation(
      HIDE_GROUP_ON_COLLECTION_MUTATION
   );

   const [hideTagOnCollection] = useMutation(HIDE_TAG_ON_COLLECTION_MUTATION);

   const [renameGroupOnCollection] = useMutation(RENAME_GROUP_MUTATION, {
      context: {
         debounceKey: collectionID
      }
   });

   const [setColumnOrder] = useMutation(SET_COLUMN_ORDER_MUTATION, {
      onCompleted: data => console.log(data)
   });

   const [hideThingOnCollection] = useMutation(
      HIDE_THING_ON_COLLECTION_MUTATION
   );

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const handleLinkInputKeydown = e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      const now = new Date();
      const newGroupObj = JSON.parse(JSON.stringify(groupObj));
      newGroupObj.includedLinks.push({
         __typename: 'PersonalLink',
         id: `temporary-${getRandomString(12)}`,
         url: e.target.value,
         owner: {
            __typename: 'Member',
            id: loggedInUserID
         },
         title: null,
         description: null,
         partOfTags: [],
         createdAt: now.toISOString(),
         updatedAt: now.toISOString()
      });

      addLinkToCollectionGroup({
         variables: {
            url: e.target.value,
            groupID: id
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addLinkToCollectionGroup: newGroupObj
         }
      });

      setLinkToAdd('');
   };

   // const hideThingHandler = thingID => {
   //    const [thingData] = things.filter(thing => thing.id === thingID);
   //    hideThingOnCollection({
   //       variables: {
   //          collectionID,
   //          thingID
   //       },
   //       optimisticResponse: {
   //          __typename: 'Mutation',
   //          hideThingOnCollection: {
   //             __typename: 'Collection',
   //             id: collectionID,
   //             hiddenThings: [...hiddenThings, thingData]
   //          }
   //       }
   //    });
   // };

   // filteredThings = groupSort(filteredThings, groupObj.order);

   // Then we make a new array with the full data for each of our things
   // let filteredFullThingData = filteredThings.map(thing => {
   //    const [fullData] = fullThingData.filter(data => data.id === thing.id);
   //    return fullData;
   // });
   // Then we need to filter that array again, because some things that are part of the collection will have been removed by the Filter Things input in the CollectionHeader. Those will be undefined when they're converted to FullThingData, so we just remove any undefined items from the array
   // filteredFullThingData = filteredFullThingData.filter(data => data != null);

   // const thingElements = filteredFullThingData.map((thing, index) => (
   //    <CollectionsCard
   //       data={thing}
   //       index={index}
   //       key={thing.id}
   //       userGroups={userGroups}
   //       hiddenGroups={hiddenGroups}
   //       groupType={type}
   //       collectionID={collectionID}
   //       groupID={id}
   //       hideThingHandler={hideThingHandler}
   //       isExpanded={expandedCards.includes(thing.id)}
   //    />
   // ));

   const linkElements = includedLinks.map((link, index) => (
      <CollectionsCard
         data={link}
         index={index}
         key={link.id}
         userGroups={userGroups}
         hiddenGroups={hiddenGroups}
         groupType={type}
         collectionID={collectionID}
         groupID={id}
      />
   ));

   // const universalTags = getUniversalTags(filteredFullThingData);

   return (
      <StyledGroup ref={groupRef} id={groupObj.id} className="collectionGroup">
         <header>
            <input
               type="text"
               className="groupTitle"
               placeholder="Group Title"
               ref={titleRef}
               value={groupTitle}
               onChange={e => {
                  const newTitle = e.target.value;

                  setGroupTitle(newTitle);

                  const thisGroupIndex = userGroups.findIndex(
                     userGroupObj => userGroupObj.id === id
                  );

                  const copiedUserGroups = [...userGroups];
                  copiedUserGroups[thisGroupIndex].title = newTitle;

                  renameGroupOnCollection({
                     variables: {
                        collectionID,
                        groupID: id,
                        newTitle
                     },
                     optimisticResponse: {
                        __typename: 'Mutation',
                        renameGroupOnCollection: {
                           __typename: 'Collection',
                           id: collectionID,
                           userGroups: copiedUserGroups
                        }
                     }
                  });
               }}
               onKeyDown={e => {
                  if (e.key === 'Enter') {
                     e.preventDefault();
                     titleRef.current.blur();
                  }
               }}
            />
            <div className="buttons">
               {type === 'manual' && (
                  <button
                     type="button"
                     onClick={() => {
                        const newHiddenGroups = [...hiddenGroups, groupObj];
                        hideGroupOnCollection({
                           variables: {
                              collectionID,
                              groupID: id
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              hideGroupOnCollection: {
                                 __typename: 'Collection',
                                 id: collectionID,
                                 hiddenGroups: newHiddenGroups
                              }
                           }
                        });
                     }}
                  >
                     hide
                  </button>
               )}
               {type === 'tag' && (
                  <button
                     type="button"
                     onClick={() => {
                        const optimisticResponseAcceptableGroupObj = {
                           __typename: 'Tag',
                           id,
                           author: {
                              __typename: 'Member',
                              displayName,
                              id: loggedInUserID
                           }
                        }; // The store won't update unless we provide an author for the tags
                        const newHiddenTags = [
                           ...hiddenGroups,
                           optimisticResponseAcceptableGroupObj
                        ];
                        hideTagOnCollection({
                           variables: {
                              collectionID,
                              tagID: id
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              hideTagOnCollection: {
                                 __typename: 'Collection',
                                 id: collectionID,
                                 hiddenTags: newHiddenTags
                              }
                           }
                        });
                     }}
                  >
                     hide
                  </button>
               )}
               {type === 'manual' && id !== 'ungrouped' && (
                  <X onClick={() => deleteGroupHandler(title, id)} />
               )}
            </div>
         </header>
         <Droppable droppableId={id} key={id} type="card">
            {provided => (
               <StyledCardList
                  className="droppableWrapper"
                  ref={provided.innerRef}
                  key={id}
                  {...provided.droppableProps}
               >
                  {linkElements.length === 0 && (
                     <div className="blankSpace">
                        Drop cards here to add them to this group
                     </div>
                  )}
                  {linkElements}
                  {provided.placeholder}
               </StyledCardList>
            )}
         </Droppable>
         <footer className="collectionsGroupFooter">
            <input
               type="url"
               placeholder="add link to group"
               value={linkToAdd}
               onChange={e => setLinkToAdd(e.target.value)}
               onKeyDown={handleLinkInputKeydown}
            />
         </footer>
      </StyledGroup>
   );
};
export default CollectionsGroup;
