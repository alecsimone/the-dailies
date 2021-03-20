const {
   fullThingFields,
   tagFields,
   fullMemberFields,
   commentFields,
   contentPieceFields
} = require('./CardInterfaces');
const { publishMeUpdate } = require('../resolvers/Mutation/MemberMutations');

function publishStuffUpdate(type, stuff, ctx) {
   const lowerCasedType = type.toLowerCase();
   ctx.pubsub.publish(lowerCasedType, {
      [lowerCasedType]: {
         node: stuff
      }
   });
   if (type === 'Thing') {
      publishMeUpdate(ctx);
   }
}

async function updateStuffAndNotifySubs(data, id, type, ctx) {
   const mutationType = `update${type}`;
   let fields;
   if (type === 'Tag' || type === 'Stack') {
      fields = tagFields;
   } else if (type === 'Thing') {
      fields = fullThingFields;
   } else if (type === 'Comment') {
      fields = commentFields;
   } else if (type === 'ContentPiece') {
      fields = contentPieceFields;
   }
   const updatedStuff = await ctx.db.mutation[mutationType](
      {
         where: {
            id
         },
         data
      },
      `{${fields}}`
   ).catch(err => {
      if (err.message.includes('No Node for the model Vote with value')) {
         throw new Error("You're doing that too much");
      }
      console.log(err);
   });
   if (type === 'ContentPiece') {
      if (updatedStuff.onThing != null) {
         const updatedThing = await ctx.db.query
            .thing(
               {
                  where: {
                     id: updatedStuff.onThing.id
                  }
               },
               `{${fullThingFields}}`
            )
            .catch(err => {
               console.log(err);
            });
         publishStuffUpdate('Thing', updatedThing, ctx);
      }
   } else {
      publishStuffUpdate(type, updatedStuff, ctx);
   }
   return updatedStuff;
}

async function editPermissionGate(dataObj, id, type, ctx) {
   // Mods can edit anything
   if (['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)) {
      return true;
   }

   if (dataObj.comments) {
      if (dataObj.comments.create) {
         // Anyone can comment on anything
         return true;
      }
      let commentID;
      if (dataObj.comments.delete) {
         commentID = dataObj.comments.delete.id;
      } else if (dataObj.comments.update) {
         commentID = dataObj.comments.update.where.id;
      }
      const comment = await ctx.db.query
         .comment(
            {
               where: {
                  id: commentID
               }
            },
            `{author {id}}`
         )
         .catch(err => {
            console.log(err);
         });
      if (comment.author.id !== ctx.req.memberId) {
         throw new Error('You do not have permission to edit that comment');
      }
      return true;
   }

   if (dataObj.votes) {
      return true;
   }

   let lowerCasedType = type.toLowerCase();
   if (lowerCasedType === 'contentpiece') {
      lowerCasedType = 'contentPiece';
   }

   const oldStuff = await ctx.db.query[lowerCasedType](
      {
         where: {
            id
         }
      },
      `{author {id} updatedAt}`
   ).catch(err => {
      console.log(err);
   });

   if (oldStuff.author.id !== ctx.req.memberId) {
      throw new Error(
         `You do not have permission to edit that ${lowerCasedType}`
      );
   }
   return true;
}
exports.editPermissionGate = editPermissionGate;

async function makeNewThing(dataObj, ctx) {
   const currentMember = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{id defaultPrivacy}`
      )
      .catch(err => {
         console.log(err);
         console.log(err);
      });
   if (!dataObj.privacy) {
      dataObj.privacy = currentMember.defaultPrivacy;
   } else {
      dataObj.title = `New ${dataObj.privacy} Thing`;
   }
   if (!dataObj.author) {
      dataObj.author = {
         connect: {
            id: ctx.req.memberId
         }
      };
   }
   if (dataObj.title == null) {
      dataObj.title = 'Untitled Thing';
   }
   if (
      dataObj.featuredImage == null &&
      dataObj.link &&
      isExplodingLink(dataObj.link)
   ) {
      dataObj.featuredImage = dataObj.link;
   }
   const newThing = await ctx.db.mutation
      .createThing(
         {
            data: dataObj
         },
         `{${fullThingFields}}`
      )
      .catch(err => {
         console.log(err);
      });
   publishMeUpdate(ctx);
   return newThing;
}

async function properUpdateStuff(dataObj, id, type, ctx) {
   if (id.toLowerCase() === 'new') {
      const newThing = await makeNewThing(dataObj, ctx);
      return newThing;
   }

   editPermissionGate(dataObj, id, type, ctx);

   const updatedStuff = await updateStuffAndNotifySubs(
      dataObj,
      id,
      type,
      ctx
   ).catch(err => {
      throw new Error(err.message);
   });
   publishMeUpdate(ctx);
   return updatedStuff;
}
exports.properUpdateStuff = properUpdateStuff;

async function searchAvailableTaxes(searchTerm, ctx, personal) {
   const typeToSearch = personal ? 'stacks' : 'tags';
   const allTaxes = await ctx.db.query[typeToSearch](
      {},
      `{__typename id title author {id}}`
   ).catch(err => {
      console.log(err);
   });

   // We do it this way because prisma is case sensitive. So we just grab everything and do our own search

   const relevantTaxes = allTaxes.filter(tax =>
      tax.title.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return relevantTaxes;
}
exports.searchAvailableTaxes = searchAvailableTaxes;

const isExplodingLink = url => {
   const lowerCaseURL = url.toLowerCase();
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.webp') ||
      lowerCaseURL.includes('.gif') ||
      lowerCaseURL.includes('.mp4') ||
      lowerCaseURL.includes('.webm') ||
      lowerCaseURL.includes('gfycat.com/') ||
      lowerCaseURL.includes('youtube.com/watch?v=') ||
      lowerCaseURL.includes('youtu.be/') ||
      lowerCaseURL.includes(`${process.env.FRONTEND_URL_NOHTTP}/thing?id=`) ||
      (lowerCaseURL.includes('twitter.com/') &&
         lowerCaseURL.includes('/status/')) ||
      (lowerCaseURL.includes('tiktok.com') &&
         lowerCaseURL.includes('/video/')) ||
      lowerCaseURL.includes('vm.tiktok.com/') ||
      lowerCaseURL.includes('instagram.com/p/')
   ) {
      return true;
   }
   return false;
};
exports.isExplodingLink = isExplodingLink;

const canSeeThing = async (ctx, thingData) => {
   const memberID = ctx.req.memberId;
   if (memberID === thingData.author.id) {
      return true;
   }
   if (thingData.privacy === 'Private') {
      if (thingData.individualViewPermissions != null) {
         return thingData.individualViewPermissions.some(
            viewer => viewer.id === memberID
         );
      }
      return false;
   }
   if (
      thingData.privacy === 'Friends' &&
      !thingData.author.friends.some(friend => friend.id === memberID)
   ) {
      return false;
   }
   if (
      thingData.privacy === 'FriendsOfFriends' &&
      !thingData.author.friends.some(friend => {
         if (friend == null || friend.friends == null) {
            return false;
         }
         return friend.friends.some(
            friendOfFriend => friendOfFriend.id === memberID
         );
      })
   ) {
      return false;
   }
   return true;
};
exports.canSeeThing = canSeeThing;

const canSeeThingGate = async (where, ctx) => {
   const thingData = await ctx.db.query
      .thing(
         {
            where
         },
         `{privacy author {id friends {id friends {id}}} individualViewPermissions {id}}`
      )
      .catch(err => {
         console.log(err);
      });

   if (thingData == null) {
      return true;
   }

   if (
      await canSeeThing(ctx, thingData).catch(err => {
         console.log(err);
      })
   ) {
      return true;
   }
   throw new Error("You don't have permission to see that thing.");
};
exports.canSeeThingGate = canSeeThingGate;

const lengthenTikTokURL = async text => {
   if (!text.includes('vm.tiktok.com')) return text;
   const tiktokShortlinkRegex = /https:\/\/vm\.tiktok\.com\/[-a-z0-9]+[/]?/gim;
   const matches = text.match(tiktokShortlinkRegex);

   let newText = text;
   for (const match of matches) {
      // const protocoledMatch = `https://${match}`;
      const fetchedLink = await fetch(match, {
         method: 'GET'
      }).catch(err => {
         console.log(err);
      });

      if (fetchedLink.url.includes('https://m.tiktok.com/v/')) {
         // We're going to get back a url that starts with https://m.tiktok.com/v/ then the video id, then .html? and then a whole bunch of bullshit. We're going to pull out the ID, put it into a fake full tiktok URL, and send back the original text with that url in place of the short url
         const videoIDEndPos = fetchedLink.url.indexOf('.html');
         const videoID = fetchedLink.url.substring(23, videoIDEndPos);
         const fullLink = `https://www.tiktok.com/@ourdailiesplaceholder/video/${videoID}`;
         newText = newText.replace(match, fullLink);
      }
   }
   return newText;
};
exports.lengthenTikTokURL = lengthenTikTokURL;

