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
   let sinceID;
   if (lastTweeter) {
      // If this is the last tweeter, we don't need to worry about other tweeters having older tweets than the ones in the list we got which the member hasn't seen yet, so we can set the sinceID to the most recent tweet in the list.
      sinceID = parseInt(tweetIDs[tweetIDs.length - 1]);
   } else {
      sinceID = parseInt(tweetIDs[0]);
   }

   let listsObject;
   if (twitterListsObject == null) {
      // If they don't have a twitterListsObject yet, make one for them
      listsObject = {};
   } else {
      // Otherwise parse the existing one
      listsObject = JSON.parse(twitterListsObject);
   }
   // Then update this list in it with the new sinceID
   listsObject[listID].sinceID = sinceID;

   const seenIDs = tweetIDs || [];

   const stillUsefulSeenIDs = twitterSeenIDs.filter(
      // any tweets older than the sinceID aren't showing up again, so let's lose em
      id => parseInt(id) >= sinceID
   );
   const newSeenIDs = seenIDs.concat(stillUsefulSeenIDs);

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
