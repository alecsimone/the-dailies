import { homeNoHTTP } from '../config';

const isVideo = url => {
   if (url == null) return false;
   const lowerCasedURL = url.toLowerCase();
   if (
      lowerCasedURL.includes('.mp4') ||
      lowerCasedURL.includes('.webm') ||
      lowerCasedURL.includes('gfycat.com/') ||
      lowerCasedURL.includes('youtube.com/watch?v=') ||
      lowerCasedURL.includes('youtu.be/')
   ) {
      return true;
   }
   return false;
};
export { isVideo };

const isExplodingLink = url => {
   if (url == null) return false;
   const lowerCaseURL = url.toLowerCase();
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.gif') ||
      lowerCaseURL.includes('.mp4') ||
      lowerCaseURL.includes('.webm') ||
      lowerCaseURL.includes('gfycat.com/') ||
      lowerCaseURL.includes('youtube.com/watch?v=') ||
      lowerCaseURL.includes('youtu.be/') ||
      lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) ||
      (lowerCaseURL.includes('twitter.com/') &&
         lowerCaseURL.includes('/status/'))
   ) {
      return true;
   }
   return false;
};
export { isExplodingLink };

const getYoutubeVideoIdFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   if (lowerCaseURL.includes('youtube.com/watch?v=')) {
      const idStartPos = url.indexOf('youtube.com/watch?v=') + 20;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   if (lowerCaseURL.includes('youtu.be')) {
      const idStartPos = url.indexOf('youtu.be/') + 9;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   return false;
};
export { getYoutubeVideoIdFromLink };

const getGfycatSlugFromLink = url => {
   let gfyCode;
   if (url.indexOf('/detail/') > -1) {
      const gfyCodePosition = url.indexOf('/detail/') + 8;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   } else {
      const gfyCodePosition = url.indexOf('gfycat.com/') + 11;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('.mp4') > -1) {
         const gfyCodeEndPosition = url.indexOf('.mp4');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('-') > -1) {
         const gfyCodeEndPosition = url.indexOf('-');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   }
   return gfyCode;
};
export { getGfycatSlugFromLink };

const getTweetIDFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   const statusPos = url.indexOf('/status/') + 8;
   const parametersPos = url.indexOf('?', statusPos);
   if (parametersPos > -1) {
      return url.substring(statusPos, parametersPos);
   }
   return url.substring(statusPos);
};
export { getTweetIDFromLink };

// const urlFinder = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])\b/gim;

// const urlFinder = /\b(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|ftp:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?([a-z0-9-_/.?=]*)?\b/gim;

// const urlFinder = /(?:(?:http[s]?:\/\/|ftp:\/\/|mailto:[-a-z0-9:?.=/_@]+)\S*|(?:[a-z0-9-.]+\.(?:com|org|net|tv|gg|us|uk|co\.uk|edu|gov|mil|biz|info|moby|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl)(?:(?=\s)|\/\S*))|(?:localhost:)\S*)/gim;

const urlAcceptableCharacters = '[-a-z0-9%&?=._~:<>{}\\[\\]!*\\(\\)/^+#]';
const topLevelDomains =
   'com|org|net|tv|gg|us|uk|co\\.uk|edu|gov|mil|biz|info|mobi|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl|int|jobs|name|tel|email|codes|pizza|am|fm|cx|gs|ms';
export { topLevelDomains };
const urlFinder = new RegExp(
   `(?:(?:http[s]?:\\/\/|ftp:\\/\\/|mailto:[-a-z0-9:?.=/_@]+)${urlAcceptableCharacters}*|(?:([a-z0-9-]+|[\\w]+\\.[\\w]+)\\.(?:${topLevelDomains})(?:(?=\\s)|\\/${urlAcceptableCharacters}*))|(?:localhost:)${urlAcceptableCharacters}*)`,
   'gim'
);
export { urlFinder };

const extractHostname = function(url) {
   let hostname;
   // find & remove protocol (http, ftp, etc.) and get hostname

   if (url.indexOf('//') > -1) {
      hostname = url.split('/')[2];
   } else if (url.indexOf('mailto') > -1) {
      hostname = url.substring(7);
   } else {
      hostname = url.split('/')[0];
   }

   // find & remove port number
   hostname = hostname.split(':')[0];
   // find & remove "?"
   hostname = hostname.split('?')[0];

   return hostname;
};

export { extractHostname };
