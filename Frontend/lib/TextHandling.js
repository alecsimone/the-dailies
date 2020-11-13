import { urlFinder, topLevelDomains } from './UrlHandling';

const replaceTwitterMentions = rawText => {
   const mentionSearchString = new RegExp(
      `@(?:(\\w+)(?!\\w*\\.(?:${topLevelDomains})))`,
      'gim' // Match an @ followed by at least one word character, not followed by any top level domains (which would suggest it's an email)
   );
   return rawText.replace(
      mentionSearchString,
      (wholeMatch, username, matchIndex) => {
         const newText = `https://twitter.com/${username}\u200B`;
         if (rawText[matchIndex - 1] !== ' ') {
            const finalSpaceBeforeMatch = rawText.lastIndexOf(' ', matchIndex);
            const wordBeforeMatch = rawText.substring(
               finalSpaceBeforeMatch === -1 ? 0 : finalSpaceBeforeMatch,
               matchIndex
            );
            const urls = wordBeforeMatch.match(urlFinder);
            if (urls != null) {
               return wholeMatch;
            }
            return `\u200B${newText}`;
         }
         return newText;
      }
   );
};
export { replaceTwitterMentions };

const replaceEmails = rawText => {
   const emailSearchString = new RegExp(
      `[\\w.!#$%&'*+-/=?^_\`{|}~]+@\\w+\\.(?:${topLevelDomains})`,
      'gim'
   );
   return rawText.replace(emailSearchString, (email, matchIndex, wholeText) => {
      // JS doesn't support negative lookbehinds in regex, so we have to do it manually in our replace function
      const precedingCharacters = wholeText.substring(
         matchIndex - 7,
         matchIndex
      );
      if (precedingCharacters.toLowerCase() === 'mailto:') {
         return email;
      }
      return `mailto:${email}\u200B`;
   });
};
export { replaceEmails };

const replaceReddit = rawText =>
   rawText.replace(
      /\/r\/(\w+)[/-a-z?=]*/gim,
      (wholeMatch, subreddit, matchIndex, wholeText) => {
         const precedingCharacters = wholeText.substring(
            matchIndex - 10,
            matchIndex
         );
         if (
            precedingCharacters.toLowerCase() === 'reddit.com' ||
            (precedingCharacters[precedingCharacters.length - 1] !== ' ' &&
               precedingCharacters[precedingCharacters.length - 1] != null)
         ) {
            return wholeMatch;
         }
         return `https://reddit.com${wholeMatch}\u200B`;
      }
   );
export { replaceReddit };

const decodeHTML = text => {
   const txt = document.createElement('textarea');
   txt.innerHTML = text;
   const rawText = txt.value;
   const htmlFixedText = rawText.replace('®', '&reg'); // A lot of links have &reg in them, which gets turned into a registered trademark symbol and breaks the link

   return htmlFixedText;
};
export { decodeHTML };

const styleTagSearchString = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>[^/]*(?:\/[^/]+)*)\/\/)|(?<quote><(?<quoteTextContent>".+")>))/gis;
export { styleTagSearchString };

const stringToObject = (string, splitSearch) => {
   const splitRegex = new RegExp(`[${splitSearch}]`, 'gi');
   const splitString = string.split(splitRegex);
   const createdObject = {};
   splitString.forEach((stringPiece, index) => {
      if (index % 2 === 1 || splitString[index + 1] == null) {
         // Actually we only want to do this once for each pair, and we don't want to do it if there isn't a matching tag
         return;
      }
      // We're making an object with the first items in each pair as its properties and the second as their values
      createdObject[splitString[index].trim()] = splitString[index + 1].trim();
   });
   return createdObject;
};
export { stringToObject };

const pxToInt = pxString => {
   if (pxString === '') {
      return 0;
   }
   const lowerCasedString = pxString.toLowerCase();
   const pxPos = lowerCasedString.indexOf('px');
   const newString = pxString.substring(0, pxPos);
   return parseInt(newString);
};
export { pxToInt };
