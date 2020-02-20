const {
   properDeleteStuff,
   properUpdateStuff,
   isExplodingLink,
   disabledCodewords,
   editPermissionGate
} = require('../../../utils/ThingHandling');
const { publishMeUpdate, sendNotification} = require('../MemberMutations')
const {
   loggedInGate,
   fullMemberGate,
   canEditThing
} = require('../../../utils/Authentication');
const {fullMemberFields} = require('../../../utils/CardInterfaces');

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
      `{id author {id} public}`
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
               author: {
                  connect: {
                     id: ctx.req.memberId
                  }
               }
            }
         }
      };
   }
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx);
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

   if (isExplodingLink(link)) {
      dataObj.featuredImage = link;
   }

   if (content !== '') {
      dataObj.content = {
         create: {
            content
         }
      };
   }
   console.log(dataObj);
   if (dataObj.title == null) {
      dataObj.title = "Untitled Thing"
   }
   console.log(dataObj);
   const thing = await ctx.db.mutation.createThing(
      {
         data: dataObj
      },
      info
   );

   const tagsArray = tags.split(',');
   await addTagsToThing(tagsArray, thing.id, ctx);

   publishMeUpdate(ctx);

   return thing;
}
exports.createThing = createThing;

async function newBlankThing(parent, args, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const newThing = properUpdateStuff({}, 'new', 'Thing', ctx);
   return newThing;
}
exports.newBlankThing = newBlankThing;

async function addContentPiece(parent, { content, id, type }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      content: {
         create: {
            content
         }
      }
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedThing;
}
exports.addContentPiece = addContentPiece;

async function deleteContentPiece(
   parent,
   { contentPieceID, id, type },
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
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedThing;
}
exports.deleteContentPiece = deleteContentPiece;

async function editContentPiece(
   parent,
   { contentPieceID, content, id, type },
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
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedThing;
}
exports.editContentPiece = editContentPiece;

async function reorderContent(parent, {id, type, oldPosition, newPosition}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);
   const oldContent = await ctx.db.query[type.toLowerCase()](
      {
         where: {
            id
         }
      },
      `{content {id} contentOrder}`
   );

   let order;
   if (oldContent.contentOrder != null) {
      order = [];
      oldContent.contentOrder.forEach(id => {
         const [piece] = oldContent.content.filter(contentPiece => contentPiece.id === id);
         if (piece != null) {
            order.push(id);
         }
      })
      oldContent.content.forEach(contentPiece => {
         if (oldContent.contentOrder.includes(contentPiece.id)) {
            return;
         }
         order.push(contentPiece.id);
      });
   } else {
      order = oldContent.content.map(content => content.id);
   }

   order.splice(newPosition, 0, order.splice(oldPosition, 1)[0]);

   const dataObj = {
      contentOrder: {
         set: order
      }
   }

   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedThing;
}
exports.reorderContent = reorderContent;

async function setThingPrivacy(parent, { privacySetting, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      privacy: privacySetting
   };
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx);
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
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx);
   return updatedThing;
}
exports.setThingCategory = setThingCategory;

async function setFeaturedImage(
   parent,
   { featuredImage, id, type },
   ctx,
   info
) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   if (!isExplodingLink(featuredImage) && !disabledCodewords.includes(featuredImage)) {
      throw new Error("That's not a valid featured image");
   }

   const dataObj = {
      featuredImage
   };

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedStuff;
}
exports.setFeaturedImage = setFeaturedImage;

async function setThingTitle(parent, { title, thingID }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      title
   };
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx);
   return updatedThing;
}
exports.setThingTitle = setThingTitle;

async function setPublicity(parent, {public, id, type}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      public
   };
   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedStuff;
}
exports.setPublicity = setPublicity;

async function addComment(parent, {comment, id, type}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      comments: {
         create:{
            comment,
            author: {
               connect: {
                  id: ctx.req.memberId
               }
            }
         }
      }
   }

   sendNotification({
      kind: "comment",
      linkQuery: id
   }, ctx);

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedStuff;
}
exports.addComment = addComment;

async function editComment(parent, { commentID, stuffID, type, newComment}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      comments: {
         update: {
            where: {
               id: commentID
            },
            data: {
               comment: newComment
            }
         }
      }
   }

   const updatedStuff = await properUpdateStuff(dataObj, stuffID, type, ctx);
   return updatedStuff;
}
exports.editComment = editComment;

async function deleteComment(parent, { commentID, stuffID, type }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      comments: {
         delete: {
            id: commentID
         }
      }
   }

   const updatedStuff = await properUpdateStuff(dataObj, stuffID, type, ctx);
   return updatedStuff;
}
exports.deleteComment = deleteComment;

async function editLink(parent, {link, id}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      link
   }

   const updatedStuff = await properUpdateStuff(dataObj, id, "Thing", ctx);
   return updatedStuff;

}
exports.editLink = editLink;

async function deleteThing(parent, {id}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, ctx.req.memberId, 'Thing', ctx);

   const deletedThing = await ctx.db.mutation.deleteThing({
      where: {
         id
      }
   },
   info);

   publishMeUpdate(ctx);
   return deletedThing;
}
exports.deleteThing = deleteThing;

async function deleteTag(parent, {id}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, ctx.req.memberId, 'Tag', ctx);

   const deletedTag = await ctx.db.mutation.deleteTag({
      where: {
         id
      }
   },
   info);

   return deletedTag;
}
exports.deleteTag = deleteTag;