import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import ExplodingLink from './ExplodingLink';
import SummarizedText from './SummarizedText';
import {
   replaceTwitterMentions,
   replaceEmails,
   replaceReddit,
   decodeHTML,
   styleTagSearchString,
   stringToObject,
   getListType,
   properlyNestListItem,
   foldUpNestedListArrayToTypeIndex,
   listItemPartMatch,
   isLowerCase,
   isUpperCase
} from '../lib/TextHandling';
import { urlFinder } from '../lib/UrlHandling';

const RichText = ({ text, priorText, nextText, matchCount = 0 }) => {
   // if (text[0] === '\n' && text[1] === '\n') {
   //    // If the text starts with two new lines, we can drop one of them. We do want to keep the new line if there's only one though
   //    text = text.substring(1);
   // }
   const { smallHead } = useContext(ThemeContext);

   let fixedText = replaceReddit(replaceEmails(replaceTwitterMentions(text)));

   if (
      text == null ||
      typeof text !== 'string' ||
      text === '' ||
      !process.browser
   ) {
      return fixedText;
   }

   fixedText = decodeHTML(fixedText);

   const elementsArray = [];
   let stoppedAtIndex = 0;
   let stoppedAtIndexOverride = false;
   let trimEndingText = false;
   const superMatcherSource = `${urlFinder.source}|${
      styleTagSearchString.source
   }`;
   const superMatcher = new RegExp(superMatcherSource, 'gim');
   const allMatches = fixedText.matchAll(superMatcher);

   // First we do a big matchAll with a giant superstring of all the things we might be looking for.
   for (const match of allMatches) {
      // The URL searches have a lot of repetition in them, so they're written with variables and thus need to be constructed from a string, which I don't believe supports using named capture groups.

      // So now we take just the style tags and use a proper regex search with named capture groups to parse them.
      const tags = match[0].matchAll(styleTagSearchString);
      for (const tag of tags) {
         // But we're only interested in the first match of all matches
         if (tag[0] !== match[0]) continue;
         // We break off any text before the match and put it in a RichText at the start of our elements array

         const startingText = fixedText.substring(
            stoppedAtIndex,
            match.index + tag.index
         );
         if (startingText !== '' && startingText !== ' ') {
            elementsArray.push(
               <RichText
                  text={startingText}
                  key={startingText}
                  matchCount={matchCount + 1}
               />
            );
         }

         // Then we go through each of the style tags and when we get a hit, we make an element that applies that style around a new RichText, and then pushes that element into our elements array

         // First, the general <style> tag, which is a little tricky
         if (tag.groups.style != null) {
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
                  />
               );
               // The +8 on that substring is because we need to include the </style> that was our indexOf search
               elementsArray.push(firstTag);
               stoppedAtIndexOverride = firstClosingIndex + 8;
            } else {
               const styleObject = stringToObject(
                  tag.groups.styleObjectRaw,
                  ':;'
               );

               const tagElement = (
                  <span style={styleObject} key={stoppedAtIndex}>
                     <RichText
                        text={tag.groups.styleTextContent}
                        key={tag.groups.styleTextContent}
                        matchCount={matchCount + 1}
                     />
                  </span>
               );
               elementsArray.push(tagElement);
            }
         }

         if (tag.groups.summary != null) {
            const { summarizedText, summaryText } = tag.groups;
            trimEndingText = true;
            elementsArray.push(
               <SummarizedText
                  summarizedText={summarizedText}
                  summaryText={summaryText}
               />
            );
         }

         if (tag.groups.stars != null) {
            elementsArray.push(
               <span style={{ fontWeight: 700, color: 'white' }}>
                  <RichText
                     text={tag.groups.starsTextContent}
                     key={tag.groups.starsTextContent}
                     matchCount={matchCount + 1}
                  />
               </span>
            );
         }

         if (tag.groups.bars != null) {
            elementsArray.push(
               <span style={{ textDecoration: 'underline' }}>
                  <RichText
                     text={tag.groups.barsTextContent}
                     key={tag.groups.barsTextContent}
                     matchCount={matchCount + 1}
                  />
               </span>
            );
         }

         if (tag.groups.slashes != null) {
            elementsArray.push(
               <span style={{ fontStyle: 'italic' }}>
                  <RichText
                     text={tag.groups.slashesTextContent}
                     key={tag.groups.slashesTextContent}
                     matchCount={matchCount + 1}
                  />
               </span>
            );
         }

         if (tag.groups.pounds != null) {
            elementsArray.push(
               <span style={{ fontSize: '2em', fontWeight: '700' }}>
                  <RichText
                     text={tag.groups.poundsTextContent}
                     key={tag.groups.poundsTextContent}
                     matchCount={matchCount + 1}
                  />
               </span>
            );
         }

         if (tag.groups.quote != null) {
            if (tag.groups.quoteTextContent.includes('">')) {
               // I couldn't work out the regex to match only those <""> tags that didn't include <""> tags themselves, so we're dealing with it here.
               const allQuotes = tag.groups.quoteTextContent;
               const firstClosingIndex = allQuotes.indexOf('">');

               const firstQuoteText = allQuotes.substring(
                  0,
                  firstClosingIndex + 1
               );
               const firstQuote = (
                  <blockquote>
                     <RichText
                        text={firstQuoteText}
                        key={firstQuoteText}
                        matchCount={matchCount + 1}
                     />
                  </blockquote>
               );
               // The +1 on that substring is because we need to include the " that was the start of our indexOf search
               elementsArray.push(firstQuote);
               stoppedAtIndexOverride = firstClosingIndex + 3;
            } else {
               elementsArray.push(
                  <blockquote>
                     <RichText
                        text={tag.groups.quoteTextContent.substring(
                           1,
                           tag.groups.quoteTextContent.length - 1
                        )}
                        key={tag.groups.quoteTextContent}
                        matchCount={matchCount + 1}
                     />
                  </blockquote>
               );
            }
         }

         if (tag.groups.list != null) {
            // First we need to get the whole list. So we'll check the line after this to see if it matches as well
            const listItem = tag.groups.list;
            const theWholeList = [listItem];

            const listSearchString = new RegExp(
               `([\r\n]{1,2}[ ]*(?:[ixvIXV]+[ \.]|[0-9]+[ \.]+|[a-z]+[\.]+|[a-z]{1}[ ]+|-)[^\r\n]*)`,
               'gi'
            );

            // We start by figuring out where we are in the whole content piece
            const startingPoint = match.index;

            // Then we'll figure out where our current match ends, so we can get the line after it
            let endingPoint = startingPoint + listItem.length;

            // Now we'll go through each line until we either get to a line that's not in the list or we get to the end of the content piece
            let nextLineMightBeInThisList = true;
            while (nextLineMightBeInThisList === true) {
               // First we'll make a new string with the rest of the content piece in it after our ending point
               const restOfText = fixedText.substring(endingPoint);
               // And search for the next line
               const nextLineMatch = restOfText.match(/[\r\n].*[\r\n]{0,1}/);
               if (nextLineMatch == null) {
                  // if there is no next line, then we're done
                  nextLineMightBeInThisList = false;
               } else {
                  const nextLine = nextLineMatch[0];
                  if (nextLine == '\n\n' || nextLine == '\r\r') {
                     // If the next line is blank, then the list is over
                     nextLineMightBeInThisList = false;
                  } else if (nextLine.match(listSearchString) != null) {
                     theWholeList.push(nextLine);

                     // To figure out where to set the endpoint, we need to know if nextLine ends in a line break or not
                     const hasTrailingNewLine =
                        nextLine[nextLine.length - 1] === '\n' ||
                        nextLine === '\r';

                     // If it does, we want to take one off the end so we start *before* the new line that is matched at the end of the regex
                     endingPoint += hasTrailingNewLine
                        ? nextLine.length - 1
                        : nextLine.length;
                  } else {
                     nextLineMightBeInThisList = false;
                  }
               }
            }

            // Now we need to skip some things that look like lists, but aren't
            let definitelyAList = true;
            theWholeList.forEach((item, index) => {
               // If we've already determined this isn't a list, we're done here
               if (definitelyAList === false) return;
               const trimmedItem = item.trim();
               const testChar = trimmedItem[0].toLowerCase();

               if (
                  theWholeList.length === 1 &&
                  testChar != '-' &&
                  trimmedItem[1] != '.'
               ) {
                  // If there's only one thing and the ordinal isn't a dash and the second character isn't a period, it's not a list
                  definitelyAList = false;
               }

               // If all the letters in the ordinal are not the same case, it's not a list
               let itemCase = false;

               // First we need to get just the ordinal out of the list item
               const splitUpItem = item.matchAll(listItemPartMatch);
               for (const splitItem of splitUpItem) {
                  const { ordinal } = splitItem.groups;

                  // We only want to do this with letter ordinals
                  if (ordinal.match(/[a-z]/gi) != null) {
                     // Then we go through the ordinal character by character
                     for (let i = 0; i < ordinal.length; i++) {
                        const char = ordinal[i];

                        // If this character isn't a letter (maybe it's a space or a period), skip it
                        if (char.match(/[a-z]/gi) == null) continue;

                        if (i === 0) {
                           if (isLowerCase(char) && !isUpperCase(char)) {
                              itemCase = 'lower';
                           } else {
                              itemCase = 'upper';
                           }
                        } else if (isLowerCase(char) && !isUpperCase(char)) {
                           if (itemCase === 'upper') {
                              // If this character is lower case but we've previously established the case is upper, it's not a list
                              definitelyAList = false;
                           }
                        } else if (itemCase === 'lower') {
                           // If this character is upper case but we've previously established the case is lower, it's not a list
                           definitelyAList = false;
                        }
                     }
                  }
               }

               if (index === 0) {
                  if (
                     // If the list doesn't start where any of our list types do, it's not a list
                     testChar != 'i' &&
                     testChar != 'a' &&
                     testChar != '1' &&
                     testChar != '-'
                  ) {
                     definitelyAList = false;
                  }
                  if (
                     theWholeList.length === 1 &&
                     (testChar == 'i' || testChar == 'a')
                  ) {
                     // If there's only one thing in the list, and it starts with A or I, let's assume it's a sentence
                     definitelyAList = false;
                  }
                  if (
                     testChar === '1' &&
                     trimmedItem[1] !== ' ' &&
                     trimmedItem[1] !== '.'
                  ) {
                     // If the first item starts with 1, but the second character isn't a space or a period, it's not a list
                     definitelyAList = false;
                  }
               } else {
                  const trimmedPreviousItem = theWholeList[index - 1].trim();
                  const lastItemTestChar = trimmedPreviousItem[0].toLowerCase();
                  // If the test characters isn't in sequence from a previous list item, the test character isn't a roman numeral, and the second test character isn't the start of a new list or a dash, it's not a list
                  let isInSequence = false;
                  const testCharCode = trimmedItem.charCodeAt(0);
                  for (let i = 0; i < index; i++) {
                     const currentTestCharCode = theWholeList[i]
                        .trim()
                        .charCodeAt(0);
                     if (currentTestCharCode + 1 === testCharCode) {
                        isInSequence = true;
                     }
                  }

                  if (
                     !isInSequence &&
                     !['i', 'v', 'x', 'c', 'l', 'm'].includes(testChar) &&
                     !['i', 'a', '1', '-'].includes(testChar)
                  ) {
                     definitelyAList = false;
                  }
                  if (
                     trimmedItem[0] === trimmedPreviousItem[0] &&
                     testChar != '-' &&
                     testChar != 'i'
                  ) {
                     // If the test character for this item is exactly the same as the test character for the last item, and it's not a dash or an i (because roman numerals can start with the same letter, like i and ii), it's not a list
                     definitelyAList = false;
                  }
                  if (
                     trimmedItem[0] === trimmedPreviousItem[0] &&
                     !['i', 'v', 'x', 'l', 'c', 'm'].includes(
                        trimmedItem[1].toLowerCase()
                     ) &&
                     !['i', 'v', 'x', 'l', 'c', 'm'].includes(
                        trimmedPreviousItem[1].toLowerCase()
                     ) &&
                     trimmedItem[0] !== '-'
                  ) {
                     // If both items start with I, and one of them isn't followed by another roman numeral, it's not a list
                     definitelyAList = false;
                  }
               }
            });
            if (!definitelyAList) {
               // If it's not a list, we want to split it up so that it won't get recognized as one again and then put each piece into new RichText elements
               theWholeList.forEach(thisItem => {
                  const thisItemMatch = thisItem.matchAll(listItemPartMatch);
                  for (const itemPartMatch of thisItemMatch) {
                     elementsArray.push(
                        <>
                           <RichText text={itemPartMatch.groups.ordinal} />
                           <RichText text={itemPartMatch.groups.text} />
                        </>
                     );
                  }
               });
            } else {
               // Then we'll put the whole list into an appropriate HTML list element
               let nestedListTypesArray = [];

               // Ok, so this process is SHOCKINGLY intricate and complex. The rough breakdown is:
               // We go through each item figuring out what kind of list it is a part of. We're going to keep track of all our list types and each item inside them in our nestedListTypes array. Each type will be an object with two properties: name and items. Some of the items might be array duples with an item and then an array of items. When that happens, that means the array of items is a sublist nested within the item.
               // If an item is part of a new type, we'll push a new object into our nestedListTypesArray
               // If an item is part of a type we've seen before, first we roll up any types we saw AFTER that type and nest them inside the last item on that type, then we push the new item onto the end of the items array for its type
               // When we're done going through theWholeList, we'll roll up any types that are left (because we might have ended on a sublist) and build the final nested list
               theWholeList.forEach((item, index) => {
                  const trimmedItem = item.trim();
                  // We'll use the first character of the item to check what kind of list it's on
                  const listTypeCheckChar = trimmedItem[0];
                  let listType;
                  if (index > 0) {
                     // If this isn't the first thing, we need to check the item before to know what kind of list it is (because of ambiguity between roman numeral and alphabetical ordering)
                     const trimmedPrevItem = theWholeList[index - 1].trim();
                     const prevTypeCheckChar = trimmedPrevItem[0];
                     listType = getListType(
                        listTypeCheckChar,
                        prevTypeCheckChar
                     );

                     // Then we see if that list type already exists in our nestedListTypesArray
                     const typeIndex = nestedListTypesArray.findIndex(
                        type => type.name === listType
                     );

                     if (typeIndex === -1) {
                        // If it doesn't exist in the array already, we add it
                        nestedListTypesArray.push({
                           name: listType,
                           items: [trimmedItem]
                        });
                     } else {
                        // If it does exist, we need to check if it's the last item in the array
                        const currentTypeCount = nestedListTypesArray.length;

                        if (typeIndex === currentTypeCount - 1) {
                           // If it is, we can just add this item to the end of that list
                           nestedListTypesArray[typeIndex].items.push(
                              trimmedItem
                           );
                        } else {
                           // If it isn't, we have to fold up all the types after it and nest them inside the last item of this type
                           nestedListTypesArray = foldUpNestedListArrayToTypeIndex(
                              nestedListTypesArray,
                              typeIndex
                           );

                           // And then we can push this item onto the end of its type's list
                           nestedListTypesArray[typeIndex].items.push(
                              trimmedItem
                           );
                        }
                     }
                  } else {
                     // For the first thing, we can just use its typeCheckChar to determine list type
                     listType = getListType(listTypeCheckChar);
                     // And we know it's not in the types array already, so we can just add it
                     nestedListTypesArray.push({
                        name: listType,
                        items: [trimmedItem]
                     });
                  }
               });
               // Now we need to construct our list element from our nestedListTypesArray. First though, we need to check if we've properly nested every level, which we haven't if the list ended on a sublist
               if (nestedListTypesArray.length > 0) {
                  nestedListTypesArray = foldUpNestedListArrayToTypeIndex(
                     nestedListTypesArray,
                     0
                  );
               }

               const listItems = nestedListTypesArray[0].items;

               // We can then map each of those items to an appropriate element
               const listItemsElements = listItems.map(item =>
                  properlyNestListItem(item)
               );

               const listElement = <ul>{listItemsElements}</ul>;

               // Push that element into the elementsArray
               elementsArray.push(listElement);
            }
            // And then set the stoppedAtIndexOverride accordingly
            stoppedAtIndexOverride = endingPoint - match.index;
         }

         if (stoppedAtIndexOverride !== false) {
            stoppedAtIndex = match.index + stoppedAtIndexOverride;
         } else {
            stoppedAtIndex = match.index + tag.index + tag[0].length;
         }

         let endingText = fixedText.substring(stoppedAtIndex);
         if (trimEndingText === true) {
            endingText = endingText.trim();
         }
         if (endingText !== '' && endingText !== ' ') {
            elementsArray.push(
               <RichText
                  text={endingText}
                  key={endingText}
                  matchCount={matchCount + 1}
               />
            );
         }
         return elementsArray;
      }

      // If it wasn't a style tag, we check if it's some kind of link
      const urls = match[0].matchAll(urlFinder);
      for (const url of urls) {
         if (url[0] !== match[0]) continue;
         let fullUrl = url[0];

         // Quick kludge until I find a cleaner way to not match this pattern that happens surprisingly often
         if (fullUrl.substring(fullUrl.length - 5).toLowerCase() === '...in')
            continue;

         // If there's no protocol and it's not a mailto, slap an https on that baby
         if (!fullUrl.includes('://') && !fullUrl.includes('mailto')) {
            fullUrl = `https://${fullUrl}`;
         }

         const startingText = fixedText.substring(stoppedAtIndex, match.index);

         stoppedAtIndex = match.index + url[0].length;

         const endingText = fixedText.substring(stoppedAtIndex);

         if (startingText !== '') {
            elementsArray.push(
               <RichText
                  text={startingText}
                  key={startingText}
                  nextText={fullUrl}
                  matchCount={matchCount + 1}
               />
            );
         }

         // ExplodingLink will handle presenting the link itself, now that we've stripped out any leading or trailing text
         const link = (
            <ExplodingLink
               url={fullUrl}
               keyString={matchCount}
               key={matchCount}
               priorText={priorText}
               nextText={endingText || nextText}
            />
         );
         elementsArray.push(link);

         if (endingText !== '') {
            elementsArray.push(
               <RichText
                  text={endingText}
                  key={endingText}
                  priorText={fullUrl}
                  matchCount={matchCount + 1}
               />
            );
         }

         return elementsArray;
      }
   }

   return fixedText;
};

RichText.propTypes = {
   text: PropTypes.string.isRequired,
   priorText: PropTypes.string,
   nextText: PropTypes.string
};

export default React.memo(RichText, (prev, next) => {
   if (prev.text !== next.text) {
      return false;
   }
   return true;
});
