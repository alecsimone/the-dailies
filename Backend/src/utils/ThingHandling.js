const { fullThingFields } = require('./CardInterfaces');

function publishThingUpdate(thing, ctx) {
   ctx.pubsub.publish('thing', {
      thing: {
         node: thing
      }
   });
}
exports.publishThingUpdate = publishThingUpdate;

async function updateThingAndNotifySubs(data, thingID, ctx) {
   const updatedThing = await ctx.db.mutation.updateThing(
      {
         where: {
            id: thingID
         },
         data
      },
      `{${fullThingFields}}`
   );
   publishThingUpdate(updatedThing, ctx);
   return updatedThing;
}
exports.updateThingAndNotifySubs = updateThingAndNotifySubs;

async function updateTagAndNotifySubs(data, tagID, ctx) {
   const updatedTag = await ctx.db.mutation.updateTag(
      {
         where: {
            id: tagID
         },
         data
      },
      `{__typename id featuredImage}`
   );
   return updatedTag;
}

async function properUpdateThing(dataObj, thingID, ctx) {
   const oldThing = await ctx.db.query.thing(
      {
         where: {
            id: thingID
         }
      },
      `{author {id}}`
   );
   if (
      oldThing.author.id !== ctx.req.memberId ||
      !ctx.req.member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      )
   ) {
      throw new Error('You do not have permission to edit that thing');
   }

   const updatedThing = await updateThingAndNotifySubs(dataObj, thingID, ctx);
   return updatedThing;
}
exports.properUpdateThing = properUpdateThing;

async function properUpdateTag(dataObj, tagID, ctx) {
   const oldTag = await ctx.db.query.tag(
      {
         where: {
            id: tagID
         }
      },
      `{owner {id} public}`
   );
   if (
      oldTag.owner.id !== ctx.req.memberId &&
      !ctx.req.member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      ) && !public
   ) {
      throw new Error('You do not have permission to edit that tag');
   }
   const updatedTag = await updateTagAndNotifySubs(dataObj, tagID, ctx);
   return updatedTag;
}
exports.properUpdateTag = properUpdateTag;

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
