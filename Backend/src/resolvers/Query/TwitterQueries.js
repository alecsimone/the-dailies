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

   const { twitterTokenSecret } = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{twitterTokenSecret}`
      )
      .catch(err => {
         console.log(err);
      });

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

         await ctx.db.mutation
            .updateMember({
               where: { id: ctx.req.memberId },
               data: {
                  twitterUserName: user.userName,
                  twitterUserID: user.userId,
                  twitterUserToken: user.userToken,
                  twitterUserTokenSecret: encryptedTokenSecret,
                  twitterTokenSecret: null
               }
            })
            .catch(err => {
               console.log(err);
            });
      }
   );

   return { message: 'Success!' };
}
exports.finishTwitterLogin = finishTwitterLogin;

async function makeListsObject(twitterListsObject, twitterUserName, ctx) {
   let listData = JSON.parse(twitterListsObject);
   if (
      twitterListsObject === null ||
      listData.lastUpdateTime < Date.now() - 24 * 60 * 60 * 1000
   ) {
      listData.lastUpdateTime = Date.now();
      const listDataString = JSON.stringify(listData);
      await ctx.db.mutation
         .updateMember({
            where: {
               id: ctx.req.memberId
            },
            data: {
               twitterListsObject: listDataString
            }
         })
         .catch(err => {
            console.log(err);
         });
      listData = await getFreshLists(ctx).catch(err => {
         console.log(err);
      });
      listData.home = {
         id: 'home',
         name: 'Home',
         user: twitterUserName,
         sinceID: 1,
         tweets: []
      };
   }
   return listData;
}

async function getTweet(parent, { tweetID }, ctx, info) {
   const tweet = await fetchTweet(tweetID, ctx).catch(err => {
      console.log(err);
   });

   return { message: JSON.stringify(tweet) };
}
exports.getTweet = getTweet;

async function refreshLists(parent, arts, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   const listData = await getFreshLists(ctx).catch(err => {
      console.log(err);
   });

   const listIDs = Object.keys(listData);
   await Promise.all(
      listIDs.map(async id => {
         const tweets = await fetchListTweets(id, ctx).catch(err => {
            console.log(err);
         });
         listData[id].tweets = tweets;
      })
   ).catch(err => {
      console.log(err);
   });

   const fullListData = JSON.stringify(listData);

   return { message: fullListData };
}
exports.refreshLists = refreshLists;

async function getTweetsForList(parent, { listID: requestedList }, ctx, info) {
   loggedInGate(ctx);
   fullMemberGate(ctx.req.member);

   // Make an array of the member's listIDs
   const { twitterListsObject, twitterUserName } = await getTwitterInfo(ctx);
   const listsObject = await makeListsObject(
      twitterListsObject,
      twitterUserName,
      ctx
   ).catch(err => {
      console.log(err);
   });
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

   const listTweets = await fetchListTweets(listID, ctx).catch(err => {
      console.log(err);
   });

   const message = JSON.stringify({
      listTweets,
      listID,
      listName,
      seenIDs: listsObject[listID].seenIDs
   });

   return { message };
}
exports.getTweetsForList = getTweetsForList;
