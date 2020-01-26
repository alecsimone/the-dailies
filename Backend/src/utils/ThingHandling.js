const {
   fullThingFields,
   tagFields,
   catFields,
   fullMemberFields
} = require('./CardInterfaces');

async function publishMeUpdate(ctx) {
   const newMe = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{${fullMemberFields}}`
   );
   ctx.pubsub.publish('me', {
      me: {
         node: newMe
      }
   });
}
exports.publishMeUpdate = publishMeUpdate;

function publishStuffUpdate(type, stuff, ctx) {
   const lowerCasedType = type.toLowerCase();
   ctx.pubsub.publish(lowerCasedType, {
      [lowerCasedType]: {
         node: stuff
      }
   });
   if (type === 'Thing') {
      publishMeUpdate(ctx);
   }
}

async function updateStuffAndNotifySubs(data, id, type, ctx) {
   const mutationType = `update${type}`;
   let fields;
   if (type === 'Tag') {
      fields = tagFields;
   } else if (type === 'Thing') {
      fields = fullThingFields;
   } else if (type === 'Category') {
      fields = catFields;
   }

   const updatedStuff = await ctx.db.mutation[mutationType](
      {
         where: {
            id
         },
         data
      },
      `{${fields}}`
   );
   publishStuffUpdate(type, updatedStuff, ctx);
   return updatedStuff;
}

async function editPermissionGate(dataObj, id, type, ctx) {
   // Mods can edit anything
   if (['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)) {
      return true;
   }

   if (dataObj.comments) {
      if (dataObj.comments.create) {
         // Anyone can comment on anything
         return true;
      }
      let commentID;
      if (dataObj.comments.delete) {
         commentID = dataObj.comments.delete.id;
      } else if (dataObj.comments.update) {
         commentID = dataObj.comments.update.id;
      }
      const comment = await ctx.db.query.comment(
         {
            where: {
               id: commentID
            }
         },
         `{author {id}}`
      );
      if (comment.author.id !== ctx.req.memberId) {
         throw new Error('You do not have permission to edit that comment');
      }
      return true;
   }

   if (type === 'Category') {
      // Only mods can do anything to categories besides comment
      return false;
   }

   const lowerCasedType = type.toLowerCase();
   let fields;
   if (type === 'Tag') {
      fields = `{author {id} public}`;
   } else if (type === 'Thing') {
      fields = `{author {id}}`;
   }
   const oldStuff = await ctx.db.query[lowerCasedType](
      {
         where: {
            id
         }
      },
      `${fields}`
   );

   if (oldStuff.author.id !== ctx.req.memberId && !oldStuff.public) {
      throw new Error(
         `You do not have permission to edit that ${lowerCasedType}`
      );
   }
   return true;
}

async function properUpdateStuff(dataObj, id, type, ctx) {
   editPermissionGate(dataObj, id, type, ctx);

   const updatedStuff = await updateStuffAndNotifySubs(dataObj, id, type, ctx);
   return updatedStuff;
}
exports.properUpdateStuff = properUpdateStuff;

async function searchAvailableTags(searchTerm, ctx, exact) {
   return ctx.db.query.tags(
      {
         where: {
            AND: [
               {
                  [exact ? 'title' : 'title_contains']: searchTerm
               },
               {
                  OR: [
                     {
                        author: {
                           id: ctx.req.memberId
                        }
                     },
                     {
                        public: true
                     }
                  ]
               }
            ]
         }
      },
      `{id title author {id} public}`
   );
}
exports.searchAvailableTags = searchAvailableTags;

const isExplodingLink = url => {
   const lowerCaseURL = url.toLowerCase();
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.gif') ||
      lowerCaseURL.includes('.mp4') ||
      lowerCaseURL.includes('.webm') ||
      lowerCaseURL.includes('gfycat.com/') ||
      lowerCaseURL.includes('youtube.com/watch?v=') ||
      lowerCaseURL.includes('youtu.be/') ||
      (lowerCaseURL.includes('twitter.com/') &&
         lowerCaseURL.includes('/status/'))
   ) {
      return true;
   }
   return false;
};
exports.isExplodingLink = isExplodingLink;

const canSeeThing = (memberID, thingData) => {
   if (memberID === thingData.author.id) {
      return true;
   }
   if (thingData.privacy === 'Private') {
      return false;
   }
   if (
      thingData.privacy === 'Friends' &&
      !thingData.author.friends.some(friend => friend.id === memberID)
   ) {
      return false;
   }
   if (
      thingData.privacy === 'FriendsOfFriends' &&
      !thingData.author.friends.some(friend =>
         friend.friends.some(friendOfFriend => friendOfFriend.id === memberID)
      )
   ) {
      return false;
   }
   return true;
};
exports.canSeeThing = canSeeThing;

const canSeeThingGate = async (where, ctx) => {
   const thingData = await ctx.db.query.thing(
      {
         where
      },
      `{privacy author {id friends {id friends {id}}}}`
   );

   if (canSeeThing(ctx.req.memberId, thingData)) {
      return true;
   }
   throw new Error("You don't have permission to see that thing.");
};
exports.canSeeThingGate = canSeeThingGate;

const canSeeTagGate = async (where, ctx) => {
   const tagData = await ctx.db.query.tag(
      {
         where
      },
      `{public author {id friends {id friends {id}}}}`
   );

   if (tagData.public) {
      return true;
   }
   if (ctx.req.memberId !== tagData.author.id) {
      throw new Error("You don't have permission to see that tag.");
   }
};
exports.canSeeTagGate = canSeeTagGate;