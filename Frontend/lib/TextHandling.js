import { urlFinder, topLevelDomains } from './UrlHandling';
import RichText from '../components/RichText';

const testBrowserForNegativeLookarounds = () => {
   // Copied from https://stackoverflow.com/a/65896524
   try {
      return (
         'hibyehihi'
            .replace(new RegExp('(?<=hi)hi', 'g'), 'hello')
            .replace(new RegExp('hi(?!bye)', 'g'), 'hey') === 'hibyeheyhello'
      );
   } catch (error) {
      return false;
   }
};
export { testBrowserForNegativeLookarounds };

const replaceTwitterMentions = rawText => {
   const mentionSearchString = new RegExp(
      `@(?:(?<username>\\w+)(?!\\w*\\.(?:${topLevelDomains})))`,
      'gim' // Match an @ followed by at least one word character, not followed by any top level domains (which would suggest it's an email)
   );

   return rawText.replace(
      mentionSearchString,
      (wholeMatch, groupOne, matchIndex, wholeString, groups) => {
         const newText = `https://twitter.com/${groups.username}\u200B`;
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

// let styleTagSearchStringTest;
// try {
// Full regexp
//    styleTagSearchStringTest = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>((?:(?!\/\/)|https:\/\/|http:\/\/|ftp:\/\/).)*)(?<!https:|http:|ftp:)\/\/)|(?<quote><(?<quoteTextContent>".+")>)|(?<summary>>>(?<summarizedText>(?!.*>>).+)<<(\((?<summaryText>(?!.*>>).+)\))?))/gis;
// } catch {
// Negative lookbehindless regexp
//    styleTagSearchStringTest = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>((?:(?!\/\/)|https:\/\/|http:\/\/|ftp:\/\/).)*)\/\/)|(?<quote><(?<quoteTextContent>".+")>)|(?<summary>>>(?<summarizedText>(?!.*>>).+)<<(\((?<summaryText>(?!.*>>).+)\))?))/gis;
// }
const styleTagSearchString = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>((?:(?!\/\/|https:|http:|ftp)|https:\/\/|http:\/\/|ftp:\/\/).)*)\/\/)|(?<quote><(?<quoteTextContent>".+")>)|(?<summary>>>(?<summarizedText>(?!.*>>).+)<<(\((?<summaryText>(?!.*>>).+)\))?))/gis;
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

const isLowerCase = string =>
   string.toLowerCase() === string && string.toUpperCase() !== string;
export { isLowerCase };

const isUpperCase = string =>
   string.toUpperCase() === string && string.toLowerCase() !== string;
export { isUpperCase };

const getStartingTextElement = (
   startpoint,
   endpoint,
   text,
   matchCount,
   showLinkCards
) => {
   const startingText = text.substring(startpoint, endpoint);
   if (startingText !== '' && startingText !== ' ') {
      return (
         <RichText
            text={startingText}
            key={startingText}
            matchCount={matchCount + 1}
            showLinkCards={showLinkCards}
         />
      );
   }
   return null;
};
export { getStartingTextElement };

const getStyleTagElement = (tag, matchCount, stoppedAtIndex, showLinkCards) => {
   if (tag.groups.styleObjectRaw.includes('</style>')) {
      // I couldn't work out the regex to match only those style tags that didn't include style tags themselves, so we're dealing with it here.
      const allTags = tag.groups.style;
      const firstClosingIndex = allTags.indexOf('</style>');

      const firstTagText = allTags.substring(0, firstClosingIndex + 8);
      const firstTag = (
         <RichText
            text={firstTagText}
            key={firstTagText}
            matchCount={matchCount + 1}
            showLinkCards={showLinkCards}
         />
      );
      // The +8 on that substring is because we need to include the </style> that was our indexOf search
      const stoppedAtIndexOverride = firstClosingIndex + 8;
      return [firstTag, stoppedAtIndexOverride];
   }
   const styleObject = stringToObject(tag.groups.styleObjectRaw, ':;');

   const tagElement = (
      <span style={styleObject} key={stoppedAtIndex}>
         <RichText
            text={tag.groups.styleTextContent}
            key={tag.groups.styleTextContent}
            matchCount={matchCount + 1}
            showLinkCards={showLinkCards}
         />
      </span>
   );
   return [tagElement, null];
};
export { getStyleTagElement };

const getStyledSpan = (style, text, matchCount, showLinkCards) => (
   <span style={style}>
      <RichText
         text={text}
         key={text}
         matchCount={matchCount + 1}
         showLinkCards={showLinkCards}
      />
   </span>
);
export { getStyledSpan };

const getQuoteTagElement = (tag, matchCount, showLinkCards) => {
   if (tag.groups.quoteTextContent.includes('">')) {
      // I couldn't work out the regex to match only those <""> tags that didn't include <""> tags themselves, so we're dealing with it here.
      const allQuotes = tag.groups.quoteTextContent;
      const firstClosingIndex = allQuotes.indexOf('">');

      const firstQuoteText = allQuotes.substring(
         0,
         firstClosingIndex + 1 // The +1 is because we need to include the " that was the start of our indexOf search
      );

      const firstQuote = (
         <blockquote>
            <RichText
               text={firstQuoteText}
               key={firstQuoteText}
               matchCount={matchCount + 1}
               showLinkCards={showLinkCards}
            />
         </blockquote>
      );
      const stoppedAtIndexOverride = firstClosingIndex + 3;
      return [firstQuote, stoppedAtIndexOverride];
   }
   return [
      <blockquote>
         <RichText
            text={tag.groups.quoteTextContent.substring(
               1,
               tag.groups.quoteTextContent.length - 1
            )}
            key={tag.groups.quoteTextContent}
            matchCount={matchCount + 1}
            showLinkCards={showLinkCards}
         />
      </blockquote>,
      null
   ];
};
export { getQuoteTagElement };

const getEndingTextElement = (
   startPoint,
   fixedText,
   trimEndingText,
   matchCount,
   showLinkCards
) => {
   let endingText = fixedText.substring(startPoint);
   if (trimEndingText === true) {
      endingText = endingText.trim();
   }
   if (endingText !== '' && endingText !== ' ') {
      return (
         <RichText
            text={endingText}
            key={endingText}
            matchCount={matchCount + 1}
            showLinkCards={showLinkCards}
         />
      );
   }
   return null;
};
export { getEndingTextElement };

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
export { getRandomString };

const isValidJSON = text => {
   try {
      JSON.parse(text);
   } catch (e) {
      return false;
   }
   return true;
};
export { isValidJSON };

const provisionallyReplaceTextTag = text => {
   const textCopy = `${text}`;
   return textCopy.replace(
      /<text>(?!<text>)(.+)<\/text>/gim,
      '<"Awaiting converted text...">'
   );
};
export { provisionallyReplaceTextTag };
