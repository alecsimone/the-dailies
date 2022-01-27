const { AuthenticationError } = require('apollo-server-express');
const {
   properDeleteStuff,
   properUpdateStuff,
   isExplodingLink,
   disabledCodewords,
   editPermissionGate,
   lengthenTikTokURL
} = require('../../../utils/ThingHandling');
const { sendNotification} = require('../MemberMutations')
const {
   loggedInGate,
   fullMemberGate,
   canEditThing
} = require('../../../utils/Authentication');
const {fullMemberFields, smallThingCardFields, fullThingFields} = require('../../../utils/CardInterfaces');
const { getLinksToCard, replaceLinkWithText } = require('../../../utils/TextHandling');

async function addTaxToThing(taxTitle, thingID, ctx, personal, finalTax = true) {
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

   // If we're adding multiple tags, we only want to trigger the subscription update on the final one
   let updatedThing
   if (finalTax) {
      updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
         console.log(err);
      });
   } else {
      updatedThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: dataObj
         },
         `{${fullThingFields}}`
      );
   }

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
      const updatedThing = await addTaxesToThing(taxArray, thingID, ctx, personal);
      return updatedThing;
   }
   const updatedThing = await addTaxToThing(tax, thingID, ctx, personal).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.addTaxToThingHandler = addTaxToThingHandler;

async function addTaxesToThing(taxTitleArray, thingID, ctx, personal) {
   let updatedThing;

   // We need to let the addTaxToThing function know if this is the last tax we're adding, or else it will trigger a subscription update for each tag, and that'll override our response causing the tags to show up one at a time.
   let i = 1;
   let totalTaxesCount = taxTitleArray.length;
   for (const taxTitle of taxTitleArray) {
      if (taxTitle != '') {
         updatedThing = await addTaxToThing(taxTitle.trim(), thingID, ctx, personal, i === totalTaxesCount);
      }
      i += 1;
   }
   return updatedThing;
}

async function addTaxToThings(taxTitle, thingIDs, ctx, personal) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First we have to figure out the author and id of the provided tax
   const queryName = personal ? 'stack' : 'tag'
   const taxData = await ctx.db.query[queryName]({
      where: {
         title: taxTitle
      }
   }, `{id author {id}}`);

   // If the author of the thing isn't the currently logged in user, don't go any further
   if (taxData.author.id !== ctx.req.memberId && !['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)) {
      throw new AuthenticationError("You don't have permission to do that!");
   }

   // Then we're going to update the provided tax by connecting it to all the provided things
   const mutationName = personal ? 'updateStack' : 'updateTag';

   // In order to do that, first we have to turn the thingIDs array into an array of objects of the shape {id: 'thingID'};
   const thingIDObjects = thingIDs.map(id => {return {id}});

   const updatedTax = await ctx.db.mutation[mutationName](
      {
         where: {
            id: taxData.id
         },
         data: {
            connectedThings: {
               connect: thingIDObjects
            }
         }
      }, `{connectedThings {${smallThingCardFields}}}`
   );

   // Then we're going to filter the returned connectedThings array to get just the things we want and return that array
   const filteredThings = updatedTax.connectedThings.filter(
      thing => thingIDs.includes(thing.id)
   );
   return filteredThings;
}

