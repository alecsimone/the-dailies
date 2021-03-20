const { AuthenticationError } = require('apollo-server-express');
const {
   properDeleteStuff,
   properUpdateStuff,
   isExplodingLink,
   disabledCodewords,
   editPermissionGate,
   lengthenTikTokURL
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
   ).catch(err => {
      throw new Error(err.message);
   });

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
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
async function addTaxToThingHandler(parent, { tax, thingID, personal }, ctx, info) {
   if (tax === '') {
      throw new Error('Tax cannot be empty');
   }
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (tax.includes(',')) {
      const taxArray = tax.split(',');
      addTaxesToThing(taxArray, thingID, ctx, personal);
      return;
   }
   const updatedThing = await addTaxToThing(tax, thingID, ctx, personal).catch(err => {
      console.log(err);
   });
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

async function removeTaxFromThing(parent, {tax, thingID, personal}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const mutationName = personal ? 'partOfStacks' : 'partOfTags'

   const oldThing = await ctx.db.query.thing({where: {id: thingID}}, `{id partOfTags {title} partOfStacks {title}}`);

   if (personal) {
      const [existingStack] = oldThing.partOfStacks.filter(stack => stack.title === tax);
      if (existingStack == null) {
         throw new Error("This thing isn't a part of that stack");
      }
   } else {
      const [existingTag] = oldThing.partOfTags.filter(tag => tag.title === tax);
      if (existingTag == null) {
         throw new Error("That tag isn't on this thing");
      }
   }

   const dataObj = {
      [mutationName]: {
         disconnect: {
            title: tax
         }
      }
   }

   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.removeTaxFromThing = removeTaxFromThing;

async function createThing(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
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
   ).catch(err => {
      console.log(err);
   });

   const tagsArray = tags.split(',');
   await addTagsToThing(tagsArray, thing.id, ctx).catch(err => {
      console.log(err);
   });

   publishMeUpdate(ctx);

   return thing;
}
exports.createThing = createThing;

async function newBlankThing(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const newThing = await properUpdateStuff({}, 'new', 'Thing', ctx);
   publishMeUpdate(ctx);
   return newThing;
}
exports.newBlankThing = newBlankThing;

async function addContentPiece(parent, { content, id, type }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   content = await lengthenTikTokURL(content).catch(err => {
      console.log(err);
   });

   const dataObj = {
      content: {
         create: {
            content
         }
      }
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.addContentPiece = addContentPiece;

async function deleteContentPiece(
   parent,
   { contentPieceID, id, type },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const {contentOrder: oldContentOrder} = await ctx.db.query[type.toLowerCase()](
      {
         where: {
            id
         }
      },
      `{contentOrder}`
   ).catch(err => {
      console.log(err);
   });

   const newContentOrder = oldContentOrder.filter(id => id !== contentPieceID);

   const dataObj = {
      content: {
         delete: {
            id: contentPieceID
         }
      },
      contentOrder: {
         set: newContentOrder
      }
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.deleteContentPiece = deleteContentPiece;

async function editContentPiece(
   parent,
   { contentPieceID, content, id, type },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   content = await lengthenTikTokURL(content).catch(err => {
      console.log(err);
   });

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
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.editContentPiece = editContentPiece;

async function reorderContent(parent, {id, type, oldPosition, newPosition}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   const oldContent = await ctx.db.query[type.toLowerCase()](
      {
         where: {
            id
         }
      },
      `{content {id} contentOrder}`
   ).catch(err => {
      console.log(err);
   });

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

   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.reorderContent = reorderContent;

async function setThingPrivacy(parent, { privacySetting, thingID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      privacy: privacySetting
   };
   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.setThingPrivacy = setThingPrivacy;

async function setFeaturedImage(
   parent,
   { featuredImage, id, type },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   featuredImage = await lengthenTikTokURL(featuredImage).catch(err => {
      console.log(err);
   });

   if (!isExplodingLink(featuredImage) && !disabledCodewords.includes(featuredImage.toLowerCase())) {
      throw new Error("That's not a valid featured image");
   }

   const dataObj = {
      featuredImage
   };

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.setFeaturedImage = setFeaturedImage;

async function setStuffTitle(parent, { title, id, type }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      title
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.setStuffTitle = setStuffTitle;

async function setPublicity(parent, {public, id, type}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      public
   };
   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.setPublicity = setPublicity;

async function addComment(parent, {comment, id, type, replyToID}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   comment = await lengthenTikTokURL(comment).catch(err => {
      console.log(err);
   });

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

   if (replyToID != null) {
      const updatedComment = await ctx.db.mutation.updateComment({
         where: {
            id: replyToID
         },
         data: {
            replies: {
               create: {
                  comment,
                  author: {
                     connect: {
                        id: ctx.req.memberId
                     }
                  },
                  replyTo: {
                     connect: {
                        id: replyToID
                     }
                  },
                  [`on${type}`]: {
                     connect: {
                        id
                     }
                  }
               }
            }
         }
      }, info).catch(err => {
         console.log(err);
      });
      let lowerCasedType = type.toLowerCase();
      if (type === "ContentPiece") {lowerCasedType = 'contentPiece';}
      const updatedStuff = await ctx.db.query[lowerCasedType]({
         where: {
            id
         }
      }, info).catch(err => {
         console.log(err);
      });
      return updatedStuff;
   } else {
      const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
         console.log(err);
      });
      return updatedStuff;
   }
}
exports.addComment = addComment;

async function editComment(parent, { commentID, stuffID, type, newComment}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   newComment = await lengthenTikTokURL(newComment).catch(err => {
      console.log(err);
   });

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

   const updatedStuff = await properUpdateStuff(dataObj, stuffID, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.editComment = editComment;

async function deleteComment(parent, { commentID, stuffID, type }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const oldComment = await ctx.db.query.comment({
      where: {
         id: commentID
      }
   }, `{replies {id}}`).catch(err => {
      console.log(err);
   });

   let dataObj;
   // If the comment has replies, we just want to set its text to [deleted]. Otherwise we can actually delete it.
   if (oldComment && oldComment.replies != null && oldComment.replies.length > 0) {
      dataObj = {
         comments: {
            update: {
               where: {
                  id: commentID
               },
               data: {
                  comment: '//[deleted]//',
                  author: {
                     connect: {
                        id: 'deleted'
                     }
                  },
               }
            }
         }
      }
   } else {
      dataObj = {
         comments: {
            delete: {
               id: commentID
            }
         }
      }
   }


   const updatedStuff = await properUpdateStuff(dataObj, stuffID, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.deleteComment = deleteComment;

async function editLink(parent, {link, id}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      link
   }

   const updatedStuff = await properUpdateStuff(dataObj, id, "Thing", ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;

}
exports.editLink = editLink;

async function deleteThing(parent, {id}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, ctx.req.memberId, 'Thing', ctx);

   const deletedThing = await ctx.db.mutation.deleteThing({
      where: {
         id
      }
   },
      info).catch(err => {
         console.log(err);
      });

   publishMeUpdate(ctx);
   return deletedThing;
}
exports.deleteThing = deleteThing;

async function deleteTax(parent, {id, personal}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const type = personal ? 'Stack' : 'Tag'

   editPermissionGate({}, id, type, ctx);

   const mutationType = `delete${type}`
   const deletedTax = await ctx.db.mutation[mutationType]({
      where: {
         id
      }
   },
      info).catch(err => {
         console.log(err);
      });

   return deletedTax;
}
exports.deleteTax = deleteTax;

async function setColor(parent, { color, id, type}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, id, type, ctx);

   const dataObj = {
      color
   };

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.setColor = setColor;

async function editSummary(parent, {summary, id, type}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, id, type, ctx);

   summary = await lengthenTikTokURL(summary).catch(err => {
      console.log(err);
   });

   const dataObj = {
      summary
   };

   const updatedStuff = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.editSummary = editSummary;

async function copyContentPiece(parent, {contentPieceID, newThingID}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (newThingID.toLowerCase() === 'new') {
      const dataObj = {
         copiedInContent: {
            connect: {
               id: contentPieceID
            }
         },
         contentOrder: {
            set: [contentPieceID]
         }
      }

      const updatedStuff = await properUpdateStuff(dataObj, newThingID, 'Thing', ctx).catch(err => {
         console.log(err);
      });
      return updatedStuff;
   }

   editPermissionGate({}, newThingID, 'Thing', ctx);

   const oldThing = await ctx.db.query.thing(
      {
         where: {
            id: newThingID
         }
      },
      `{id content {id} copiedInContent {id} contentOrder}`
   ).catch(err => {
      console.log(err);
   });

   // Make a new array containing the content, previous copied in content, and the new copied in content
   let originalContent = [];
   if (oldThing.content != null) {
      originalContent = oldThing.content.map(contentObject => contentObject.id);
   }

   let oldCopiedContent = [];
   if (oldThing.copiedInContent != null) {
      oldCopiedContent = oldThing.copiedInContent.map(contentObject => contentObject.id);
   }

   const allContentArray = originalContent.concat(oldCopiedContent);
   allContentArray.push(contentPieceID);

   // Go through old content order, add anything that still exists to a new order array
   const {contentOrder} = oldThing;
   let newContentOrder = []
   if (contentOrder != null) {
      newContentOrder = contentOrder.filter(
         contentID => allContentArray.includes(contentID)
      );
   }

   // Go through the allContentArray and filter out anything that's already in our content order
   const filteredContentArray = allContentArray.filter(contentID => !newContentOrder.includes(contentID));

   // Add any content pieces that weren't in the old order array. Because we used concat, originalContent will be first in the allContentArray, followed by old copied in content, followed by the new copied in content, so we can just iterate over that
   filteredContentArray.forEach(contentID => newContentOrder.push(contentID));


   const dataObj = {
      copiedInContent: {
         connect: {
            id: contentPieceID
         }
      },
      contentOrder: {
         set: newContentOrder
      }
   }

   const updatedStuff = await properUpdateStuff(dataObj, newThingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.copyContentPiece = copyContentPiece;

async function unlinkContentPiece(parent, {contentPieceID, thingID}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);
   editPermissionGate({}, thingID, 'Thing', ctx);

   const dataObj = {
      copiedInContent: {
         disconnect: {
            id: contentPieceID
         }
      }
   }

   const updatedStuff = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.unlinkContentPiece = unlinkContentPiece;