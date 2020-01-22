const LoginWithTwitter = require('login-with-twitter');
const {
   cipherString,
   decipherString,
   createOrDestroyLike,
   getTwitterInfo
} = require('../../utils/Twitter');

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
      console.log('destroy');
      action = 'destroy';
   } else {
      console.log('create');
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
