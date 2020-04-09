const LoginWithTwitter = require('login-with-twitter');
const {
   cipherString,
   decipherString,
   getTwitterInfo,
   getFreshLists,
   fetchListTweets,
   fetchTweet
} = require('../../utils/Twitter');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');

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

async function makeListsObject(twitterListsObject, ctx) {
   const listsObject = {};
   let listData;
   if (
      twitterListsObject === null ||
      listsObject.lastUpdateTime < Date.now() - 24 * 60 * 60 * 1000
   ) {
      listData = await getFreshLists(ctx);
      listData.home = {
         id: 'home',
         name: 'Home',
         user: twitterUserName,
         sinceID: 1,
         tweets: []
      };
   } else {
      listData = JSON.parse(twitterListsObject);
   }
   return listData;
}

async function getTweet(parent, { tweetID }, ctx, info) {
   const tweet = await fetchTweet(tweetID, ctx);

   return { message: JSON.stringify(tweet) };
}
exports.getTweet = getTweet;

async function refreshLists(parent, arts, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const listData = await getFreshLists(ctx);

   const listIDs = Object.keys(listData);
   await Promise.all(
      listIDs.map(async id => {
         const tweets = await fetchListTweets(id, ctx);
         listData[id].tweets = tweets;
      })
   );

   const fullListData = JSON.stringify(listData);

   return { message: fullListData };
}
exports.refreshLists = refreshLists;

async function getTweetsForList(parent, { listID: requestedList }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   // Make an array of the member's listIDs
   const { twitterListsObject } = await getTwitterInfo(ctx);
   const listsObject = await makeListsObject(twitterListsObject, ctx);
   const dirtyListIDs = Object.keys(listsObject);
   const listIDs = dirtyListIDs.filter(id => id !== 'lastUpdateTime');

   let listName;
   let listID;

   // if they didn't request a list, give them their default list, which is a See All list if they have it, else home.
   if (requestedList == null) {
      listID = 'home';
      listName = 'Home';
      const [seeAllList] = listIDs.filter(
         id => listsObject[id].name.toLowerCase() === 'see all'
      );
      if (seeAllList) {
         listName = 'See All';
         listID = seeAllList;
      }

      // If they did request a list, give it to them
   } else {
      // If requested list is not a number, it's a name
      if (isNaN(parseInt(requestedList))) {
         listName = requestedList;
         const [foundList] = listIDs.filter(
            id =>
               listsObject[id].name.toLowerCase() ===
               requestedList.toLowerCase()
         );
         if (foundList) {
            listID = foundList;
         }
      } else {
         listName = listsObject[requestedList].name;
         listID = requestedList;
      }
   }

   const listTweets = await fetchListTweets(listID, ctx);

   const message = JSON.stringify({
      listTweets,
      listID,
      listName
   });

   return { message };
}
exports.getTweetsForList = getTweetsForList;