const disabledCodewords = ['disabled', 'disable', 'false', 'no', 'off', 'x'];
exports.disabledCodewords = disabledCodewords;

const calculateRelevancyScore = (thing, string) => {
   let score = 1;
   let words = false;
   if (string != null && string.includes(' ')) {
      words = string.split(' ');
   }

   thing.partOfTags.forEach(tag => {
      if (tag.title != null && tag.title.includes(string)) {
         score += 3 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (tag.title != null && tag.title.includes(word)) {
               score += 1;
            }
         });
      }
   });

   thing.comments.forEach(comment => {
      if (comment.content != null && comment.content.includes(string)) {
         score += 3 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (comment.content != null && comment.content.includes(word)) {
               score += 1;
            }
         });
      }
   });

   if (thing.summary != null && thing.summary.includes(string)) {
      score += 6 * string.length;
   }
   if (words) {
      words.forEach(word => {
         if (thing.summary != null && thing.summary.includes(word)) {
            score += 3;
         }
      });
   }

   thing.content.forEach(content => {
      if (content.content != null && content.content.includes(string)) {
         score += 6 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (content.content != null && content.content.includes(word)) {
               score += 2;
            }
         });
      }
      if (content.comments != null) {
         content.comments.forEach(comment => {
            if (comment.comment != null && comment.comment.includes(string)) {
               score += 3 * string.length;
            }
            if (words) {
               words.forEach(word => {
                  if (
                     comment.comment != null &&
                     comment.comment.includes(word)
                  ) {
                     score += 2;
                  }
               });
            }
         });
      }
   });

   thing.copiedInContent.forEach(content => {
      if (content.content != null && content.content.includes(string)) {
         score += 6 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (content.content != null && content.content.includes(word)) {
               score += 2;
            }
         });
      }
      if (content.comments != null) {
         content.comments.forEach(comment => {
            if (comment.comment != null && comment.comment.includes(string)) {
               score += 3 * string.length;
            }
            if (words) {
               words.forEach(word => {
                  if (
                     comment.comment != null &&
                     comment.comment.includes(word)
                  ) {
                     score += 2;
                  }
               });
            }
         });
      }
   });

   if (thing.title != null && thing.title.includes(string)) {
      score *= 10;
   }
   if (words) {
      words.forEach(word => {
         if (thing.title != null && thing.title.includes(word)) {
            score *= 2;
         }
      });
   }

   return score;
};
exports.calculateRelevancyScore = calculateRelevancyScore;
