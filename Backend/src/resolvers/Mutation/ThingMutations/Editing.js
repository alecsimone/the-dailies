const { updateThingAndNotifySubs } = require('../../../utils/ThingHandling');

async function addTagToThing(tagTitle, thingID, ctx) {
   console.log(thingID);
   const existingTags = await ctx.db.query.tags(
      {
         where: {
            AND: [
               {
                  title: tagTitle
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
      `{id owner {id} public}`
   );
   let dataObj;
   if (existingTags[0] != null) {
      dataObj = {
         partOfTags: {
            connect: {
               id: existingTags[0].id
            }
         }
      };
   } else {
      dataObj = {
         partOfTags: {
            create: {
               title: tagTitle
            }
         }
      };
   }
   const updatedThing = await updateThingAndNotifySubs(dataObj, thingID, ctx);
   return updatedThing;
}

async function addTagsToThing(tagTitleArray, thingID, ctx) {
   tagTitleArray.forEach(tagTitle =>
      addTagToThing(tagTitle.trim(), thingID, ctx)
   );
}

async function createThing(parent, args, ctx, info) {
   const { title, link, category, content, tags, privacy } = args;
   const thing = await ctx.db.mutation.createThing(
      {
         data: {
            title,
            link,
            partOfCategory: {
               connect: {
                  title: category
               }
            },
            content: {
               create: {
                  content
               }
            },
            privacy,
            author: {
               connect: {
                  id: ctx.req.memberId
               }
            }
         }
      },
      info
   );

   const tagsArray = tags.split(',');
   await addTagsToThing(tagsArray, thing.id, ctx);

   return thing;
}
exports.createThing = createThing;

async function addContentPieceToThing(parent, { content, thingID }, ctx, info) {
   const dataObj = {
      content: {
         create: {
            content
         }
      }
   };
   const updatedThing = await updateThingAndNotifySubs(dataObj, thingID, ctx);
   return updatedThing;
}
exports.addContentPieceToThing = addContentPieceToThing;

async function deleteContentPieceFromThing(
   parent,
   { contentPieceID, thingID },
   ctx,
   info
) {
   const dataObj = {
      content: {
         delete: {
            id: contentPieceID
         }
      }
   };
   const updatedThing = await updateThingAndNotifySubs(dataObj, thingID, ctx);
   return updatedThing;
}
exports.deleteContentPieceFromThing = deleteContentPieceFromThing;

async function editContentPieceOnThing(
   parent,
   { contentPieceID, content, thingID },
   ctx,
   info
) {
   const dataObj = {
      content: {
         update: {
            where: {
               id: contentPieceID
            },
            data: {
               content
            }
         }
      }
   };
   const updatedThing = await updateThingAndNotifySubs(dataObj, thingID, ctx);
   return updatedThing;
}
exports.editContentPieceOnThing = editContentPieceOnThing;
