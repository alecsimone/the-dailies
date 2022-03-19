const ogs = require('open-graph-scraper');

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

const urlAcceptableCharacters = '[-a-z0-9%&?=.,;|$()@_~:<>!*/^+#@]';
const topLevelDomains =
   'com|org|net|tv|gg|us|uk|co\\.uk|edu|gov|mil|biz|info|mobi|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl|int|jobs|name|tel|email|codes|pizza|am|fm|cx|gs|ms|al';

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
exports.urlFinder = urlFinder;

const getLinksToCard = async (text, ctx) => {
   const connect = [];
   const create = [];

   const links = text.matchAll(urlFinder);
   for (const link of links) {
      const matchedText = link[0];
      const lowerCasedMatch = matchedText.toLowerCase();
      const matchEndIndex = link.index + matchedText.length;
      const afterText = link.input.substring(matchEndIndex);

      let zwslessAfterText = afterText;
      if (afterText != null) {
         // Sometimes we use zero width spaces to delineate strings, so we'll remove those here to check if there's actually any significant nextText
         zwslessAfterText = afterText.replace('\u200b', '');
      }
      if (
         afterText == null ||
         zwslessAfterText.trim() === '' ||
         zwslessAfterText.startsWith('\n')
      ) {
         if (
            // We also want to exclue all the types of links that explode, because we won't be showing cards for them
            !lowerCasedMatch.includes('twitter.com/') &&
            !lowerCasedMatch.includes('/status/') &&
            !lowerCasedMatch.includes('twitter.com/hashtag/') &&
            !isImage(lowerCasedMatch) &&
            !lowerCasedMatch.includes('.mp4') &&
            !lowerCasedMatch.includes('.webm') &&
            !lowerCasedMatch.includes('gfycat.com/') &&
            !lowerCasedMatch.includes('youtube.com/watch?v=') &&
            !lowerCasedMatch.includes('youtu.be/') &&
            !lowerCasedMatch.includes(
               `${process.env.FRONTEND_URL_NOHTTP}/thing?id=`
            ) &&
            !lowerCasedMatch.includes('tiktok.com/') &&
            !lowerCasedMatch.includes('/video/') &&
            !lowerCasedMatch.includes('instagram.com/p/')
         ) {
            // linksToCard.push(matchedText);
            const isInDB = await ctx.db.query.link({
               where: {
                  url: matchedText
               }
            });
            if (isInDB != null) {
               connect.push({ id: isInDB.id });
            } else {
               const linkData = {};
               const options = { url: matchedText };
               await ogs(options, (error, results, response) => {
                  linkData.title = results.ogTitle;
                  linkData.description = results.ogDescription;
                  linkData.video = results.ogVideo ? results.ogVideo.url : null;
                  linkData.image = results.ogImage ? results.ogImage.url : null;
                  linkData.icon = results.favicon;
                  linkData.siteName = results.ogSiteName;
                  linkData.ogURL = results.ogUrl;
               });
               create.push(linkData);
            }
         }
      }
   }

   return [connect, create];
};
exports.getLinksToCard = getLinksToCard;

const replaceLinkWithText = async text => {
   // First we need to search the text to see if there are any image tags in it
   const textTagMatches = text.matchAll(
      /<text>(?!<text>)(?<url>.+)<\/text>/gim
   );

   // We're using OCR Space's Free OCR API https://ocr.space/ocrapi
   const conversionURL = 'https://api.ocr.space/parse/ImageUrl?apikey=';
   // const conversionURL = 'https://apipro1.ocr.space/parse/imageurl?apikey='; // This was the paid OCR Endpoint
   for (const match of textTagMatches) {
      const matchedURL = match.groups.url;
      const wholeMatch = match[0];
      if (
         matchedURL.includes('.png') ||
         matchedURL.includes('.jpg') ||
         matchedURL.includes('.jpeg') ||
         matchedURL.includes('.gif') ||
         matchedURL.includes('.tif') ||
         matchedURL.includes('.tiff') ||
         matchedURL.includes('.bmp')
      ) {
         console.log('fetching');
         const response = await fetch(
            `${conversionURL}${process.env.OCR_API_KEY}&url=${matchedURL}`
         );
         const responseJSON = await response.json();
         console.log('fetched');
         if (
            responseJSON != null &&
            responseJSON.ParsedResults != null &&
            responseJSON.ParsedResults[0] != null &&
            responseJSON.ParsedResults[0].ParsedText != null
         ) {
            const convertedText = responseJSON.ParsedResults[0].ParsedText;
            const fixedConvertedText = convertedText.replace(/\r\n/gim, ' ');
            text = text.replace(wholeMatch, `<"${fixedConvertedText}">`);
         } else {
            console.log(responseJSON);
            throw new Error('Something has gone wrong');
         }
      } else {
         throw new Error(
            'The url you provided does not contain a valid image file type. The supported types are .png, .jpg, .jpeg, .gif, .tif, .tiff, and .bmp. Please try again.'
         );
      }
   }

   return text;
};
exports.replaceLinkWithText = replaceLinkWithText;

const getRandomString = count => {
   const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

   let randomString = '';

   for (let i = 0; i < count; i++) {
      randomString += characters.charAt(
         Math.floor(Math.random() * characters.length)
      );
   }

   return randomString;
};
exports.getRandomString = getRandomString;

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
exports.isVideo = isVideo;
