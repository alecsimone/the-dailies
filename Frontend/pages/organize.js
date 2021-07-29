import styled, { ThemeContext } from 'styled-components';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Masonry from 'react-masonry-css';
import { useContext, useState, useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { MemberContext } from '../components/Account/MemberProvider';
import LoadingRing from '../components/LoadingRing';
import OrganizationGroup from '../components/Organize/OrganizationGroup';
import {
   StyledOrganizePage,
   MY_BIG_THINGS_QUERY,
   STORE_ORGANIZE_STATE_MUTATION,
   ADD_TAX_BY_ID_MUTATION,
   defaultState,
   untagCard,
   ungroupCard,
   getDraggableId,
   getNewOrders,
   makeNewGroupOrdersArray,
   addTagToCard,
   addCardToGroup,
   sortByUpdatedTime,
   makeTagsArrayFromThings,
   makeTagGroups,
   makeUserGroups
} from '../lib/organizeHandling';
import { getRandomString } from '../lib/TextHandling';
import { REMOVE_TAX_MUTATION } from '../components/ThingParts/Taxes';
import SignupOrLogin from '../components/Account/SignupOrLogin';

const Organize = () => {
   const { me, loading: loadingMe } = useContext(MemberContext);
   let myID;
   if (me && me.id) {
      myID = me.id;
   }

   const { desktopBPWidthRaw, bigScreenBPWidthRaw } = useContext(ThemeContext);

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

   const hideThing = (id, groupID) => {
      if (
         userGroups != null &&
         userGroups.length > 0 &&
         groupByTag === false &&
         groupID != null
      ) {
         // If we're doing user groups, and we have some user groups, we want to check if this thing is in more than one of them, because if it is, we just want to remove it from the group that it's in
         const groupsContainingThing = userGroups.filter(groupObj =>
            groupObj.things.includes(id)
         );

         // If we find more than one group with the thing in it, we just want to remove it from the group the instance of it we clicked on was in
         if (groupsContainingThing.length > 1) {
            const copiedUserGroups = [...userGroups];
            const indexOfGroupToChange = copiedUserGroups.findIndex(
               groupObj => groupObj.id === groupID
            );
            const newThings = copiedUserGroups[
               indexOfGroupToChange
            ].things.filter(thingID => thingID !== id);
            copiedUserGroups[indexOfGroupToChange].things = newThings;
            setStateHandler('userGroups', copiedUserGroups);
            return;
         }
      }
      setStateHandler('hiddenThings', [...hiddenThings, id]);
   };

   const copyThingToGroupByID = (thingID, groupID) =>
      addCardToGroup(
         thingID,
         userGroups,
         { droppableId: groupID },
         { droppableId: 'ungrouped' }, // We use "ungrouped" because we don't want to remove it from the current group
         setStateHandler
      );

   const [storeState] = useMutation(STORE_ORGANIZE_STATE_MUTATION, {
      context: {
         debounceKey: myID
      }
   });

   const [addTaxByID] = useMutation(ADD_TAX_BY_ID_MUTATION);

   const [removeTaxFromThing] = useMutation(REMOVE_TAX_MUTATION, {
      onCompleted: data => console.log(data)
   });

   useEffect(() => {
      if (loadingMe) return;
      const jsonifiedState = JSON.stringify(state);
      if (
         me == null ||
         me.organizePageState === jsonifiedState ||
         state == null
      )
         return;
      storeState({
         variables: {
            state: jsonifiedState
         }
      });
   }, [loadingMe, me, state, storeState]);

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

   if (me == null) return <SignupOrLogin explanation styled />;
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

   const handleDragEnd = ({
      destination,
      source,
      draggableId: rawDraggableId
   }) => {
      const draggableId = getDraggableId(rawDraggableId);

      // If the destination is empty, or if the card is dragged to one of the null groups (and it's not being rearranged within that null group, or from one of the null groups), we want to remove it from the group
      if (
         source.droppableId !== 'tagless' &&
         source.droppableId !== 'ungrouped' &&
         (destination == null ||
            ((destination.droppableId === 'tagless' ||
               destination.droppableId === 'ungrouped') &&
               source.droppableId !== destination.droppableId))
      ) {
         if (groupByTag === true) {
            untagCard(
               defaultOrderRef,
               draggableId,
               source,
               data.myThings,
               removeTaxFromThing
            );
         } else {
            ungroupCard(draggableId, userGroups, source, setStateHandler);
         }
      }

      // If the destination is null, that's all we want to do
      if (destination == null) return;

      // If the card is dropped back where it started, we don't need to do anything. This needs to stay below the destination == null checks or else destination might be undefined
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      )
         return;

      const [newSourceOrder, newDestinationOrder] = getNewOrders(
         groupOrders,
         source,
         destination,
         defaultOrderRef,
         draggableId
      );

      // Then we update state
      const groupOrdersCopy = makeNewGroupOrdersArray(
         groupOrders,
         source,
         destination,
         newSourceOrder,
         newDestinationOrder
      );

      // If the thing was dragged onto a different group from where it started, add it to that group, and if it's a manual group, remove it from the original group
      if (destination.droppableId !== source.droppableId) {
         if (groupByTag === true) {
            addTagToCard(
               data.myThings,
               draggableId,
               defaultOrderRef,
               destination,
               addTaxByID
            );
         } else {
            addCardToGroup(
               draggableId,
               userGroups,
               destination,
               source,
               setStateHandler
            );
         }
      }

      // And finally, we push to state
      setStateHandler('groupOrders', groupOrdersCopy);
   };

   let content;
   if (data) {
      const { myThings } = data;
      myThings.sort(sortByUpdatedTime);
      const lastThing = myThings[myThings.length - 1];
      cursorRef.current = lastThing.updatedAt;

      const filteredThings = myThings.filter(thing => {
         // if the thing has been hidden, skip it
         if (hiddenThings && hiddenThings.includes(thing.id)) return false;
         // If not, if there's no filter string, everything goes in
         if (filterString == null || filterString.trim() === '') return true;

         // If there is a filter string, only put in the things that include it
         if (thing.title.toLowerCase().includes(filterString.toLowerCase()))
            return true;
         return false;
      });

      if (groupByTag) {
         const tagsArray = makeTagsArrayFromThings(filteredThings);

         // We have to take out any tags that have been hidden
         const filteredTagsArray = tagsArray.filter(
            tagObj => !hiddenTags.includes(tagObj.id)
         );

         // And then make groups for each of the ones that remain
         const tagGroups = makeTagGroups(
            filteredTagsArray,
            defaultOrderRef,
            groupOrders,
            setStateHandler,
            hideGroup,
            hideThing,
            myThings
         );

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
      } else if (userGroups == null || userGroups.length === 0) {
         // First we make an array of all the things' ids in their default order
         const defaultOrder = filteredThings.map(thing => thing.id);

         // If they don't have any userGroups, we just need to make one for all the ungrouped things
         const groupObj = {
            id: 'ungrouped',
            title: 'Ungrouped',
            type: 'manual',
            things: defaultOrder
         };

         // Then we check if the defaultOrderRef already has that array in it
         const refIndex = defaultOrderRef.current.findIndex(
            orderObj => orderObj.id === 'ungrouped'
         );
         // If it doesn't, we add it
         if (refIndex === -1) {
            defaultOrderRef.current.push({
               id: 'ungrouped',
               title: 'Ungrouped',
               order: defaultOrder
            });
         } else {
            // If it does, we update it
            defaultOrderRef.current[refIndex].order = defaultOrder;
         }

         content = (
            <OrganizationGroup
               groupObj={groupObj}
               allThings={data.myThings}
               setStateHandler={setStateHandler}
               hideThing={hideThing}
               copyThingToGroupByID={copyThingToGroupByID}
               userGroups={userGroups}
            />
         );
      } else {
         const groupElements = makeUserGroups(
            userGroups,
            filteredThings,
            defaultOrderRef,
            hiddenGroups,
            groupOrders,
            setStateHandler,
            renameGroup,
            hideGroup,
            removeGroup,
            hideThing,
            copyThingToGroupByID
         );
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

   const toggleGroupButton = (
      <button onClick={() => setStateHandler('groupByTag', !groupByTag)}>
         {groupByTag ? 'group manually' : 'group by tag'}
      </button>
   );

   const addGroupButton = (
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
   );

   const showHiddenTagsButton = (
      <button onClick={() => setStateHandler('hiddenTags', [])}>
         show hidden tags
      </button>
   );

   const showHiddenGroupsButton = (
      <button onClick={() => setStateHandler('hiddenGroups', [])}>
         show hidden groups
      </button>
   );

   const showHiddenThingsButton = (
      <button onClick={() => setStateHandler('hiddenThings', [])}>
         show hidden things
      </button>
   );

   const resetpageButton = (
      <button onClick={() => setState(defaultState)}>reset page</button>
   );

   const fetchMoreButton = (
      <button className="more" onClick={fetchMoreHandler}>
         {isFetchingMore
            ? 'Loading...'
            : `${noMoreToFetch ? 'No More' : 'Load More'}`}
      </button>
   );

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
                     {toggleGroupButton}
                     {!groupByTag && addGroupButton}
                     {hiddenTags &&
                        hiddenTags.length > 0 &&
                        showHiddenTagsButton}
                     {hiddenGroups &&
                        hiddenGroups.length > 0 &&
                        showHiddenGroupsButton}
                     {hiddenThings &&
                        hiddenThings.length > 0 &&
                        showHiddenThingsButton}
                     {JSON.stringify(state) !== JSON.stringify(defaultState) &&
                        resetpageButton}
                  </div>
               </div>
            )}
            {content}
            {data && fetchMoreButton}
         </StyledOrganizePage>
      </DragDropContext>
   );
};

export default Organize;
