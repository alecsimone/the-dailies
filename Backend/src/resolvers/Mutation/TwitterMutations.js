const LoginWithTwitter = require('login-with-twitter');
const {
   cipherString,
   decipherString,
   createOrDestroyLike,
   getTwitterInfo
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

async function markTweetsSeen(parent, { listID, tweetIDs }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const { twitterListsObject, twitterSeenIDs } = await getTwitterInfo(ctx);

   tweetIDs.sort();
   const oldestTweetID = parseInt(tweetIDs[0]);

   let listsObject;
   if (twitterListsObject == null) {
      listsObject = {};
   } else {
      listsObject = JSON.parse(twitterListsObject);
      listsObject[listID].sinceID = oldestTweetID;
   }
   const seenIDs = [];
   if (twitterSeenIDs != null) {
      twitterSeenIDs.forEach(id => {
         // if (parseInt(id) >= oldestTweetID) {
         seenIDs.push(id);
         // }
      });
   }
   const newSeenIDs = seenIDs.concat(tweetIDs);

   const updatedMember = await ctx.db.mutation.updateMember(
      {
         where: { id: ctx.req.memberId },
         data: {
            twitterListsObject: JSON.stringify(listsObject),
            twitterSeenIDs: { set: newSeenIDs }
         }
      },
      info
   );
   return updatedMember;
}
exports.markTweetsSeen = markTweetsSeen;

async function saveTweet(
   parent,
   { tweetURL, tweeter, tweetText, featuredImage },
   ctx,
   info
) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const dataObj = {
      link: tweetURL,
      content: {
         create: {
            content: tweetURL
         }
      }
   };
   const titleBody =
      tweetText && tweetText.length > 100
         ? `${tweetText.substring(0, 100).trim()}...`
         : tweetText;
   dataObj.title = `@${tweeter}: ${
      titleBody !== '' ? titleBody : 'Saved Tweet'
   }`;
   if (featuredImage != null) {
      dataObj.featuredImage = featuredImage;
   }

   const newThing = await properUpdateStuff(dataObj, 'new', 'Thing', ctx);
   return newThing;
}
exports.saveTweet = saveTweet;
