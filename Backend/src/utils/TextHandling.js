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
