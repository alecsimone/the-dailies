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
   SET_COLUMN_ORDER_MUTATION
} from './queriesAndMutations';
import X from '../Icons/X';
import { MemberContext } from '../Account/MemberProvider';
import { getUniversalTags, groupSort, sortByID } from './cardHandling';
import TaxInput from '../ThingParts/TaxInput';
import { CollectionsThingsContext } from '../../pages/collections';

const StyledCardList = styled.div``;

const CollectionsGroup = ({
   groupObj,
   collectionID,
   userGroups,
   hiddenGroups,
   hiddenThings,
   deleteGroupHandler
}) => {
   const { id, things, title, type } = groupObj;
   const { me } = useContext(MemberContext);

   const { things: fullThingData } = useContext(CollectionsThingsContext);

   const [groupTitle, setGroupTitle] = useState(title);
   const titleRef = useRef(null);

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

   const hideThingHandler = thingID => {
      const [thingData] = things.filter(thing => thing.id === thingID);
      hideThingOnCollection({
         variables: {
            collectionID,
            thingID
         },
         optimisticResponse: {
            __typename: 'Mutation',
            hideThingOnCollection: {
               __typename: 'Collection',
               id: collectionID,
               hiddenThings: [...hiddenThings, thingData]
            }
         }
      });
   };

   // First we filter our things to take out any that have been hidden
   let filteredThings = things.filter(thing => {
      let thingIsHidden = false;
      hiddenThings.forEach(hiddenThing => {
         if (hiddenThing.id === thing.id) {
            thingIsHidden = true;
         }
      });
      return !thingIsHidden;
   });

   filteredThings = groupSort(filteredThings, groupObj.order);

   // Then we make a new array with the full data for each of our things
   let filteredFullThingData = filteredThings.map(thing => {
      const [fullData] = fullThingData.filter(data => data.id === thing.id);
      return fullData;
   });
   // Then we need to filter that array again, because some things that are part of the collection will have been removed by the Filter Things input in the CollectionHeader. Those will be undefined when they're converted to FullThingData, so we just remove any undefined items from the array
   filteredFullThingData = filteredFullThingData.filter(data => data != null);

   const thingElements = filteredFullThingData.map((thing, index) => (
      <CollectionsCard
         data={thing}
         index={index}
         key={thing.id}
         userGroups={userGroups}
         hiddenGroups={hiddenGroups}
         groupType={type}
         collectionID={collectionID}
         groupID={id}
         hideThingHandler={hideThingHandler}
      />
   ));

   const universalTags = getUniversalTags(filteredFullThingData);

   return (
      <StyledGroup ref={groupRef} id={groupObj.id} className="collectionGroup">
         <header>
            {(type === 'tag' || id === 'ungrouped') && <h3>{title}</h3>}
            {type === 'manual' && id !== 'ungrouped' && (
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
            )}
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
                              displayName: me.displayName,
                              id: me.id
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
                  {thingElements.length === 0 && (
                     <div className="blankSpace">
                        Drop cards here to add them to this group
                     </div>
                  )}
                  {thingElements}
                  {provided.placeholder}
               </StyledCardList>
            )}
         </Droppable>
         {thingElements.length > 0 && (
            <TaxInput
               id={things.map(thing => thing.id)}
               tags={universalTags}
               personal={false}
               thingData={filteredFullThingData}
               containerRef={groupRef.current}
            />
         )}
      </StyledGroup>
   );
};
export default CollectionsGroup;
