const { fullThingFields, tagFields } = require('./CardInterfaces');

function publishStuffUpdate(type, stuff, ctx) {
   const lowerCasedType = type.toLowerCase();
   ctx.pubsub.publish(lowerCasedType, {
      [lowerCasedType]: {
         node: stuff
      }
   });
}

async function updateStuffAndNotifySubs(data, id, type, ctx) {
   const mutationType = `update${type}`;
   let fields;
   if (type === 'Tag') {
      fields = tagFields;
   } else if (type === 'Thing') {
      fields = fullThingFields;
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
   if (
      ctx.req.member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      )
   ) {
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

   const lowerCasedType = type.toLowerCase();
   let fields;
   if (type === 'Tag') {
      fields = `{owner {id} public}`;
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

   let ownerOrAuthor;
   if (type === 'Tag') {
      ownerOrAuthor = 'owner';
   } else {
      ownerOrAuthor = 'author';
   }

   if (oldStuff[ownerOrAuthor].id !== ctx.req.memberId && !oldStuff.public) {
      throw new Error(
         `You do not have permission to edit that ${lowerCasedType}`
      );
   }
   return true;
}

async function properUpdateStuff(dataObj, id, type, ctx) {
   const lowerCasedType = type.toLowerCase();
   let fields;
   if (type === 'Tag') {
      fields = `{owner {id} public}`;
   } else if (type === 'Thing') {
      fields = `{author {id}}`;
   }

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
                        owner: {
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
      `{id title owner {id} public}`
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

const canSeeThingGate = (thingData, ctx) => {
   if (ctx.req.memberId === thingData.author.id) {
   } else if (thingData.privacy === 'Private') {
      throw new Error("You don't have permission to see that thing.");
   } else if (
      thingData.privacy === 'Friends' &&
      !thingData.author.friends.some(friend => friend.id === ctx.req.memberId)
   ) {
      throw new Error("You don't have permission to see that thing.");
   } else if (
      thingData.privacy === 'FriendsOfFriends' &&
      !thingData.author.friends.some(friend =>
         friend.friends.some(
            friendOfFriend => friendOfFriend.id === ctx.req.memberId
         )
      )
   ) {
      throw new Error("You don't have permission to see that thing.");
   }
};
exports.canSeeThingGate = canSeeThingGate;
