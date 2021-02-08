import { homeNoHTTP } from '../config';
import { stringToObject } from './TextHandling';

const isVideo = url => {
   if (url == null) return false;
   const lowerCasedURL = url.toLowerCase();
   if (
      lowerCasedURL.includes('.mp4') ||
      lowerCasedURL.includes('.webm') ||
      lowerCasedURL.includes('gfycat.com/') ||
      lowerCasedURL.includes('youtube.com/watch?v=') ||
      lowerCasedURL.includes('youtu.be/') ||
      (lowerCasedURL.includes('tiktok.com') &&
         lowerCasedURL.includes('/video/')) ||
      lowerCasedURL.includes('vm.tiktok.com/')
   ) {
      return true;
   }
   return false;
};
export { isVideo };

const isImage = url => {
   if (url == null) return false;
   const lowerCasedURL = url.toLowerCase();
   if (
      lowerCasedURL.includes('.jpg') ||
      lowerCasedURL.includes('.jpeg') ||
      lowerCasedURL.includes('.gif') ||
      lowerCasedURL.includes('.png') ||
      lowerCasedURL.includes('.webp')
   ) {
      return true;
   }
   return false;
};
export { isImage };

const isExplodingLink = url => {
   if (url == null) return false;
   const lowerCaseURL = url.toLowerCase();
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.webp') ||
      lowerCaseURL.includes('.gif') ||
      lowerCaseURL.includes('.mp4') ||
      lowerCaseURL.includes('.webm') ||
      lowerCaseURL.includes('gfycat.com/') ||
      lowerCaseURL.includes('youtube.com/watch?v=') ||
      lowerCaseURL.includes('youtu.be/') ||
      lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) ||
      (lowerCaseURL.includes('twitter.com/') &&
         lowerCaseURL.includes('/status/')) ||
      (lowerCaseURL.includes('tiktok.com') &&
         lowerCaseURL.includes('/video/')) ||
      lowerCaseURL.includes('vm.tiktok.com/') ||
      lowerCaseURL.includes('instagram.com/p/')
   ) {
      return true;
   }
   return false;
};
export { isExplodingLink };

const getThingIdFromLink = url => {
   if (!url.includes(homeNoHTTP)) return;

   const lowerCasedURL = url.toLowerCase();

   const idStartPos = lowerCasedURL.indexOf('id=');
   const allParamsAfterAndIncludingID = lowerCasedURL.substring(idStartPos);
   let wholeIDParam;
   if (allParamsAfterAndIncludingID.includes('&')) {
      wholeIDParam = allParamsAfterAndIncludingID.substring(
         0,
         allParamsAfterAndIncludingID.indexOf('&')
      );
   } else {
      wholeIDParam = allParamsAfterAndIncludingID;
   }

   const id = wholeIDParam.substring(3);
   return id;
};
export { getThingIdFromLink };

const getThingQueryFromLink = url => {
   if (!url.includes(homeNoHTTP)) return;

   const lowerCasedURL = url.toLowerCase();

   const queryStartPos = lowerCasedURL.indexOf('?');
   const queryString = lowerCasedURL.substring(queryStartPos + 1);

   const query = stringToObject(queryString, '=&');
   return query;
};
export { getThingQueryFromLink };

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
   const statusPos = lowerCaseURL.indexOf('/status/') + 8;
   const parametersPos = url.indexOf('?', statusPos);
   if (parametersPos > -1) {
      return url.substring(statusPos, parametersPos);
   }
   return url.substring(statusPos);
};
export { getTweetIDFromLink };

const getTikTokIDFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   const videoPos = lowerCaseURL.indexOf('/video/') + 7;
   const parametersPos = url.indexOf('?', videoPos);
   if (parametersPos > -1) {
      return url.substring(videoPos, parametersPos);
   }
   return url.substring(videoPos);
};
export { getTikTokIDFromLink };

const getInstagramIDFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   const pPos = lowerCaseURL.indexOf('/p/') + 3;
   const nextSlashPos = url.indexOf('/', pPos);
   if (nextSlashPos > -1) {
      return url.substring(pPos, nextSlashPos);
   }
   return url.substring(pPos);
};
export { getInstagramIDFromLink };

const urlAcceptableCharacters = '[-a-z0-9%&?=.,;|$()@_~:<>!*/^+#@]';
const topLevelDomains =
   'com|org|net|tv|gg|us|uk|co\\.uk|edu|gov|mil|biz|info|mobi|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl|int|jobs|name|tel|email|codes|pizza|am|fm|cx|gs|ms|al';
export { topLevelDomains };

const urlFinderParts = {
   bracketFinder: new RegExp(/\[[^()]+\]\(\S+\)/, 'gim'),
   protocolFinder: new RegExp(
      `(?:http[s]?:\\/\\/|ftp:\\/\\/|mailto:[-a-z0-9:?.=/_@]+)${urlAcceptableCharacters}*`,
      'gim'
   ),
   tldFinder: new RegExp(
      `(${urlAcceptableCharacters}+)\\.(?:${topLevelDomains})(?:(?=\\s|[,.;]|$)|\\/${urlAcceptableCharacters}*)`,
      'gim'
   ),
   localHostFinder: new RegExp(
      `(?:localhost:)${urlAcceptableCharacters}*`,
      'gim'
   )
};

const urlFinderPartList = Object.keys(urlFinderParts);
let urlFinderSource = '';
urlFinderPartList.forEach((part, index) => {
   urlFinderSource +=
      index < urlFinderPartList.length - 1
         ? `${urlFinderParts[part].source}|`
         : urlFinderParts[part].source;
});

const urlFinder = new RegExp(urlFinderSource, 'gim');
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
