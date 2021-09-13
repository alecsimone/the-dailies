import CollectionsGroup from './CollectionsGroup';

const sortByUpdatedTime = (a, b) => {
   const aDate = new Date(a.updatedAt);
   const bDate = new Date(b.updatedAt);

   const aTimestamp = aDate.getTime();
   const bTimestamp = bDate.getTime();

   return bTimestamp - aTimestamp;
};
export { sortByUpdatedTime };

const sortByID = (a, b) => {
   if (a.id != null && b.id != null) {
      // If we're getting an object with an ID property, use that
      if (a.id < b.id) {
         return 1;
      }
      return -1;
   }
   // Otherwise, assume we're just getting an array of IDs, and use the values directly
   if (a < b) {
      return 1;
   }
   return -1;
};
export { sortByID };

const groupSort = (items, order) => {
   items.sort((a, b) => {
      if (order != null && order.length > 0) {
         const aIndex = order.indexOf(a.id != null ? a.id : a);
         const bIndex = order.indexOf(b.id != null ? b.id : b);

         if (aIndex === -1) {
            return 1;
         }

         if (bIndex === -1) {
            return -1;
         }

         return aIndex - bIndex;
      }
      return sortByID(a, b);
   });
   return items;
};
export { groupSort };

const makeGroups = (
   things,
   userGroups,
   hiddenGroups,
   hiddenTags,
   groupByTag,
   collectionID,
   hiddenThings,
   ungroupedThingsOrder,
   tagOrders,
   deleteGroupHandler,
   expandedCards
) => {
   let groupElements = [];
   if (groupByTag) {
      // We need to filter the things array to take out any things that have tags while at the same time making an array with CollectionsGroup elements for each tag
      const tagsArray = [];
      const untaggedThings = things.filter(thing => {
         // First we check if the thing is tagged
         const thingIsTagged =
            thing.partOfTags != null && thing.partOfTags.length > 0;

         // Then we need to check if at least one of the tags has not been hidden
         let someTagNotHidden = false;
         thing.partOfTags.forEach(tagObj => {
            const hiddenTagIndex = hiddenTags.findIndex(
               hiddenTagObj => hiddenTagObj.id === tagObj.id
            );
            if (hiddenTagIndex === -1) {
               someTagNotHidden = true;
            }
         });

         // if it is, we put it in the group object for each of its unhidden tags
         if (thingIsTagged && someTagNotHidden) {
            thing.partOfTags.forEach(tagObj => {
               // First we check if a groupObj already exists for this tag
               const thisTagIndex = tagsArray.findIndex(
                  obj => obj.id === tagObj.id
               );

               if (thisTagIndex !== -1) {
                  // If it does, we add this thing to that groupObj's things array
                  tagsArray[thisTagIndex].things.push(thing);
               } else {
                  // If it doesn't, we check if this tag has been hidden
                  const hiddenTagIndex = hiddenTags.findIndex(
                     hiddenTagObj => hiddenTagObj.id === tagObj.id
                  );
                  if (hiddenTagIndex === -1) {
                     // If it's not hidden, we create a groupObj for this tag and put this thing in its things array
                     // First we have to pull its order out of tagOrders
                     const [thisOrder] = tagOrders.filter(
                        orderObj => orderObj.tag.id === tagObj.id
                     );

                     const groupObj = {
                        id: tagObj.id,
                        title: tagObj.title,
                        type: 'tag',
                        things: [thing],
                        order: thisOrder == null ? [] : thisOrder.order,
                        tagOrderID: thisOrder == null ? null : thisOrder.id
                     };
                     tagsArray.push(groupObj);
                  }
               }
            });
         } else {
            // if it isn't, we can just return true
            return true;
         }
      });
      // Then we add the untaggedThings groupObj to the tagsArray
      tagsArray.push({
         id: 'untagged',
         title: 'Untagged',
         type: 'tag',
         things: untaggedThings
      });

      // Then we make a groupElements array with CollectionsGroups for each tag
      groupElements = tagsArray.map(groupObj => (
         <CollectionsGroup
            groupObj={groupObj}
            key={groupObj.id}
            collectionID={collectionID}
            hiddenGroups={hiddenTags}
            hiddenThings={hiddenThings}
            deleteGroupHandler={deleteGroupHandler}
            expandedCards={expandedCards}
         />
      ));
   } else {
      // First, let's make a filteredGroups array that filters out any hidden groups
      const filteredGroups = userGroups.filter(groupObj => {
         let groupIsHidden = false;
         if (hiddenGroups != null) {
            hiddenGroups.forEach(hiddenGroupObj => {
               if (hiddenGroupObj.id === groupObj.id) {
                  groupIsHidden = true;
               }
            });
         }
         return !groupIsHidden;
      });

      // We need to filter the things array to take out any things that are in a group while at the same time making an array with CollectionsGroup elements for each group
      const ungroupedThings = things.filter(thing => {
         let thingIsUngrouped = true;
         if (filteredGroups != null) {
            filteredGroups.forEach(groupObj => {
               groupObj.things.forEach(thingData => {
                  if (thingData.id === thing.id) {
                     thingIsUngrouped = false;
                  }
               });
               // If groupElements doesn't already include this thing, we need to add it
               const thisGroupIndex = groupElements.findIndex(
                  element => element.props.groupObj.id === groupObj.id
               );

               if (thisGroupIndex === -1) {
                  // First though, we need to clarify that it's a manual group
                  groupObj.type = 'manual';
                  groupElements.push(
                     <CollectionsGroup
                        groupObj={groupObj}
                        key={groupObj.id}
                        collectionID={collectionID}
                        userGroups={userGroups}
                        hiddenGroups={hiddenGroups}
                        hiddenThings={hiddenThings}
                        deleteGroupHandler={deleteGroupHandler}
                        expandedCards={expandedCards}
                     />
                  );
               }
            });
         }
         return thingIsUngrouped;
      });

      // Then we make a groupObj for the ungrouped things
      const ungroupedObj = {
         id: 'ungrouped',
         title: 'Ungrouped',
         type: 'manual',
         things: ungroupedThings,
         order: ungroupedThingsOrder
      };

      // and push a CollectionsGroup with that data to the groupElements array
      groupElements.push(
         <CollectionsGroup
            groupObj={ungroupedObj}
            key={ungroupedObj.id}
            collectionID={collectionID}
            userGroups={userGroups}
            hiddenGroups={hiddenGroups}
            hiddenThings={hiddenThings}
            deleteGroupHandler={deleteGroupHandler}
            expandedCards={expandedCards}
         />
      );
   }
   return groupElements;
};
export { makeGroups };

const hideCard = (cardID, groupID, userGroups, groupByTag, hiddenThings) => {
   if (
      userGroups != null &&
      userGroups.length > 0 &&
      groupByTag === false &&
      groupID != null
   ) {
      // If we're doing user groups, and we have some user groups, we want to check if this thing is in more than one of them, because if it is, we just want to remove it from the group that it's in
      // If we find more than one group with the thing in it, we just want to remove it from the group the instance of it we clicked on was in
   }
};
export { hideCard };

const getUniversalTags = things => {
   let universalTags = [];
   things.forEach((thing, index) => {
      if (index === 0) {
         // If this is the first thing, we take its list of tags as our starting point
         universalTags = thing.partOfTags;
      } else {
         // On every subsequent thing, we filter that list to take out any tags that aren't on this thing
         universalTags = universalTags.filter(tag => {
            let tagPresent = false;

            // if we can find the tag in the things list of tags, then that tag can stay in our list
            const tagIndex = thing.partOfTags.findIndex(
               thingTag => thingTag.id === tag.id
            );
            if (tagIndex !== -1) {
               tagPresent = true;
            }
            return tagPresent;
         });
      }
   });
   return universalTags;
};
export { getUniversalTags };
