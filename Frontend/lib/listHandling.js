import RichText from '../components/RichText';
import { isLowerCase, isUpperCase } from './TextHandling';

const listSearchString = /(?<ordinal>(?:[\r\n]{1}|^)[ ]*(?:[ixvclm]+[ \.,]+|[0-9]+[ \.,]+|[a-z]+[\.,]+|[a-z]{1}[ ]+|[-*\u2022,\u2023,\u25E6,\u2043,\u2219]+))(?<listTextContent>[ ]*[\w]+[^\r\n]+)/gi;
export { listSearchString };

const getListType = (listTypeCheckChar, prevTypeCheckChar) => {
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
   if (listTypeCheckChar.match(/[-]/) != null) {
      return 'dash';
   }
   if (listTypeCheckChar.match(/[\u2022]/) != null) {
      return 'bullet22';
   }
   if (listTypeCheckChar.match(/[\u2023]/) != null) {
      return 'bullet23';
   }
   if (listTypeCheckChar.match(/[\u25E6]/) != null) {
      return 'bulletE6';
   }
   if (listTypeCheckChar.match(/[\u2043]/) != null) {
      return 'bullet43';
   }
   if (listTypeCheckChar.match(/[\u2219]/) != null) {
      return 'bullet19';
   }
   if (listTypeCheckChar.match(/[*]/) != null) {
      return 'asterisk';
   }
};
export { getListType };

const properlyNestListItem = item => {
   if (Array.isArray(item)) {
      // If the item is an array, the first item should be a string and the second item should be an array with a list to nest within the first item
      const sublistItems = item[1].map(sublistItem =>
         properlyNestListItem(sublistItem)
      );

      const splitUpItem = item[0].matchAll(listSearchString);

      for (const match of splitUpItem) {
         return (
            <li>
               {item[0]}
               <ul>{sublistItems}</ul>
            </li>
         );
      }
   }
   const splitUpItem = item.matchAll(listSearchString);

   for (const match of splitUpItem) {
      return (
         <li>
            {match.groups.ordinal}
            <RichText text={match.groups.listTextContent} />
         </li>
      );
   }
};
export { properlyNestListItem };

