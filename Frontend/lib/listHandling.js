import RichText from '../components/RichText';
import { isLowerCase, isUpperCase } from './TextHandling';

const listSearchString = /(?<ordinal>(?:[\r\n]{1}|^)[ ]*(?:[ixvclm]+[ \.,]+|[0-9]+[ \.,]+|[a-z]+[\.,]+|[a-z]{1}[ ]+|[-*\u2022,\u2023,\u25E6,\u2043,\u2219]+))(?<listTextContent>[ ]*[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+[^\r\n]+)/gi;
export { listSearchString };
// That long ass list of unicode characters came from a stack overflow answer that said it would match any letters in any language. So far it's worked pretty well.

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
      // If the text content of the list item matches the list search string (for instance if it starts with a number with a decimal like 1.64), we'll have to shove a zero width space in front of it so that it doesn't get turned into a list itself. We know it is not supposed to be one, because it's on the same line as the original list item, but once we put it into its own RichText element, that element will not know that it's on its own line and will think it's a list.
      const itemListMatchCheck = match.groups.listTextContent.match(
         listSearchString
      );
      return (
         <li>
            {match.groups.ordinal}
            <RichText
               text={
                  itemListMatchCheck != null
                     ? `\u200B${match.groups.listTextContent}`
                     : match.groups.listTextContent
               }
            />
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
         console.log('failed test 1');
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
                     console.log('failed test 2');
                     definitelyAList = false;
                  }
               } else if (itemCase === 'lower') {
                  // If this character is upper case but we've previously established the case is lower, it's not a list
                  console.log('failed test 3');
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
                  console.log('failed test 4');
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
            console.log('failed test 5');
            definitelyAList = false;
         }
         if (
            testChar === '1' &&
            trimmedItem[1] !== ' ' &&
            trimmedItem[1] !== '.' &&
            trimmedItem[1] !== ','
         ) {
            // If the first item starts with 1, but the second character isn't a space, period, or comma it's not a list
            console.log('failed test 6');
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
            console.log('failed test 7');
            definitelyAList = false;
         }
         if (
            trimmedItem[0] === trimmedPreviousItem[0] &&
            testChar.match(/[-*\u2022,\u2023,\u25E6,\u2043,\u2219]/gi) ==
               null &&
            testChar != 'i'
         ) {
            // If the test character for this item is exactly the same as the test character for the last item, and it's not a dash, bullet, asterisk, or an i (because roman numerals can start with the same letter, like i and ii), it's not a list
            console.log('failed test 8');
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
            console.log('failed test 9');
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
