const LoginWithTwitter = require('login-with-twitter');
const {
   cipherString,
   decipherString,
   createOrDestroyLike,
   getTwitterInfo,
   parseTweetID
} = require('../../utils/Twitter');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const { properUpdateStuff } = require('../../utils/ThingHandling');

async function initiateTwitterLogin(parent, args, ctx, info) {
   let message = false;
   const tw = new LoginWithTwitter({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackUrl: `${process.env.FRONTEND_URL}/twitter`
   });
   tw.login(async (err, tokenSecret, url) => {
      if (err) {
         console.log('failure!');
         console.log(err);
         return false;
      }

      const encryptedTokenSecret = cipherString(tokenSecret);

      await ctx.db.mutation.updateMember({
         where: { id: ctx.req.memberId },
         data: { twitterTokenSecret: encryptedTokenSecret }
      });
      message = url;
   });
   const wait = ms => new Promise((r, j) => setTimeout(r, ms));
   let i = 0;
   while (!message && i < 60) {
      await wait(500);
      i++;
   }
   return { message };
}
exports.initiateTwitterLogin = initiateTwitterLogin;

async function likeTweet(parent, { tweetID, alreadyLiked }, ctx, info) {
   let action;
   if (alreadyLiked === 'true') {
      action = 'destroy';
   } else {
      action = 'create';
   }

   const { twitterUserToken, twitterUserTokenSecret } = await getTwitterInfo(
      ctx
   );

   const newTweetData = await createOrDestroyLike(
      tweetID,
      action,
      twitterUserToken,
      twitterUserTokenSecret
   );
   return { message: JSON.stringify(newTweetData) };
}
exports.likeTweet = likeTweet;

async function markTweetsSeen(
   parent,
   { listID, tweetIDs, lastTweeter },
   ctx,
   info
) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const { twitterListsObject, twitterSeenIDs } = await getTwitterInfo(ctx);

   tweetIDs.sort();
   const newestTweetID = tweetIDs[tweetIDs.length - 1];
   const oldestTweetID = tweetIDs[0];

   let listsObject;
   if (twitterListsObject == null) {
      // If they don't have a twitterListsObject yet, make one for them
      listsObject = {};
   } else {
      // Otherwise parse the existing one
      listsObject = JSON.parse(twitterListsObject);
   }
   // If they don't have an object in there for this list yet, give them one
   if (listsObject[listID] == null) listsObject[listID] = {};

   // Then update this list in it with the new data
   if (listsObject[listID].highestIDSeen == null) {
      listsObject[listID].highestIDSeen = newestTweetID;
   } else if (
      parseTweetID(listsObject[listID].highestIDSeen) <
      parseTweetID(newestTweetID)
   ) {
      listsObject[listID].highestIDSeen = newestTweetID;
   }

   listsObject[listID].sinceID = lastTweeter
      ? listsObject[listID].highestIDSeen
      : oldestTweetID;

   const freshSeenIDs = tweetIDs || [];
   const oldSeenIDs = listsObject[listID].seenIDs || [];
   const allSeenIDs =
      oldSeenIDs != null ? oldSeenIDs.concat(freshSeenIDs) : freshSeenIDs;
   const newSeenIDs = allSeenIDs.filter(
      id => parseTweetID(id) >= parseTweetID(listsObject[listID].sinceID)
   );
   listsObject[listID].seenIDs = newSeenIDs;

   const updatedMember = await ctx.db.mutation.updateMember(
      {
         where: { id: ctx.req.memberId },
         data: {
            twitterListsObject: JSON.stringify(listsObject)
         }
      },
      info
   );
   return updatedMember;
}
exports.markTweetsSeen = markTweetsSeen;

async function saveTweet(parent, { tweetURL, tweeter, tweetText }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      featuredImage: tweetURL
   };
   const titleBody =
      tweetText && tweetText.length > 100
         ? `${tweetText.substring(0, 100).trim()}...`
         : tweetText;
   dataObj.title = `@${tweeter}: ${
      titleBody !== '' ? titleBody : 'Saved Tweet'
   }`;

   const newThing = await properUpdateStuff(dataObj, 'new', 'Thing', ctx);
   return newThing;
}
exports.saveTweet = saveTweet;