async function addTaxToThingById(parent, {tax, thingID, personal}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const partOf = personal ? 'partOfStacks' : 'partOfTags';

   const dataObj = {
      [partOf]: {
         connect: {
            id: tax
         }
      }
   }

   const updatedThing = await properUpdateStuff(dataObj, thingID, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.addTaxToThingById = addTaxToThingById;

async function addTaxesToThings(parent, {taxes, thingIDs, personal}, ctx, info) {
   if (taxes === '') {
      throw new Error('Tax cannot be empty');
   }
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (taxes.includes(',')) {
      const taxArray = taxes.split(',');
      let updatedThings;
      for (const tax of taxArray) {
         updatedThings = await addTaxToThings(tax, thingIDs, ctx, personal) // Because we're updating the same things over and over, we can ust take the last one we get and return that
      }
      return updatedThings;
   }
   const updatedThings = await addTaxToThings(taxes, thingIDs, ctx, personal).catch(err => {
      console.log(err);
   });
   return updatedThings;
}
exports.addTaxesToThings = addTaxesToThings;

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

async function newBlankThing(parent, args, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const newThing = await properUpdateStuff({}, 'new', 'Thing', ctx);
   ctx.pubsub.publish('myThings', {
      myThings: {
         node: newThing,
         updatedFields: ['create']
      }
   });
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

   const [connect, create] = await getLinksToCard(content, ctx);

   content = await replaceLinkWithText(content);

   const dataObj = {
      content: {
         create: {
            content,
            links: {
               connect,
               create
            }
         }
      },
      unsavedNewContent: null
   };
   const updatedThing = await properUpdateStuff(dataObj, id, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.addContentPiece = addContentPiece;

async function storeUnsavedThingChanges(parent, {id, unsavedContent}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   unsavedContent = await lengthenTikTokURL(unsavedContent).catch(err => {
      console.log(err);
   });

   const dataObj = {
      unsavedNewContent: unsavedContent
   }

   const updatedThing = await properUpdateStuff(dataObj, id, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.storeUnsavedThingChanges = storeUnsavedThingChanges;

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

   const [connect, create] = await getLinksToCard(content, ctx);

   content = await replaceLinkWithText(content);

   const dataObj = {
      content: {
         update: {
            where: {
               id: contentPieceID
            },
            data: {
               content,
               unsavedNewContent: null,
               links: {
                  connect,
                  create
               }
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

async function storeUnsavedContentPieceChanges(parent, {pieceId, thingId, unsavedContent}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   unsavedContent = await lengthenTikTokURL(unsavedContent).catch(err => {
      console.log(err);
   });

   const existingThing = await ctx.db.query.contentPiece(
      {
         where: {
            id: pieceId
         }
      },
      `{content}`
   );
   let dataObj;
   if (existingThing.content === unsavedContent) {
      dataObj = {
         content: {
            update: {
               where: {
                  id: pieceId
               },
               data: {
                  unsavedNewContent: null
               }
            }
         }
      };
   } else {
      dataObj = {
         content: {
            update: {
               where: {
                  id: pieceId
               },
               data: {
                  unsavedNewContent: unsavedContent
               }
            }
         }
      };
   }

   const updatedThing = await properUpdateStuff(dataObj, thingId, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.storeUnsavedContentPieceChanges = storeUnsavedContentPieceChanges;

async function clearUnsavedContentPieceChanges(parent, {pieceId, thingId}, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      content: {
         update: {
            where: {
               id: pieceId
            },
            data: {
               unsavedNewContent: null
            }
         }
      }
   };
   const updatedThing = await properUpdateStuff(dataObj, thingId, 'Thing', ctx).catch(err => {
      console.log(err);
   });
   return updatedThing;
}
exports.clearUnsavedContentPieceChanges = clearUnsavedContentPieceChanges;

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

async function setStuffPrivacy(parent, { privacySetting, stuffID, type = 'Thing' }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {
      privacy: privacySetting
   };
   const updatedStuff = await properUpdateStuff(dataObj, stuffID, type, ctx).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.setStuffPrivacy = setStuffPrivacy;

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

   if (!isExplodingLink(featuredImage) && !disabledCodewords.includes(featuredImage.toLowerCase()) && featuredImage !== '') {
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

   const [connect, create] = await getLinksToCard(comment, ctx);

   const dataObj = {
      comments: {
         create:{
            comment,
            author: {
               connect: {
                  id: ctx.req.memberId
               }
            },
            links: {
               connect,
               create
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

   const [connect, create] = await getLinksToCard(newComment, ctx);

   const dataObj = {
      comments: {
         update: {
            where: {
               id: commentID
            },
            data: {
               comment: newComment,
               links: {
                  connect,
                  create
               }
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

   ctx.pubsub.publish('myThings', {
      myThings: {
         node: deletedThing,
         updatedFields: ['delete']
      }
   });
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

async function addConnection(parent, { subjectID, objectID, relationship, strength = 0 }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (subjectID === objectID) {
      throw new Error("You can't connect a thing to itself.");
   }

   // First we have to get the data for the two things
   const things = await ctx.db.query.things({
      where: {
         id_in: [subjectID, objectID]
      }
   }, `{author {id}}`);
   // Changed my mind, now anyone can create connections between things
   // if (things[0].author.id !== ctx.req.memberId && things[1].author.id !== ctx.req.memberId) {
   //    throw new AuthenticationError('You must be the author of at least one of the things in a connection, sorry.');
   // }

   if (things[0] == null || things[1] == null) {
      throw new Error(`Thing not found`);
   }

   const existingConnection = await ctx.db.query.connections({
      where: {
         AND: [
            {
               subject: {
                  id: subjectID
               }
            },
            {
               object: {
                  id: objectID
               }
            },
            {
               relationship
            }
         ]
      }
   }, `{id}`);
   if (existingConnection != null && existingConnection.length > 0) {
      throw new Error("That connection already exists.");
   }

   // Next, we create a connection and connect it to both things

   // If we're creating a connection with a strength of 1, that means it's a relation that's been clicked on and the creator is actually null. Otherwise, the creator is the current member.
   let creator;
   if (strength === 1) {
      creator = null;
   } else {
      creator = {
         connect: {
            id: ctx.req.memberId
         }
      }
   }

   const dataObj = {
      relationship,
      subject: {
         connect: {
            id: subjectID
         }
      },
      object: {
         connect: {
            id: objectID
         }
      },
      creator,
      strength
   };

   // Then, since it's not a normal stuff update, we're going to manually write the changes to the db and publish an update to the things channel
   const updatedStuff = await ctx.db.mutation.createConnection({
      data: dataObj
   }, info);

   const fullThings = await ctx.db.query.things({
      where: {
         id_in: [subjectID, objectID]
      }
   }, `{${fullThingFields}}`);

   ctx.pubsub.publish('things', {
      things: {
         node: fullThings[0]
      }
   });
   ctx.pubsub.publish('things', {
      things: {
         node: fullThings[1]
      }
   });

   return fullThings;
}
exports.addConnection = addConnection;

async function deleteConnection(parent, { connectionID }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First we get the connection so we can make sure it exists, find out which things it was connecting, and make sure the current user has the authority do delete it

   const connection = await ctx.db.query.connection({
      where: {
         id: connectionID
      }
   }, `{id subject {${fullThingFields}} object {${fullThingFields}} creator {id}}`);

   if (connection == null) {
      throw new Error("No connection found for that ID");
   }

   if (
         connection.creator.id !== ctx.req.memberId &&
         connection.subject.author.id !== ctx.req.memberId &&
         connection.object.author.id !== ctx.req.memberId &&
         !['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)
      ) {
      throw new AuthenticationError("You don't have permission to delete that connection");
   }

   const deletedConnection = await ctx.db.mutation.deleteConnection({
      where: {
         id: connectionID
      }
   }, `{subject {${fullThingFields}} object {${fullThingFields}}}`);

   ctx.pubsub.publish('things', {
      things: {
         node: deletedConnection.subject
      }
   });
   ctx.pubsub.publish('things', {
      things: {
         node: deletedConnection.object
      }
   });

   return [deletedConnection.subject, deletedConnection.object];
}
exports.deleteConnection = deleteConnection;

async function strengthenConnection(parent, {connectionID}, ctx, info) {
   // First we need to make sure the request is coming from a full member
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // Then we need to get the connection so we can know its current score
   const connection = await ctx.db.query.connection(
      {
         where: {
            id: connectionID
         }
      },
      `{strength}`
   );

   if (connection == null) {
      throw new Error("Connection not found");
   }

   // Then we increase the score
   const updatedConnection = await ctx.db.mutation.updateConnection(
      {
         where: {
            id: connectionID
         },
         data: {
            strength: connection.strength + 1
         }
      }
   );

   return updatedConnection;
}
exports.strengthenConnection = strengthenConnection;