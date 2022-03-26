const {
   fullThingFields,
   tagFields,
   commentFields,
   contentPieceFields
} = require('./CardInterfaces');

function publishStuffUpdate(type, stuff, ctx) {
   const lowerCasedType = type.toLowerCase();
   if (lowerCasedType === 'thing') {
      ctx.pubsub.publish('things', {
         things: {
            node: stuff
         }
      });
   } else {
      ctx.pubsub.publish(lowerCasedType, {
         [lowerCasedType]: {
            node: stuff
         }
      });
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

   if (oldStuff != null && oldStuff.author.id !== ctx.req.memberId) {
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
   if (dataObj.manualUpdatedAt == null) {
      const now = new Date();
      const newUpdatedAt = now.toISOString();
      dataObj.manualUpdatedAt = newUpdatedAt;
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
   return newThing;
}

async function properUpdateStuff(dataObj, id, type, ctx) {
   if (id.toLowerCase() === 'new') {
      const now = new Date();
      const newUpdatedAt = now.toISOString();
      dataObj.manualUpdatedAt = newUpdatedAt;
      const newThing = await makeNewThing(dataObj, ctx);
      return newThing;
   }

   editPermissionGate(dataObj, id, type, ctx);

   if (
      dataObj.title != null ||
      dataObj.content != null ||
      dataObj.copiedInContent != null ||
      dataObj.contentOrder != null ||
      dataObj.partOfTags != null
   ) {
      const now = new Date();
      const newUpdatedAt = now.toISOString();
      if (type === 'Thing') {
         dataObj.manualUpdatedAt = newUpdatedAt;
      }
   }

   const updatedStuff = await updateStuffAndNotifySubs(
      dataObj,
      id,
      type,
      ctx
   ).catch(err => {
      throw new Error(err.message);
   });
   if (type === 'Thing') {
      ctx.pubsub.publish('myThings', {
         myThings: {
            node: updatedStuff,
            updatedFields: ['edit']
         }
      });
   }
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
   // If we didn't get all the thingData we need, let's query for it
   let computedData = thingData;
   if (
      thingData.author == null ||
      thingData.author.id == null ||
      thingData.individualViewPermissions == null ||
      (thingData.privacy === 'Friends' && thingData.author.friends == null) ||
      (thingData.privacy === 'FriendsOfFriends' &&
         (thingData.author.friends == null ||
            thingData.author.friends.some(friend => friend.friend == null)))
   ) {
      console.log('we need more data');
      const queriedData = await ctx.db.query.thing(
         {
            where: {
               id: thingData.id
            }
         },
         `{${fullThingFields}}`
      );
      computedData = queriedData;
   }

   // If the thing is public, anyone can see it
   if (computedData.privacy === 'Public') return true;

   const memberID = ctx.req.memberId;
   // If the current member created this thing, they can see it
   if (memberID === computedData.author.id) {
      return true;
   }

   if (memberID == null) {
      // We've already checked if the thing is public, so if it's not public and the user is not logged in, they can't see it.
      return false;
   }

   // If the current member is listed in the individualViewPermissions of this thing, they can see it
   if (computedData.individualViewPermissions != null) {
      if (
         computedData.individualViewPermissions.some(
            viewer => viewer.id === memberID
         )
      ) {
         return true;
      }
   }

   if (computedData.privacy === 'Private') {
      // If this thing is private, and it wasn't created by the current member and they're not listed in the individual view permissions (both of which we've already checked for), they can't see it
      return false;
   }

   // If the thing is for friends only, and the current member is not a friend of the author, then they can't see it.
   if (
      computedData.privacy === 'Friends' &&
      !computedData.author.friends.some(friend => friend.id === memberID)
   ) {
      return false;
   }

   // If the thing is for friends of friends, and the current member is not a friend of the author nor a friend of any of their friends, then they can't see it
   if (
      computedData.privacy === 'FriendsOfFriends' &&
      !computedData.author.friends.some(friend => {
         // this function needs to return true if the current member is a friend of the author or a friend of one of their friends
         if (friend.id === memberID) return true;
         if (friend == null) return false;
         if (friend.friends == null) return false;
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

const canSeeContentPiece = async (ctx, pieceData) => {
   // We need to figure out the privacy setting we're going to use. The piece itself may not have a privacy setting, but it might be on a thing that does. It also might be on a tag, and tags are all public.
   let computedPrivacy = pieceData.privacy;
   let authorKey;
   if (computedPrivacy == null) {
      if (pieceData.onThing != null) {
         computedPrivacy = pieceData.onThing.privacy;
         authorKey = 'onThing';
      }
      if (pieceData.onTag != null) {
         computedPrivacy = 'Public';
         authorKey = 'onTag';
      }
   }

   // If we didn't get all the pieceData we need, let's query for it
   let computedData = pieceData;
   if (
      computedPrivacy == null ||
      (computedPrivacy !== 'Public' &&
         (pieceData[authorKey].author == null ||
            pieceData[authorKey].author.id == null ||
            pieceData.individualViewPermissions == null ||
            (computedPrivacy === 'Friends' &&
               pieceData[authorKey].author.friends == null) ||
            (computedPrivacy === 'FriendsOfFriends' &&
               (pieceData[authorKey].author.friends == null ||
                  pieceData[authorKey].author.friends.some(
                     friend => friend.friend == null
                  )))))
   ) {
      const queriedData = await ctx.db.query.contentPiece(
         {
            where: {
               id: pieceData.id
            }
         },
         `{${contentPieceFields}}`
      );
      computedData = queriedData;
   }

   // If we couldn't figure out the proper privacy level before we queried for more data, now we check again
   if (computedPrivacy == null) {
      if (computedData.privacy != null) {
         computedPrivacy = computedData.privacy;
      } else if (computedData.onThing != null) {
         computedPrivacy = pieceData.onThing.privacy;
      } else if (computedData.onTag != null) {
         computedPrivacy = 'Public';
      }
   }

   // If the piece is public, anyone can see it
   if (computedPrivacy === 'Public') return true;

   const memberID = ctx.req.memberId;
   // If the current member created this piece, they can see it
   if (memberID === computedData[authorKey].author.id) {
      return true;
   }

   if (memberID == null) {
      // We've already checked if the piece is public, so if it's not public and the user is not logged in, they can't see it.
      return false;
   }

   // If the current member is listed in the individualViewPermissions of this piece, they can see it
   if (computedData.individualViewPermissions != null) {
      if (
         computedData.individualViewPermissions.some(
            viewer => viewer.id === memberID
         )
      ) {
         return true;
      }
   }

   if (computedData.privacy === 'Private') {
      // If this piece is private, and it wasn't created by the current member and they're not listed in the individual view permissions (both of which we've already checked for), they can't see it
      return false;
   }

   // If the piece is for friends only, and the current member is not a friend of the author, then they can't see it.
   if (
      computedData.privacy === 'Friends' &&
      !computedData[authorKey].author.friends.some(
         friend => friend.id === memberID
      )
   ) {
      return false;
   }

   // If the piece is for friends of friends, and the current member is not a friend of the author nor a friend of any of their friends, then they can't see it
   if (
      computedData.privacy === 'FriendsOfFriends' &&
      !computedData[authorKey].author.friends.some(friend => {
         // this function needs to return true if the current member is a friend of the author or a friend of one of their friends
         if (friend.id === memberID) return true;
         if (friend == null) return false;
         if (friend.friends == null) return false;
         return friend.friends.some(
            friendOfFriend => friendOfFriend.id === memberID
         );
      })
   ) {
      return false;
   }
   return true;
};
exports.canSeeContentPiece = canSeeContentPiece;

const filterContentPiecesForPrivacy = async (thingData, ctx) => {
   // First let's pull out the thing's privacy, because we'll be using that for pieces that don't have privacy settings of their own
   const thingPrivacy = thingData.privacy;
   // Then the author ID
   const thingAuthorID = thingData.author.id;
   // And then the current member's role and ID
   const memberRole = ctx.req.member != null ? ctx.req.member.role : 'none';
   const memberID = ctx.req.memberId;

   if (['Admin', 'Editor'].includes(memberRole)) {
      // Admins and editors can see everything
      return thingData;
   }

   // We'll start with content pieces on this thing
   if (thingData.content != null && thingData.content.length > 0) {
      thingData.content = thingData.content.filter(piece => {
         const privacy = piece.privacy != null ? piece.privacy : thingPrivacy;
         if (privacy === 'Public') {
            return true;
         }
         if (privacy === 'Private') {
            if (thingAuthorID === memberID) {
               return true;
            }
            return false;
         }
         if (privacy === 'Friends') {
            return thingData.author.friends.some(
               friend => friend.id === memberID
            );
         }
         if (privacy === 'FriendsOfFriends') {
            return thingData.author.friends.some(friend => {
               if (friend == null || friend.friends == null) {
                  return false;
               }
               return friend.friends.some(
                  friendOfFriend => friendOfFriend.id === memberID
               );
            });
         }
      });
   }

   // Then we'll do the same for content pieces which have been copied in to this thing
   if (
      thingData.copiedInContent != null &&
      thingData.copiedInContent.length > 0
   ) {
      const filteredCopiedContent = [];
      for (const piece of thingData.copiedInContent) {
         // First we need to get the data for the thing the piece was originally from
         const originalThingID = piece.onThing.id;
         const originalThingData = await ctx.db.query.thing(
            {
               where: {
                  id: originalThingID
               }
            },
            '{privacy author {id friends {id friends {id}}}}'
         );

         const privacy =
            piece.privacy != null ? piece.privacy : originalThingData.privacy;

         const originalThingAuthorID = originalThingData.author.id;

         if (privacy === 'Public') {
            filteredCopiedContent.push(piece);
         }
         if (privacy === 'Private') {
            if (originalThingAuthorID === memberID) {
               filteredCopiedContent.push(piece);
            }
         }
         if (privacy === 'Friends') {
            if (
               originalThingData.author.friends.some(
                  friend => friend.id === memberID
               )
            ) {
               filteredCopiedContent.push(piece);
            }
         }
         if (privacy === 'FriendsOfFriends') {
            if (
               originalThingData.author.friends.some(friend => {
                  if (friend == null || friend.friends == null) {
                     return false;
                  }
                  return friend.friends.some(
                     friendOfFriend => friendOfFriend.id === memberID
                  );
               })
            ) {
               filteredCopiedContent.push(piece);
            }
         }
      }
   }

   return thingData;
};
exports.filterContentPiecesForPrivacy = filterContentPiecesForPrivacy;

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

const supplementFilteredQuery = async (
   ctx,
   queryType, // The type we're querying the db for, so in ctx.db.query.things, it's 'things'
   queryObject, // The object that will be passed to the query, i.e. the object with properties where, orderBy, first, etc. **IT MUST BE STRUCTURED WITH AN AND ARRAY FOR THE WHERE OBJECT, AND THAT ARRAY MUST NOT HAVE THE CURSOR PROPERTY IN IT.**
   queryFields, // The fields you want back from the query. Usually just pass the info parameter for this.
   filterFunction, // The function that will be used to filter the query results. Works like the standard array filter method, where returning true means the item is included, false means excluded.
   cursorType, // The graphql property value for the cursor, eg "createdAt_lt"
   startingCursor, // The initial cursor value, should be whatever the cursor is after the initial query we're supplementing. Will probably have a shape similar to things[things.length - 1].createdAt
   cursorPropertyname, // The property on the returned items we're using for a cursor. Probably something like createdAt
   itemsToSupplementCount // How many more items the query needs
) => {
   let supplementaryItems = [];
   let noMoreItems = false;
   let newCursor = startingCursor;

   // We're going to keep getting more items until we get the number we need or until we run out of items
   while (supplementaryItems.length < itemsToSupplementCount && !noMoreItems) {
      // console.log('supplement lap');
      // First we need to add our cursor to the query
      queryObject.where.AND.push({
         [cursorType]: newCursor
      });
      // Then we need to update the query so it only asks for the number of items we still need
      queryObject.first -= supplementaryItems.length;
      // But to make sure we don't have to run this query a bunch of times, we're going to quadruple that
      queryObject.first *= 4;

      // we'll get as many new items as we still need to complete our count
      const newItems = await ctx.db.query[queryType](queryObject, queryFields);

      if (newItems.length === 0) {
         // If we don't get anything from our query, that means we're all out of items and can exit the loop
         noMoreItems = true;
         return supplementaryItems;
      }

      // Otherwise, we run our filter again on the new items
      const newSafeItems = [];
      for (const item of newItems) {
         if (await filterFunction(item)) {
            newSafeItems.push(item);
         }
      }

      // And combine what we have left with our previous supplementary items
      supplementaryItems = supplementaryItems.concat(newSafeItems);

      newCursor = newItems[newItems.length - 1][cursorPropertyname];
   }
   // Then we just trim down our supplementary items to the required number, in case we got too many
   supplementaryItems = supplementaryItems.slice(0, itemsToSupplementCount);

   return supplementaryItems;
};
exports.supplementFilteredQuery = supplementFilteredQuery;

// use with await sleep(ms);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;

const getThingIdFromLink = url => {
   if (!url.includes(process.env.FRONTEND_URL_NOHTTP)) return;

   const lowerCasedURL = url.toLowerCase();

   const idStartPos = lowerCasedURL.indexOf('id=');
   const allParamsAfterAndIncludingID = lowerCasedURL.substring(idStartPos);
   let wholeIDParam;
   if (allParamsAfterAndIncludingID.includes('&')) {
      wholeIDParam = allParamsAfterAndIncludingID.substring(
         0,
         allParamsAfterAndIncludingID.indexOf('&')
      );
   } else {
      wholeIDParam = allParamsAfterAndIncludingID;
   }

   const id = wholeIDParam.substring(3);
   return id;
};
exports.getThingIdFromLink = getThingIdFromLink;

const urlAcceptableCharacters = '[-a-z0-9%&?=.,;|$()@_~:<>!*/^+#@]';
const topLevelDomains =
   'com|org|net|tv|gg|us|uk|co\\.uk|edu|gov|mil|biz|info|mobi|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl|int|jobs|name|tel|email|codes|pizza|am|fm|cx|gs|ms|al';

const urlFinderParts = {
   bracketFinder: new RegExp(/\[[^()]+\]\(\S+\)/, 'gim'),
   protocolFinder: new RegExp(
      `(?:http[s]?:\\/\\/|ftp:\\/\\/|mailto:[-a-z0-9:?.=/_@]+)${urlAcceptableCharacters}*`,
      'gim'
   ),
   tldFinder: new RegExp(
      `(${urlAcceptableCharacters}+)\\.(?:${topLevelDomains})(?:(?=\\s|[,.;]|$)|\\/${urlAcceptableCharacters}*)`,
      'gim'
   ),
   localHostFinder: new RegExp(
      `(?:localhost:)${urlAcceptableCharacters}*`,
      'gim'
   )
};

const urlFinderPartList = Object.keys(urlFinderParts);
let urlFinderSource = '';
urlFinderPartList.forEach((part, index) => {
   urlFinderSource +=
      index < urlFinderPartList.length - 1
         ? `${urlFinderParts[part].source}|`
         : urlFinderParts[part].source;
});

const urlFinder = new RegExp(urlFinderSource, 'gim');

const bracketCheck = /\[(?<text>.+)\]\((?<href>.+)\)/gi;

const getLinksFromContent = contentArray => {
   // If there's no content, we don't need to do anything
   if (contentArray == null || contentArray.length === 0) return [];

   // If we're not in a browser (ie, we're in a server side render), let's get out, because the matchAll won't work
   // if (!process.browser) return [];

   // First we're going to make a giant string out of all the content in all the content pieces
   let giantContentString = '';
   contentArray.forEach(piece => (giantContentString += `${piece.content}\n`));

   const linkedThingIDs = []; // Our array for holding the ids of any linked things we find

   // Then we're going to check it for links to a thing
   const linkMatches = giantContentString.matchAll(urlFinder);
   for (const linkMatch of linkMatches) {
      const link = linkMatch[0];
      const lowerCaseURL = link.toLowerCase();
      if (link != null) {
         const bracketMatchCheck = link.match(bracketCheck);
         if (bracketMatchCheck != null) {
            const bracketMatch = link.matchAll(bracketCheck);
            for (const match of bracketMatch) {
               const { href } = match.groups;

               // First, support for a legacy link system we did, where you could use a few codes to insert a link to a thing
               const cleanText = match.groups.text.trim().toLowerCase();

               if (
                  cleanText.toLowerCase().startsWith('c:') ||
                  cleanText.toLowerCase().startsWith('p:') ||
                  cleanText.toLowerCase().startsWith('t:')
               ) {
                  linkedThingIDs.push(href);
               }

               const linkCheck = href.match(urlFinder);
               if (linkCheck == null) {
                  // if the link is not a link, that probably means it's just the id of a thing
                  linkedThingIDs.push(href);
               }

               if (href.includes(process.env.FRONTEND_URL_NOHTTP)) {
                  linkedThingIDs.push(getThingIdFromLink(href));
               }
            }
         }

         if (
            lowerCaseURL.includes(
               `${process.env.FRONTEND_URL_NOHTTP}/thing?id=`
            ) &&
            bracketMatchCheck == null
         ) {
            linkedThingIDs.push(getThingIdFromLink(link));
         }
      }
   }
   return linkedThingIDs;
};
exports.getLinksFromContent = getLinksFromContent;
