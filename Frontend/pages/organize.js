import gql from 'graphql-tag';
import styled, { ThemeContext } from 'styled-components';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Masonry from 'react-masonry-css';
import { useContext, useState, useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { MemberContext } from '../components/Account/MemberProvider';
import LoadingRing from '../components/LoadingRing';
import { fullMemberFields, thingCardFields } from '../lib/CardInterfaces';
import OrganizationGroup from '../components/Organize/OrganizationGroup';
import { setAlpha } from '../styles/functions';
import { getRandomString } from '../lib/TextHandling';
import { REMOVE_TAX_MUTATION } from '../components/ThingParts/Taxes';

const MY_BIG_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String) {
      myThings(cursor: $cursor) {
         ${thingCardFields}
      }
   }
`;

const STORE_ORGANIZE_STATE_MUTATION = gql`
   mutation STORE_ORGANIZE_STATE_MUTATION($state: String!) {
      storeOrganizeState(state: $state) {
         ${fullMemberFields}
      }
   }
`;

const ADD_TAX_BY_ID_MUTATION = gql`
   mutation ADD_TAX_BY_ID_MUTATION($tax: ID!, $thingID: ID!, $personal: Boolean) {
      addTaxToThingById(tax: $tax, thingID: $thingID, personal: $personal) {
         ${thingCardFields}
      }
   }
