const { fullThingFields } = require('./CardInterfaces');

function publishThingUpdate(thing, ctx) {
   ctx.pubsub.publish('thing', {
      thing: {
         node: thing
      }
   });
}
exports.publishThingUpdate = publishThingUpdate;

async function updateThingAndNotifySubs(dataObj, thingID, ctx) {
   const updatedThing = await ctx.db.mutation.updateThing(
      {
         where: {
            id: thingID
         },
         data: dataObj
      },
      `{${fullThingFields}}`
   );
   publishThingUpdate(updatedThing, ctx);
   return updatedThing;
}
exports.updateThingAndNotifySubs = updateThingAndNotifySubs;

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

async function searchAvailableTags(searchTerm, ctx, exact) {
   console.log('Searching available tags...');
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
