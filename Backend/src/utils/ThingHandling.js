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
                           id: ctx.req.memberID
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