`;

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

const Organize = () => {
   const { me, loading: loadingMe } = useContext(MemberContext);
   let myID;
   if (me && me.id) {
      myID = me.id;
   }

   const {
      mobileBPWidthRaw,
      desktopBPWidthRaw,
      bigScreenBPWidthRaw,
      massiveScreenBPWidthRaw
   } = useContext(ThemeContext);

   const defaultState = {
      filterString: '',
      hiddenThings: [],
      groupByTag: false,
      hiddenTags: [],
      hiddenGroups: [],
      userGroups: [],
      groupOrders: []
   };
   let initialState;
   if (me && me.organizePageState != null) {
      initialState = me.organizePageState;
   } else {
      initialState = defaultState;
   }

   const [state, setState] = useState(initialState);

   const setStateHandler = async (property, value) => {
      setState({
         ...state,
         [property]: value
      });
   };

   const renameGroup = (id, newTitle) => {
      const userGroupsCopy = [...userGroups];
      const groupToRenameIndex = userGroupsCopy.findIndex(
         groupObj => groupObj.id === id
      );
      userGroupsCopy[groupToRenameIndex].title = newTitle;
      setStateHandler('userGroups', userGroupsCopy);
   };

   const hideGroup = (id, type) => {
      if (type === 'tag') {
         setStateHandler('hiddenTags', [...hiddenTags, id]);
      } else if (type === 'manual') {
         setStateHandler('hiddenGroups', [...hiddenGroups, id]);
      }
   };

   const removeGroup = id => {
      const newUserGroups = userGroups.filter(groupObj => groupObj.id !== id);
      setStateHandler('userGroups', newUserGroups);
   };

   const [storeState] = useMutation(STORE_ORGANIZE_STATE_MUTATION);

   const [addTaxByID] = useMutation(ADD_TAX_BY_ID_MUTATION);

   const [removeTaxFromThing] = useMutation(REMOVE_TAX_MUTATION, {
      onCompleted: data => console.log(data)
   });

   useEffect(() => {
      if (loadingMe) return;
      const jsonifiedState = JSON.stringify(state);
      if (me.organizePageState === jsonifiedState || state == null) return;
      storeState({
         variables: {
            state: jsonifiedState
         },
         context: {
            debounceKey: myID
         }
      });
   }, [loadingMe, me, myID, state, storeState]);

   useEffect(() => {
      if (!loadingMe && me != null && me.organizePageState != null) {
         const parsedState = JSON.parse(me.organizePageState);
         if (typeof parsedState !== 'object' || parsedState == null) return;
         setState(parsedState);
      }
   }, [loadingMe, me]);

   const { data, loading, error, fetchMore } = useQuery(MY_BIG_THINGS_QUERY, {
      ssr: false,
      skip: me == null && !loadingMe
   });

   const [isFetchingMore, setIsFetchingMore] = useState(false);
   const [noMoreToFetch, setNoMoreToFetch] = useState(false);
   const cursorRef = useRef(null);

   const defaultOrderRef = useRef([]);

   if (loadingMe || state == null) return <LoadingRing />;

   const {
      filterString,
      hiddenThings,
      groupByTag,
      hiddenTags,
      hiddenGroups,
      userGroups,
      groupOrders
   } = state;

   const fetchMoreHandler = () => {
      if (isFetchingMore || noMoreToFetch) return;
      setIsFetchingMore(true);

      fetchMore({
         variables: {
            cursor: cursorRef.current
         },
         updateQuery: (prev, { fetchMoreResult }) => {
            setIsFetchingMore(false);

            if (!fetchMoreResult) return prev;
            if (!prev) return fetchMoreResult;

            if (
               fetchMoreResult.myThings &&
               fetchMoreResult.myThings.length === 0
            ) {
               setNoMoreToFetch(true);
            }

            return {
               myThings: [...prev.myThings, ...fetchMoreResult.myThings]
            };
         }
      });
   };

   const handleDragEnd = result => {
      const { destination, source, draggableId: rawDraggableId } = result;

      const draggableIdSeparatorIndex = rawDraggableId.indexOf('-');
      const draggableId = rawDraggableId.substring(
         draggableIdSeparatorIndex + 1
      );

      if (
         destination == null ||
         ((destination.droppableId === 'tagless' ||
            destination.droppableId === 'ungrouped') &&
            source.droppableId !== destination.droppableId)
      ) {
         if (groupByTag === true) {
            console.log('removing the tag');
            // Remove the tag
            const [tagObj] = defaultOrderRef.current.filter(
               groupObj => groupObj.id === source.droppableId
            );

            const [thingData] = data.myThings.filter(
               thing => thing.id === draggableId
            );

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
         } else {
            // We need to remove it from the source group
            // First we find the thing
            const [thingData] = data.myThings.filter(
               thing => thing.id === draggableId
            );

            // Then we make a copy of the userGroups array
            const userGroupsCopy = [...userGroups];

            // And find the group we're dropping onto within it
            const sourceGroupIndex = userGroupsCopy.findIndex(
               groupObj => groupObj.id === source.droppableId
            );

            // Then we remove the thing from that group
            const newThings = userGroupsCopy[sourceGroupIndex].things.filter(
               thing => thing.id !== draggableId
            );
            userGroupsCopy[sourceGroupIndex].things = newThings;

            // And push to state
            setStateHandler('userGroups', userGroupsCopy);
         }
      }

      if (destination == null) return;

      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      )
         return;

      // Check if there's an order for the source group in state
      const [sourceOrder] = groupOrders.filter(
         orderObj => orderObj.id === source.droppableId
      );

      // If there is, copy it
      let newSourceOrder;
      if (sourceOrder != null) {
         newSourceOrder = [...sourceOrder.order];
      } else {
         // If there isn't, make one from the defaultOrderRef
         const [defaultSourceOrder] = defaultOrderRef.current.filter(
            orderObj => orderObj.id === source.droppableId
         );
         newSourceOrder = [...defaultSourceOrder.order];
      }
      // And then rearrange it
      newSourceOrder.splice(source.index, 1);

      // Check if there's an order for the destination group in state
      const [destinationOrder] = groupOrders.filter(
         orderObj => orderObj.id === destination.droppableId
      );

      // If there is, copy it
      let newDestinationOrder;
      if (destinationOrder != null) {
         newDestinationOrder = [...destinationOrder.order];
      } else {
         // If there isn't, make one from the defaultOrderRef
         const [defaultDestinationOrder] = defaultOrderRef.current.filter(
            orderObj => orderObj.id === destination.droppableId
         );
         newDestinationOrder = [...defaultDestinationOrder.order];
      }
      // And then rearrange it
      newDestinationOrder.splice(destination.index, 0, draggableId);

      // Then we update state. First we make a copy of the groupOrders array
      const groupOrdersCopy = [...groupOrders];

      // Then we update the source order array
      const indexOfSource = groupOrdersCopy.findIndex(
         orderObj => orderObj.id === source.droppableId
      );
      if (indexOfSource !== -1) {
         groupOrdersCopy[indexOfSource].order = newSourceOrder;
      } else {
         groupOrdersCopy.push({
            id: source.droppableId,
            order: newSourceOrder
         });
      }

      // Then we update the destination order array
      const indexOfDestination = groupOrdersCopy.findIndex(
         orderObj => orderObj.id === destination.droppableId
      );
      if (indexOfDestination !== -1) {
         groupOrdersCopy[indexOfDestination].order = newDestinationOrder;
      } else {
         groupOrdersCopy.push({
            id: destination.droppableId,
            order: newDestinationOrder
         });
      }

      // If the thing was dragged onto a different group from where it started, add it to that group, and if it's a manual group, remove it from the original group
      if (destination.droppableId !== source.droppableId) {
         if (groupByTag === true) {
            // First let's get the data for the thing to use in our optimistic response
            const [thingData] = data.myThings.filter(
               thing => thing.id === draggableId
            );

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
         } else {
            // We need to add it to the destination group
            // First we find the thing
            const [thingData] = data.myThings.filter(
               thing => thing.id === draggableId
            );

            // Then we make a copy of the userGroups array
            const userGroupsCopy = [...userGroups];

            // And find the group we're dropping onto within it
            const destinationGroupIndex = userGroupsCopy.findIndex(
               groupObj => groupObj.id === destination.droppableId
            );

            // Then we add the thing to that group
            userGroupsCopy[destinationGroupIndex].things.push(thingData);

            if (source.droppableId !== 'ungrouped') {
               // And find the group we're dragging from within it
               const sourceGroupIndex = userGroupsCopy.findIndex(
                  groupObj => groupObj.id === source.droppableId
               );

               // And remove it from the original group
               const newThings = userGroupsCopy[sourceGroupIndex].things.filter(
                  thing => thing.id !== draggableId
               );
               userGroupsCopy[sourceGroupIndex].things = newThings;
            }

            // And push to state
            setStateHandler('userGroups', userGroupsCopy);
         }
      }

      // And finally, we push to state
      setStateHandler('groupOrders', groupOrdersCopy);
   };

   let content;
   if (data) {
      const { myThings } = data;
      myThings.sort((a, b) => {
         const aDate = new Date(a.updatedAt);
         const bDate = new Date(b.updatedAt);

         const aTimestamp = aDate.getTime();
         const bTimestamp = bDate.getTime();

         return bTimestamp - aTimestamp;
      });
      const lastThing = myThings[myThings.length - 1];
      cursorRef.current = lastThing.updatedAt;

      const filteredThings = myThings.filter(thing => {
         if (hiddenThings.includes(thing.id)) return false;
         if (filterString.trim() === '') return true;

         if (
            thing.title.toLowerCase().includes(filterString.toLocaleLowerCase())
         )
            return true;
         return false;
      });
      if (groupByTag) {
         const tagsArray = [
            { id: 'tagless', title: 'Tagless', type: 'tag', things: [] }
         ];
         filteredThings.forEach(thing => {
            if (thing.partOfTags.length === 0) {
               const indexOfTaglessObj = tagsArray.findIndex(
                  tagObj => tagObj.id === 'tagless'
               );
               tagsArray[indexOfTaglessObj].things.push(thing);
            } else {
               thing.partOfTags.forEach(tag => {
                  const indexOfTagObj = tagsArray.findIndex(
                     tagObj => tagObj.id === tag.id
                  );
                  if (indexOfTagObj === -1) {
                     tagsArray.push({
                        id: tag.id,
                        title: tag.title,
                        type: 'tag',
                        things: [thing]
                     });
                  } else {
                     tagsArray[indexOfTagObj].things.push(thing);
                  }
               });
            }
         });

         const filteredTagsArray = tagsArray.filter(
            tagObj => !hiddenTags.includes(tagObj.id)
         );

         const tagGroups = filteredTagsArray.map(tagObj => {
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
                  setStateHandler={setStateHandler}
                  order={groupOrder == null ? null : groupOrder.order}
                  hideGroup={hideGroup}
               />
            );
         });
         content = (
            <Masonry
               breakpointCols={{
                  default: 1,
                  9999: 3,
                  [bigScreenBPWidthRaw]: 2,
                  [desktopBPWidthRaw]: 1
               }}
               className="masonryContainer"
               columnClassName="column"
            >
               {tagGroups}
            </Masonry>
         );
      } else if (userGroups.length === 0) {
         const groupObj = {
            id: 'ungrouped',
            title: 'Ungrouped',
            type: 'manual',
            things: filteredThings
         };

         const defaultOrder = filteredThings.map(thing => thing.id);
         const refIndex = defaultOrderRef.current.findIndex(
            orderObj => orderObj.id === 'ungrouped'
         );
         if (refIndex === -1) {
            defaultOrderRef.current.push({
               id: 'ungrouped',
               title: 'Ungrouped',
               order: defaultOrder
            });
         } else {
            defaultOrderRef.current[refIndex].order = defaultOrder;
         }

         content = (
            <OrganizationGroup
               groupObj={groupObj}
               setStateHandler={setStateHandler}
            />
         );
      } else {
         // First we make a copy of the user groups
         const userGroupsCopy = [...userGroups];

         // Then we need to make a group for all the ungrouped things
         const ungroupedThings = filteredThings.filter(thing => {
            // We'll go through each thing, and for each thing, we'll check each group to see if it's in it
            let isGrouped = false;
            userGroups.forEach(group => {
               const [foundThing] = group.things.filter(
                  groupedThing => groupedThing.id === thing.id
               );
               if (foundThing != null) {
                  isGrouped = true;
               }
            });
            // Things that aren't grouped pass the filter test to make it into our new group
            return !isGrouped;
         });
         // Then we add the ungrouped things group to our user group
         userGroupsCopy.push({
            id: 'ungrouped',
            title: 'Ungrouped',
            type: 'manual',
            things: ungroupedThings
         });

         // now we need to make a list of the default order for each group so we know where to put things when we rearrange them
         userGroupsCopy.forEach(groupObj => {
            // First we find the default order of this group
            const defaultOrder = groupObj.things.map(thing => thing.id);

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
                  setStateHandler={setStateHandler}
                  renameGroup={renameGroup}
                  order={groupOrder == null ? null : groupOrder.order}
                  hideGroup={hideGroup}
                  removeGroup={groupObj.id === 'ungrouped' ? null : removeGroup}
               />
            );
         });
         content = (
            <Masonry
               breakpointCols={{
                  default: 1,
                  9999: 3,
                  [bigScreenBPWidthRaw]: 2,
                  [desktopBPWidthRaw]: 1
               }}
               className="masonryContainer"
               columnClassName="column"
            >
               {groupElements}
            </Masonry>
         );
      }
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <DragDropContext onDragEnd={handleDragEnd}>
         <StyledOrganizePage>
            {data && (
               <div className="filterManagement">
                  <input
                     className="filter"
                     type="text"
                     placeholder="Filter"
                     value={filterString}
                     onChange={e =>
                        setStateHandler('filterString', e.target.value)
                     }
                  />
                  <div className="buttons">
                     <button
                        onClick={() =>
                           setStateHandler('groupByTag', !groupByTag)
                        }
                     >
                        {groupByTag ? 'group manually' : 'group by tag'}
                     </button>
                     {!groupByTag && (
                        <button
                           onClick={() => {
                              const randomID = getRandomString(32);
                              const newGroups = [
                                 ...userGroups,
                                 {
                                    id: randomID,
                                    title: 'Untitled Group',
                                    type: 'manual',
                                    things: []
                                 }
                              ];
                              setStateHandler('userGroups', newGroups);
                           }}
                        >
                           add group
                        </button>
                     )}
                     {hiddenTags.length > 0 && (
                        <button
                           onClick={() => setStateHandler('hiddenTags', [])}
                        >
                           show hidden tags
                        </button>
                     )}
                     {hiddenGroups.length > 0 && (
                        <button
                           onClick={() => setStateHandler('hiddenGroups', [])}
                        >
                           show hidden groups
                        </button>
                     )}
                     {hiddenThings.length > 0 && (
                        <button
                           onClick={() => setStateHandler('hiddenThings', [])}
                        >
                           show hidden things
                        </button>
                     )}
                     {JSON.stringify(state) !==
                        JSON.stringify(defaultState) && (
                        <button onClick={() => setState(defaultState)}>
                           reset page
                        </button>
                     )}
                  </div>
               </div>
            )}
            {content}
            {data && (
               <button className="more" onClick={fetchMoreHandler}>
                  {isFetchingMore
                     ? 'Loading...'
                     : `${noMoreToFetch ? 'No More' : 'Load More'}`}
               </button>
            )}
         </StyledOrganizePage>
      </DragDropContext>
   );
};

export default Organize;
