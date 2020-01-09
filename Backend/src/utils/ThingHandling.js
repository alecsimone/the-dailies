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
   let mutationType;
   let fields;
   if (type === 'Tag') {
      mutationType = 'updateTag';
      fields = tagFields;
   } else if (type === 'Thing') {
      mutationType = 'updateThing';
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

async function properUpdateStuff(dataObj, id, type, ctx) {
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

   if (type === 'Tag') {
      if (
         oldStuff.owner.id !== ctx.req.memberId &&
         !ctx.req.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         ) &&
         !oldStuff.public
      ) {
         throw new Error('You do not have permission to edit that tag');
      }
   }
   if (type === 'Thing') {
      if (
         oldStuff.author.id !== ctx.req.memberId ||
         !ctx.req.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         )
      ) {
         throw new Error('You do not have permission to edit that thing');
      }
   }

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
