const { createCipher, createDecipher } = require('crypto');

const cipherString = string => {
   const cipher = createCipher('aes192', process.env.APP_SECRET);
   let encryptedString = cipher.update(string, 'utf8', 'hex');
   encryptedString += cipher.final('hex');
   return encryptedString;
};
exports.cipherString = cipherString;

const decipherString = string => {
   const decipher = createDecipher('aes192', process.env.APP_SECRET);
   let decryptedString = decipher.update(string, 'hex', 'utf8');
   decryptedString += decipher.final('utf8');
   return decryptedString;
};
exports.decipherString = decipherString;

const HmacSha1 = require('hmac_sha1');

const percentEncode = string =>
   encodeURIComponent(string).replace(/[!'()*]/g, function(c) {
      return `%${c.charCodeAt(0).toString(16)}`;
   });

const generateNonce = () => {
   let nonce = '';
   const charset =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz';
   for (let i = 0; i < 32; i++) {
      const randomNumber = Math.floor(Math.random() * 32);
      nonce += charset[randomNumber];
   }
   return nonce;
   // const result = [];
   // window.crypto
   //    .getRandomValues(new Uint8Array(32))
   //    .forEach(c => result.push(charset[c % charset.length]));
   // return result.join('');
};

const generateSignature = (
   consumerKey,
   consumerSecret,
   token,
   tokenSecret,
   baseURL,
   parameters,
   timestamp,
   nonce,
   requestType
) => {
   const oauthParameters = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: token,
      oauth_version: '1.0'
   };
   const signatureParameters = Object.assign(oauthParameters, parameters);
   const signatureParameterKeys = Object.keys(signatureParameters);
   signatureParameterKeys.sort();

   let parameterString = '';
   signatureParameterKeys.forEach((key, index) => {
      const encodedKey = percentEncode(key);
      const encodedValue = percentEncode(signatureParameters[key]);
      parameterString += encodedKey;
      parameterString += '=';
      parameterString += encodedValue;
      if (index + 1 < signatureParameterKeys.length) {
         parameterString += '&';
      }
   });

   let signatureBaseString = `${requestType}&`;
   signatureBaseString += percentEncode(baseURL);
   signatureBaseString += '&';
   signatureBaseString += percentEncode(parameterString);

   const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(
      tokenSecret
   )}`;

   const hmacSha1 = new HmacSha1('base64');
   const signature = hmacSha1.digest(signingKey, signatureBaseString);

   return signature;
};

const getTwitterInfo = async ctx => {
   const twitterInfo = await ctx.db.query.member(
      {
         where: { id: ctx.req.memberId }
      },
      `{twitterUserID, twitterUserName, twitterListsObject, twitterUserToken, twitterUserTokenSecret}`
   );
   twitterInfo.twitterUserTokenSecret = decipherString(
      twitterInfo.twitterUserTokenSecret
   );
   return twitterInfo;
};
exports.getTwitterInfo = getTwitterInfo;

const buildHeaderString = (
   consumerKey,
   consumerSecret,
   token,
   tokenSecret,
   baseURL,
   parameters,
   requestType
) => {
   const nonce = generateNonce();
   const timestamp = Math.floor(Date.now() / 1000);
   const signature = generateSignature(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      baseURL,
      parameters,
      timestamp,
      nonce,
      requestType
   );

   let DST = 'OAuth ';
   DST += percentEncode('oauth_consumer_key');
   DST += `="`;
   DST += percentEncode(consumerKey);
   DST += `", `;

   DST += percentEncode('oauth_nonce');
   DST += `="`;
   DST += percentEncode(nonce);
   DST += `", `;

   DST += percentEncode('oauth_signature');
   DST += `="`;
   DST += percentEncode(signature);
   DST += `", `;

   DST += percentEncode('oauth_signature_method');
   DST += `="`;
   DST += percentEncode('HMAC-SHA1');
   DST += `", `;

   DST += percentEncode('oauth_timestamp');
   DST += `="`;
   DST += percentEncode(timestamp);
   DST += `", `;

   DST += percentEncode('oauth_token');
   DST += `="`;
   DST += percentEncode(token);
   DST += `", `;

   DST += percentEncode('oauth_version');
   DST += `="`;
   DST += percentEncode('1.0');
   DST += `"`;

   return DST;
};

const generateRequestURL = (baseURL, parameters) => {
   let requestURL = baseURL;
   const parameterNames = Object.keys(parameters);
   if (parameterNames.length > 0) {
      requestURL += '?';
      parameterNames.forEach((key, index) => {
         requestURL += key;
         requestURL += '=';
         requestURL += parameters[key];
         if (index + 1 < parameterNames.length) {
            requestURL += '&';
         }
      });
   }
   return requestURL;
};

const getFreshLists = async (userID, token, tokenSecret) => {
   console.log('Getting fresh lists');
   const baseURL = 'https://api.twitter.com/1.1/lists/list.json';
   const parameters = {
      user_id: userID,
      reverse: true
   };
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      token,
      tokenSecret,
      baseURL,
      parameters,
      'GET'
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const lists = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });

   const listsJson = await lists.json();
   if (listsJson.errors && listsJson.errors[0].code == 88) {
      throw new Error("You've exceeded the twitter rate limit for lists");
   } else if (listsJson.errors) {
      throw new Error(listsJson.errors[0].message);
   }
   return listsJson;
};
exports.getFreshLists = getFreshLists;

const fetchListTweets = async (listID, ctx) => {
   console.log('Fetching tweets');
   const {
      twitterListsObject: rawListsObject,
      twitterUserID,
      twitterUserToken,
      twitterUserTokenSecret
   } = await getTwitterInfo(ctx);

   const listsObject = JSON.parse(rawListsObject);

   let sinceID;
   if (listsObject == null) {
      sinceID = null;
   } else {
      sinceID =
         listsObject[listID] == null ? null : listsObject[listID].sinceID;
   }

   if (listID === 'home') {
      const listTweets = await fetchHomeTweets(
         twitterUserID,
         twitterUserToken,
         twitterUserTokenSecret,
         sinceID
      );

      return listTweets;
   }

   const baseURL = 'https://api.twitter.com/1.1/lists/statuses.json';
   const parameters = {
      list_id: listID,
      count: 200,
      tweet_mode: 'extended'
   };
   if (sinceID != null) {
      parameters.since_id = sinceID;
   }
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      twitterUserToken,
      twitterUserTokenSecret,
      baseURL,
      parameters,
      'GET'
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const tweets = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });
   const tweetsJson = await tweets.json();
   return JSON.stringify(tweetsJson);
};
exports.fetchListTweets = fetchListTweets;

const fetchHomeTweets = async (userID, token, tokenSecret, sinceID) => {
   const baseURL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
   const parameters = {
      count: 200,
      tweet_mode: 'extended'
   };
   if (sinceID != null) {
      parameters.since_id = sinceID;
   }
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      token,
      tokenSecret,
      baseURL,
      parameters,
      'GET'
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const tweets = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });
   const tweetsJson = await tweets.json();
   return JSON.stringify(tweetsJson);
};
exports.fetchHomeTweets = fetchHomeTweets;
