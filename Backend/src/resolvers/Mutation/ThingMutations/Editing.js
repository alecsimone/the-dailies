const { properUpdateThing } = require('../../../utils/ThingHandling');
const {
   loggedInGate,
   fullMemberGate,
   canEditThing
} = require('../../../utils/Authentication');

async function addTagToThing(tagTitle, thingID, ctx) {
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
               title: tagTitle,
               owner: {
                  connect: {
                     id: ctx.req.memberId
                  }
               }
            }
         }
      };
   }
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
async function addTagToThingHandler(parent, { tag, thingID }, ctx, info) {
   if (tag === '') {
      throw new Error('Tag cannot be empty');
   }
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   if (tag.includes(',')) {
      const tagsArray = tag.split(',');
      addTagsToThing(tagsArray, thingID, ctx);
      return;
   }
   const updatedThing = await addTagToThing(tag, thingID, ctx);
   return updatedThing;
}
exports.addTagToThingHandler = addTagToThingHandler;

async function addTagsToThing(tagTitleArray, thingID, ctx) {
   tagTitleArray.forEach(tagTitle => {
      if (tagTitle !== '') {
         addTagToThing(tagTitle.trim(), thingID, ctx);
      }
   });
}

async function createThing(parent, args, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const { title, link, category, content, tags, privacy } = args;
   const dataObj = {
      title,
      link,
      partOfCategory: {
         connect: {
            title: category
         }
      },
      privacy,
      author: {
         connect: {
            id: ctx.req.memberId
         }
      }
   };
   if (content !== '') {
      dataObj.content = {
         create: {
            content
         }
      };
   }
   const thing = await ctx.db.mutation.createThing(
      {
         data: dataObj
      },
      info
   );

   const tagsArray = tags.split(',');
   await addTagsToThing(tagsArray, thing.id, ctx);

   return thing;
}
exports.createThing = createThing;

async function addContentPieceToThing(parent, { content, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      content: {
         create: {
            content
         }
      }
   };
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.addContentPieceToThing = addContentPieceToThing;

async function deleteContentPieceFromThing(
   parent,
   { contentPieceID, thingID },
   ctx,
   info
) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      content: {
         delete: {
            id: contentPieceID
         }
      }
   };
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.deleteContentPieceFromThing = deleteContentPieceFromThing;

async function editContentPieceOnThing(
   parent,
   { contentPieceID, content, thingID },
   ctx,
   info
) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

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
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.editContentPieceOnThing = editContentPieceOnThing;

async function setThingPrivacy(parent, { privacySetting, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      privacy: privacySetting
   };
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.setThingPrivacy = setThingPrivacy;

async function setThingCategory(parent, { category, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      partOfCategory: {
         connect: {
            title: category
         }
      }
   };
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.setThingCategory = setThingCategory;

async function setFeaturedImage(parent, { featuredImage, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      featuredImage
   };

   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.setFeaturedImage = setFeaturedImage;

async function setThingTitle(parent, { title, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      title
   };
   const updatedThing = await properUpdateThing(dataObj, thingID, ctx);
   return updatedThing;
}
exports.setThingTitle = setThingTitle;
