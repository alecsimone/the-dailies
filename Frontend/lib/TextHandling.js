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

const styleTagSearchString = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>[^/]*(?:\/[^/]+)*)\/\/)|(?<quote><(?<quoteTextContent>".+")>)|(?<summary>>>(?<summarizedText>.+)<<(\((?<summaryText>.+)\))?)|(?<list>[\r\n]{0,1}[ ]*(?:[ixvIXV]+[ \.]+|[0-9]+[ \.]+|[a-z]+[\.]+|[a-z]{1}[ ]+|-)[^\r\n]*))/gis;
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

const getListType = (listTypeCheckChar, prevTypeCheckChar) => {
   console.log([listTypeCheckChar, prevTypeCheckChar]);
   if (listTypeCheckChar.match(/[icvxlm]/) != null) {
      // If there's no item before, we're going to assume this is roman numerals
      if (prevTypeCheckChar == null) return 'i';
      // If there is an item before, and it's the letter before this in the alphabet, we assume this is an alphabetic list
      if (
         listTypeCheckChar.charCodeAt(0) ===
         prevTypeCheckChar.charCodeAt(0) + 1
      )
         return 'a';
      // Otherwise, we assume this is roman numerals
      return 'i';
   }
   if (listTypeCheckChar.match(/[ICVXLM]/) != null) {
      // If there's no item before, we're going to assume this is roman numerals
      if (prevTypeCheckChar == null) return 'I';
      // If there is an item before, and it's the letter before this in the alphabet, we assume this is an alphabetic list
      if (
         listTypeCheckChar.charCodeAt(0) ===
         prevTypeCheckChar.charCodeAt(0) + 1
      )
         return 'A';
      // Otherwise, we assume this is roman numerals
      return 'I';
   }
   if (listTypeCheckChar.match(/[a-z]/) != null) {
      return 'a';
   }
   if (listTypeCheckChar.match(/[A-Z]/) != null) {
      return 'A';
   }
   if (listTypeCheckChar.match(/[0-9]/) != null) {
      return '1';
   }
   if (listTypeCheckChar.match(/-/) != null) {
      return 'dash';
   }
};
export { getListType };

const properlyNestListItem = item => {
   if (Array.isArray(item)) {
      // If the item is an array, the first item should be a string and the second item should be an array with a list to nest within the first item
      const sublistItems = item[1].map(sublistItem =>
         properlyNestListItem(sublistItem)
      );

      return (
         <li>
            {item[0]}
            <ul>{sublistItems}</ul>
         </li>
      );
   }
   return <li>{item}</li>;
};
export { properlyNestListItem };

const foldUpNestedListArrayToTypeIndex = (nestedListTypesArray, typeIndex) => {
   const currentTypeCount = nestedListTypesArray.length;

   for (let i = currentTypeCount - 1; i > typeIndex; i--) {
      // First we collect the items we're going to nest in there by taking the items from the type at index i
      const itemsToNest = nestedListTypesArray[i].items;

      // Then we're going to get the last item of type i - 1 so we can combine it with the items we're going to nest into an array duple
      const lastItemOfPreviousType =
         nestedListTypesArray[i - 1].items[
            nestedListTypesArray[i - 1].items.length - 1
         ];

      // Then we make our nested duple
      const nestedDuple = [lastItemOfPreviousType, itemsToNest];

      // And replace the final item of type i - 1 with it
      nestedListTypesArray[i - 1].items[
         nestedListTypesArray[i - 1].items.length - 1
      ] = nestedDuple;

      // And then we get rid of the type at index i, which will be the last item in the array
      nestedListTypesArray.pop();
   }

   return nestedListTypesArray;
};

export { foldUpNestedListArrayToTypeIndex };
