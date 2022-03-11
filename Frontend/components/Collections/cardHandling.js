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

const hideCard = (cardID, groupID, userGroups, groupByTag, hiddenThings) => {
   if (userGroups != null && userGroups.length > 0 && groupID != null) {
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
