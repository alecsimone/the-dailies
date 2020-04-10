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

async function addTaxToThing(taxTitle, thingID, ctx, personal) {
   // Note: there's an addTaxToThingHandler shoved in between the client and this function. This is the function shared by other backend operations.

   const typeToQuery = personal ? 'stacks' : 'tags';
   const partOf = personal ? 'partOfStacks' : 'partOfTags';
   const where = {};
   if (personal) {
      where.author = {
         id: ctx.req.memberId
      }
   }
   const allTaxes = await ctx.db.query[typeToQuery](
      {
         where
      },
      `{id title author {id}}`
   );

   const relevantTaxes = allTaxes.filter(tax => tax.title.toLowerCase().trim() == taxTitle.toLowerCase().trim());

   let dataObj;
   if (relevantTaxes[0] != null) {
      dataObj = {
         [partOf]: {
            connect: {
               id: relevantTaxes[0].id
            }
         }
      };
   } else {
      dataObj = {
         [partOf]: {
            create: {
               title: taxTitle.trim(),
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
async function addTaxToThingHandler(parent, { tax, thingID, personal }, ctx, info) {
   if (tax === '') {
      throw new Error('Tax cannot be empty');
   }
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   if (tax.includes(',')) {
      const taxArray = tax.split(',');
      addTaxesToThing(taxArray, thingID, ctx, personal);
      return;
   }
   const updatedThing = await addTaxToThing(tax, thingID, ctx, personal);
   return updatedThing;
}
exports.addTaxToThingHandler = addTaxToThingHandler;

async function addTaxesToThing(taxTitleArray, thingID, ctx, personal) {
   taxTitleArray.forEach(tagTitle => {
      if (tagTitle !== '') {
         addTaxToThing(tagTitle.trim(), thingID, ctx, personal);
      }
   });
}

async function createThing(parent, args, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const { title, link, content, tags, privacy } = args;
   const dataObj = {
      title,
      link,
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
   if (dataObj.title == null) {
      dataObj.title = "Untitled Thing"
   }
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

async function setStuffTitle(parent, { title, id, type }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      title
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedThing;
}
exports.setStuffTitle = setStuffTitle;

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

async function deleteTax(parent, {id, personal}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const type = personal ? 'Stack' : 'Tag'

   editPermissionGate({}, id, type, ctx);

   const mutationType = `delete${type}`
   const deletedTax = await ctx.db.mutation[mutationType]({
      where: {
         id
      }
   },
   info);

   return deletedTax;
}
exports.deleteTax = deleteTax;

async function setColor(parent, { color, id, type}, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, id, type, ctx);

   const dataObj = {
      color
   };

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx);
   return updatedStuff;
}
exports.setColor = setColor;