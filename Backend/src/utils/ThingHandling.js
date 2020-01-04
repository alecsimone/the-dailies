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
