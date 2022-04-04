const { AuthenticationError } = require('apollo-server-express');
const ogs = require('open-graph-scraper');
const { fullMemberGate, loggedInGate } = require('../../utils/Authentication');
const {
   fullPersonalLinkFields,
   linkFields
} = require('../../utils/CardInterfaces');
const { sleep } = require('../../utils/ThingHandling');
const { getLinkData } = require('../Query/TwitterQueries');
const { publishMeUpdate } = require('./MemberMutations');

const simpleAddLink = async (ctx, url, tags = []) => {
   const dataObj = {
      owner: {
         connect: {
            id: ctx.req.memberId
         }
      },
      url
   };

   // We also need to get any OG data it might have attached to it
   let ogLinkData = await ctx.db.query.link(
      {
         where: {
            url
         }
      },
      `{title description}`
   );

   if (ogLinkData == null) {
      ogLinkData = {
         url
      };
      const options = { url };
      await ogs(options, (error, results, response) => {
         ogLinkData.title = results.ogTitle;
         ogLinkData.description = results.ogDescription;
         ogLinkData.video = results.ogVideo ? results.ogVideo.url : null;
         ogLinkData.image = results.ogImage ? results.ogImage.url : null;
         ogLinkData.icon = results.favicon;
         ogLinkData.siteName = results.ogSiteName;
         ogLinkData.ogURL = results.ogUrl;

         // ogLinkData = ctx.db.mutation.createLink({
         //    data: ogLinkData
         // });
      });
   }

   if (ogLinkData.description != null) {
      dataObj.description = ogLinkData.description;
   }
   if (ogLinkData.title != null) {
      dataObj.title = ogLinkData.title;
   }

   if (tags != null) {
      // Check if there's more than one tag
      // Run each tag through a function that determines whether it needs to be connected or created
      // Add those tags to the data object
   }
   const newLink = await ctx.db.mutation.createPersonalLink({
      data: dataObj
   });
   return newLink;
};
exports.simpleAddLink = simpleAddLink;

async function addLinkToArchive(parent, { url, tags }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First let's check if the member has already added this link
   const existingLink = await ctx.db.query.personalLinks({
      where: {
         AND: [
            {
               owner: {
                  id: ctx.req.memberId
               }
            },
            {
               url
            }
         ]
      }
   });

   if (existingLink != null && existingLink.length > 0) {
      throw new Error(
         "You've already added that link! You can search by URL using the search bar at the top of the page."
      );
   }

   await simpleAddLink(ctx, url, tags);

   const newMe = await publishMeUpdate(ctx);
   return newMe;
}
exports.addLinkToArchive = addLinkToArchive;

const simpleAddTag = async (linkID, tagToAdd, ctx) => {
   const [tagObj] = await ctx.db.query.linkTags({
      where: {
         AND: [
            {
               owner: {
                  id: ctx.req.memberId
               }
            },
            {
               title: tagToAdd
            }
         ]
      }
   });

   let updatedLink;
   if (tagObj != null) {
      updatedLink = await ctx.db.mutation.updatePersonalLink(
         {
            where: {
               id: linkID
            },
            data: {
               partOfTags: {
                  connect: {
                     id: tagObj.id
                  }
               }
            }
         },
         `{${fullPersonalLinkFields}}`
      );

      return updatedLink;
   }
   updatedLink = await ctx.db.mutation.updatePersonalLink(
      {
         where: {
            id: linkID
         },
         data: {
            partOfTags: {
               create: {
                  title: tagToAdd,
                  owner: {
                     connect: {
                        id: ctx.req.memberId
                     }
                  }
               }
            },
            owner: {
               connect: {
                  id: ctx.req.memberId
               }
            }
         }
      },
      `{${fullPersonalLinkFields}}`
   );

   return updatedLink;
};

async function addTagToPersonalLink(parent, { linkID, tagToAdd }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (tagToAdd.includes(',')) {
      const tagsArray = tagToAdd.split(',');
      for (const tag of tagsArray) {
         await simpleAddTag(linkID, tag.trim(), ctx);
      }
   } else {
      await simpleAddTag(linkID, tagToAdd, ctx);
   }

   const updatedLink = await ctx.db.query.personalLink(
      {
         where: {
            id: linkID
         }
      },
      `{${fullPersonalLinkFields}}`
   );

   return updatedLink;
}
exports.addTagToPersonalLink = addTagToPersonalLink;

async function editPersonalLink(
   parent,
   { linkID, title, description },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   const dataObj = {};

   if (title != null) {
      dataObj.title = title;
   }
   if (description != null) {
      dataObj.description = description;
   }

   if (title == null && description == null) return null;

   const updatedLink = await ctx.db.mutation.updatePersonalLink(
      {
         where: {
            id: linkID
         },
         data: dataObj
      },
      `{${fullPersonalLinkFields}}`
   );

   return updatedLink;
}
exports.editPersonalLink = editPersonalLink;

async function refreshLink(parent, { url }, ctx, info) {
   // Only full members can update a link
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   // First we have to get all the previous link data, because we need to know if it's outdated enough to update yet
   const existingLink = await ctx.db.query.link(
      {
         where: {
            url
         }
      },
      `{${linkFields}}`
   );

   if (existingLink == null) {
      throw new Error(
         "Something has gone wrong, we can't find that link anymore."
      );
   }

   const { updatedAt } = existingLink;

   // We only want to update the link if it's more than 3 hours old so we don't do too much fetching.
   let canBeUpdated = false;
   if (updatedAt == null) {
      canBeUpdated = true;
   } else {
      const now = new Date();
      const updatedAtDate = new Date(updatedAt);

      const updatedAgo = now.getTime() - updatedAtDate.getTime();
      if (updatedAgo > 1000 * 60 * 60 * 3) {
         canBeUpdated = true;
      }
   }

   if (!canBeUpdated) {
      console.log("can't be updated");
   }
   if (!canBeUpdated) return;

   const ogLinkData = {
      url
   };
   const options = { url };
   await ogs(options, (error, results, response) => {
      ogLinkData.title = results.ogTitle;
      ogLinkData.description = results.ogDescription;
      ogLinkData.video = results.ogVideo ? results.ogVideo.url : null;
      ogLinkData.image = results.ogImage ? results.ogImage.url : null;
      ogLinkData.icon = results.favicon;
      ogLinkData.siteName = results.ogSiteName;
      ogLinkData.ogURL = results.ogUrl;
   });

   const updatedLink = await ctx.db.mutation.updateLink(
      {
         where: {
            url
         },
         data: ogLinkData
      },
      `{${linkFields}}`
   );
   return updatedLink;
}
exports.refreshLink = refreshLink;