const foldUpNestedListArrayToTypeIndex = (nestedListTypesArray, typeIndex) => {
   const totalTypeCount = nestedListTypesArray.length;

   for (let i = totalTypeCount - 1; i > typeIndex; i -= 1) {
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

const getListElement = (listItem, fixedText, match) => {
   const theWholeList = [listItem];

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
               nextLine[nextLine.length - 1] === '\n' || nextLine === '\r';

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
         testChar.match(/[-*\u2022\u2023\u25E6\u2043\u2219]/gim) == null &&
         trimmedItem[1] != '.' &&
         trimmedItem[1] != ','
      ) {
         // If there's only one thing and the ordinal isn't a dash and the second character isn't a period or comma, it's not a list
         // console.log('failed test 1');
         definitelyAList = false;
      }

      // If all the letters in the ordinal are not the same case, it's not a list
      let itemCase = false;

      // First we need to get just the ordinal out of the list item
      const splitUpItem = item.matchAll(listSearchString);
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
                     // console.log('failed test 2');
                     definitelyAList = false;
                  }
               } else if (itemCase === 'lower') {
                  // If this character is upper case but we've previously established the case is lower, it's not a list
                  // console.log('failed test 3');
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
            testChar.match(/[-*\u2022,\u2023,\u25E6,\u2043,\u2219]/gi) == null
         ) {
            for (const splitItem of splitUpItem) {
               const { ordinal } = splitItem.groups;
               if (
                  ordinal.match(/(?:[0-9]{1,2}[\.,]{1}|[a-z]{1}[\.]{1})/gi) !=
                  null
               ) {
                  // However, if it's a one or two digit number immediately followed by a period or comma, or a single letter immediately followed by a period, we'll make an exception because that's so obviously a list. Sometimes lists get broken up with multiple line breaks, and when it's this obvious that it's a list, we'll allow it
                  // console.log('failed test 4');
                  definitelyAList = false;
               }
            }
         }
         if (
            theWholeList.length === 1 &&
            (testChar == 'i' || testChar == 'a') &&
            trimmedItem[1] !== '.'
         ) {
            // If there's only one thing in the list, and it starts with A or I and the second character isn't a period, let's assume it's a sentence
            // console.log('failed test 5');
            definitelyAList = false;
         }
         if (
            testChar === '1' &&
            trimmedItem[1] !== ' ' &&
            trimmedItem[1] !== '.' &&
            trimmedItem[1] !== ','
         ) {
            // If the first item starts with 1, but the second character isn't a space, period, or comma it's not a list
            // console.log('failed test 6');
            definitelyAList = false;
         }
      } else {
         const trimmedPreviousItem = theWholeList[index - 1].trim();
         const lastItemTestChar = trimmedPreviousItem[0].toLowerCase();
         // If the test characters isn't in sequence from a previous list item, the test character isn't a roman numeral, and the second test character isn't the start of a new list or a dash, it's not a list
         let isInSequence = false;
         const testCharCode = trimmedItem.charCodeAt(0);
         for (let i = 0; i < index; i++) {
            const currentTestCharCode = theWholeList[i].trim().charCodeAt(0);
            if (currentTestCharCode + 1 === testCharCode) {
               isInSequence = true;
            }
         }

         if (
            !isInSequence &&
            !['i', 'v', 'x', 'c', 'l', 'm'].includes(testChar) &&
            testChar.match(/[-*\u2022,\u2023,\u25E6,\u2043,\u2219ia1]/gi) ==
               null
         ) {
            // console.log('failed test 7');
            definitelyAList = false;
         }
         if (
            trimmedItem[0] === trimmedPreviousItem[0] &&
            testChar.match(/[-*\u2022,\u2023,\u25E6,\u2043,\u2219]/gi) ==
               null &&
            testChar != 'i'
         ) {
            // If the test character for this item is exactly the same as the test character for the last item, and it's not a dash, bullet, asterisk, or an i (because roman numerals can start with the same letter, like i and ii), it's not a list
            // console.log('failed test 8');
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
            trimmedItem[0].match(/[-*\u2022,\u2023,\u25E6,\u2043,\u2219]/) ==
               null
         ) {
            // If both items start with the same character, and one of them isn't followed by another roman numeral and the character isn't a bullet, dash, or asterisk, it's not a list
            // console.log('failed test 9');
            definitelyAList = false;
         }
      }
   });
   if (!definitelyAList) {
      // If it's not a list, we want to split it up so that it won't get recognized as one again and then put each piece into new RichText elements
      const notAListArray = [];
      theWholeList.forEach(thisItem => {
         const thisItemMatch = thisItem.matchAll(listSearchString);
         for (const itemPartMatch of thisItemMatch) {
            notAListArray.push(
               <>
                  <RichText text={itemPartMatch.groups.ordinal} />
                  <RichText text={itemPartMatch.groups.listTextContent} />
               </>
            );
         }
      });
      return [notAListArray, endingPoint];
   }
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
         listType = getListType(listTypeCheckChar, prevTypeCheckChar);

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
               nestedListTypesArray[typeIndex].items.push(trimmedItem);
            } else {
               // If it isn't, we have to fold up all the types after it and nest them inside the last item of this type
               nestedListTypesArray = foldUpNestedListArrayToTypeIndex(
                  nestedListTypesArray,
                  typeIndex
               );

               // And then we can push this item onto the end of its type's list
               nestedListTypesArray[typeIndex].items.push(trimmedItem);
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
   const listItemsElements = listItems.map(item => properlyNestListItem(item));

   const listElement = <ul>{listItemsElements}</ul>;

   // Push that element into the elementsArray
   return [listElement, endingPoint];
};
export { getListElement };
