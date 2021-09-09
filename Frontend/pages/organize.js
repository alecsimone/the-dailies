import { useQuery, useMutation } from '@apollo/react-hooks';
import React, { useContext, useState, useRef, useEffect } from 'react';
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
import { REMOVE_TAX_MUTATION } from '../components/ThingParts/Taxes';
import SignupOrLogin from '../components/Account/SignupOrLogin';
import Columnizer from '../components/Columnizer';
import { getRandomString, isValidJSON } from '../lib/TextHandling';

const OrganizeContext = React.createContext();
export { OrganizeContext };

const Organize = () => {
   const { me, loading: loadingMe } = useContext(MemberContext);

   let initialState;
   if (me && me.organizePageState != null) {
      initialState = me.organizePageState;
   } else {
      initialState = defaultState;
   }

   const [state, setState] = useState(initialState);

   const {
      filterString,
      hiddenThings,
      groupByTag,
      hiddenTags,
      hiddenGroups,
      userGroups,
      groupOrders,
      expandedCards,
      columnOrders,
      tagColumnOrders
   } = state;

   const setStateHandler = async (property, value) => {
      setState({
         ...state,
         [property]: value
      });
   };

   const [storeState] = useMutation(STORE_ORGANIZE_STATE_MUTATION, {
      context: {
         debounceKey: me == null ? 'organize' : me.id
      }
   });

   const [addTaxByID] = useMutation(ADD_TAX_BY_ID_MUTATION);

   const [removeTaxFromThing] = useMutation(REMOVE_TAX_MUTATION);

   useEffect(() => {
      if (loadingMe) return;
      const jsonifiedState = isValidJSON(state) ? state : JSON.stringify(state);
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
         if (!isValidJSON(me.organizePageState)) return;

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
   const defaultGroupOrderRef = useRef([]);
   const defaultTagOrderRef = useRef([]);

   if (me == null) return <SignupOrLogin explanation styled />;
   if (loadingMe || state == null) return <LoadingRing />;

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
      draggableId: rawDraggableId,
      type
   }) => {
      const draggableId = getDraggableId(rawDraggableId);

      if (type === 'group') {
         // We aren't going to support removing groups by dragging to empty space, because that's too similar to what it's like to drag into a column, and removing groups is easy enough already. So if the destination is null, we're just going to back out.
         if (destination == null) return;

         // If the group is dropped back where it started, we don't need to do anything. This needs to stay below the destination == null check or else destination might be undefined
         if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
         )
            return;

         // Otherwise, we need to rearrange the groups
         if (groupByTag === true) {
            let tagColumnOrdersCopy;
            if (tagColumnOrders == null || tagColumnOrders.length === 0) {
               tagColumnOrdersCopy = defaultTagOrderRef.current;
            } else {
               tagColumnOrdersCopy = [...tagColumnOrders];
            }
            tagColumnOrdersCopy[source.droppableId].splice(source.index, 1);
            tagColumnOrdersCopy[destination.droppableId].splice(
               destination.index,
               0,
               draggableId
            );
            setStateHandler('tagColumnOrders', tagColumnOrdersCopy);
            return;
         }
         let columnOrdersCopy;
         if (columnOrders == null || columnOrders.length === 0) {
            columnOrdersCopy = defaultGroupOrderRef.current;
         } else {
            columnOrdersCopy = [...columnOrders];
         }
         columnOrdersCopy[source.droppableId].splice(source.index, 1);
         columnOrdersCopy[destination.droppableId].splice(
            destination.index,
            0,
            draggableId
         );
         setStateHandler('columnOrders', columnOrdersCopy);
         return;
      }

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
               expandedCards,
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
            groupOrders
         );

         content = (
            <Columnizer
               items={tagGroups}
               columnOrders={tagColumnOrders}
               defaultGroupOrderRef={defaultTagOrderRef}
            />
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

         const [ungroupedGroupOrder] = groupOrders.filter(
            orderObj => orderObj.id === 'ungrouped'
         );

         content = (
            <OrganizationGroup
               groupObj={groupObj}
               order={
                  ungroupedGroupOrder == null ? null : ungroupedGroupOrder.order
               }
            />
         );
      } else {
         const groupElements = makeUserGroups(
            userGroups,
            filteredThings,
            defaultOrderRef,
            hiddenGroups,
            groupOrders
         );
         content = (
            <Columnizer
               items={groupElements}
               columnOrders={columnOrders}
               defaultGroupOrderRef={defaultGroupOrderRef}
            />
         );
      }
   } else if (loading) {
      content = <LoadingRing />;
   }

   const toggleGroupButton = (
      <button
         type="button"
         onClick={() => setStateHandler('groupByTag', !groupByTag)}
      >
         {groupByTag ? 'group manually' : 'group by tag'}
      </button>
   );

   const addGroupButton = (
      <button
         type="button"
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
      <button type="button" onClick={() => setStateHandler('hiddenTags', [])}>
         show hidden tags
      </button>
   );

   const showHiddenGroupsButton = (
      <button type="button" onClick={() => setStateHandler('hiddenGroups', [])}>
         show hidden groups
      </button>
   );

   const showHiddenThingsButton = (
      <button type="button" onClick={() => setStateHandler('hiddenThings', [])}>
         show hidden things
      </button>
   );

   const resetpageButton = (
      <button type="button" onClick={() => setState(defaultState)}>
         reset page
      </button>
   );

   const fetchMoreButton = (
      <button type="button" className="more" onClick={fetchMoreHandler}>
         {isFetchingMore
            ? 'Loading...'
            : `${noMoreToFetch ? 'No More' : 'Load More'}`}
      </button>
   );

   return (
      <OrganizeContext.Provider
         value={{
            groupByTag,
            allThings: data == null ? null : data.myThings,
            setStateHandler,
            userGroups,
            hiddenThings,
            hiddenTags,
            hiddenGroups,
            expandedCards
         }}
      >
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
                        {JSON.stringify(state) !==
                           JSON.stringify(defaultState) && resetpageButton}
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
                     </div>
                  </div>
               )}
               {content}
               {data && fetchMoreButton}
            </StyledOrganizePage>
         </DragDropContext>
      </OrganizeContext.Provider>
   );
};

export default Organize;
