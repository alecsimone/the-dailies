const LoginWithTwitter = require('login-with-twitter');
const {
   cipherString,
   decipherString,
   getTwitterInfo,
   getFreshLists,
   fetchListTweets
} = require('../../utils/Twitter');

async function finishTwitterLogin(parent, { token, verifier }, ctx, info) {
   const tw = new LoginWithTwitter({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackUrl: `${process.env.FRONTEND_URL}/twitter`
   });

   const { twitterTokenSecret } = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{twitterTokenSecret}`
   );

   const decryptedTwitterTokenSecret = decipherString(twitterTokenSecret);

   tw.callback(
      {
         oauth_token: token,
         oauth_verifier: verifier
      },
      decryptedTwitterTokenSecret,
      async (err, user) => {
         if (err) {
            console.log(err);
            return;
         }

         console.log(user);

         const encryptedTokenSecret = cipherString(user.userTokenSecret);

         await ctx.db.mutation.updateMember({
            where: { id: ctx.req.memberId },
            data: {
               twitterUserName: user.userName,
               twitterUserID: user.userId,
               twitterUserToken: user.userToken,
               twitterUserTokenSecret: encryptedTokenSecret,
               twitterTokenSecret: null
            }
         });
      }
   );

   return { message: 'Success!' };
}
exports.finishTwitterLogin = finishTwitterLogin;

async function getTwitterLists(parent, args, ctx, info) {
   const { twitterListsObject } = await ctx.db.query.member(
      {
         where: {
            id: ctx.req.memberId
         }
      },
      `{twitterListsObject}`
   );

   const listsObject = JSON.parse(twitterListsObject);

   let listData;
   if (
      twitterListsObject === null ||
      listsObject.lastUpdateTime < Date.now() - 24 * 60 * 60 * 1000
   ) {
      listData = {};
      const {
         twitterUserID,
         twitterUserName,
         twitterUserToken,
         twitterUserTokenSecret
      } = await getTwitterInfo(ctx);

      const lists = await getFreshLists(
         twitterUserID,
         twitterUserToken,
         twitterUserTokenSecret
      );

      lists.forEach(listObject => {
         listData[listObject.id_str] = {
            id: listObject.id_str,
            name: listObject.name,
            user: listObject.user,
            tweets: []
         };
      });

      listData.lastUpdateTime = Date.now();

      const listDataString = JSON.stringify(listData);

      ctx.db.mutation.updateMember({
         where: {
            id: ctx.req.memberId
         },
         data: {
            twitterListsObject: listDataString
         }
      });
   }
   listData = listsObject;

   const listIDs = Object.keys(listData);
   await Promise.all(
      listIDs.map(async id => {
         const tweets = await fetchListTweets(id, ctx);
         listData[id].tweets = tweets;
      })
   );

   const fullListData = JSON.stringify(listData);

   return {
      message: fullListData
   };
}
exports.getTwitterLists = getTwitterLists;
