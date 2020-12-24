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
      throw new Error(err.message);
   });
   if (type === 'ContentPiece') {
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
            throw new Error(err.message);
         });
      publishStuffUpdate('Thing', updatedThing, ctx);
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
            throw new Error(err.message);
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
      `{author {id}}`
   ).catch(err => {
      throw new Error(err.message);
   });

   if (oldStuff.author.id !== ctx.req.memberId) {
      throw new Error(
         `You do not have permission to edit that ${lowerCasedType}`
      );
   }
   return true;
}
exports.editPermissionGate = editPermissionGate;

async function properUpdateStuff(dataObj, id, type, ctx) {
   if (id.toLowerCase() === 'new') {
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
            throw new Error(err.message);
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
            throw new Error(err.message);
         });
      publishMeUpdate(ctx);
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
      throw new Error(err.message);
   });

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
      lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) ||
      (lowerCaseURL.includes('twitter.com/') &&
         lowerCaseURL.includes('/status/')) ||
      (lowerCaseURL.includes('tiktok.com') &&
         lowerCaseURL.includes('/video/')) ||
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
         `{privacy author {id friends {id friends {id}}}}`
      )
      .catch(err => {
         throw new Error(err.message);
      });

   if (thingData == null) {
      return true;
   }

   if (
      await canSeeThing(ctx, thingData).catch(err => {
         throw new Error(err.message);
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
         throw new Error(err.message);
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
