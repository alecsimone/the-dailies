import { useState, useRef } from 'react';
import { dynamicallyResizeElement, getOneRem } from '../styles/functions';

const getCursorXY = (input, selectionPoint) => {
   // stole this from https://medium.com/@jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
   const { offsetLeft: inputX, offsetTop: inputY } = input;
   // create a dummy element that will be a clone of our input
   const div = document.createElement('div');
   // get the computed style of the input and clone it onto the dummy element
   const copyStyle = getComputedStyle(input);
   for (const prop of copyStyle) {
      div.style[prop] = copyStyle[prop];
   }
   // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
   const swap = '.';
   const inputValue =
      input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value;
   // set the div content to that of the textarea up until selection
   const textContent = inputValue.substr(0, selectionPoint);
   // set the text content of the dummy element div
   div.textContent = textContent;
   if (input.tagName === 'TEXTAREA') div.style.height = 'auto';
   // if a single line input then the div needs to be single line and not break out like a text area
   if (input.tagName === 'INPUT') div.style.width = 'auto';
   div.style.display = 'block'; // My addition: if the parent isn't display block, the offsetTop won't work
   // create a marker element to obtain caret position
   const span = document.createElement('span');
   // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
   span.textContent = inputValue.substr(selectionPoint) || '.';
   // append the span marker to the div
   div.appendChild(span);
   // append the dummy element to the parent (My change. The original code had it on the document body, but then it isn't really constrained by the size of its parent and thus doesn't yield the proper spanY)
   const parent = input.parentElement;
   parent.appendChild(div);
   // get the marker position, this is the caret position top and left relative to the input
   const { offsetLeft: spanX, offsetTop: spanY } = span;
   // lastly, remove that dummy element
   // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
   parent.removeChild(div);
   // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
   return {
      x: inputX + spanX,
      y: inputY + spanY
   };
};
export { getCursorXY };

const keepCaretAboveStickyButtons = el => {
   const cursorPosition = el.selectionEnd;
   const cursorXY = getCursorXY(el, cursorPosition);
   const oneRem = getOneRem();
   const cursorDepth = cursorXY.y - el.offsetTop + 3 * oneRem + 1; // getCursorXY includes the offset of the element, so we're removing it here. I don't really know where the 3 rem comes from, but the 1px I think is for the border

   const parentBlock = el.closest('.contentBlock');
   const stickyButtons = parentBlock.querySelector('.newcontentButtons');

   const textAreaRect = el.getBoundingClientRect();
   const stickyButtonsRect = stickyButtons.getBoundingClientRect();

   const totalCursorDepth = textAreaRect.top + cursorDepth;

   console.log(textAreaRect.top, cursorDepth);
   console.log(stickyButtonsRect.top, totalCursorDepth);
   if (stickyButtonsRect.top < totalCursorDepth) {
      const scrollAdjustment =
         stickyButtonsRect.top - (totalCursorDepth + 0.5 * oneRem); // Adding the 0.5rem just for some breathing room beneath the cursor
      // newScrollTop = oldScrollTop - scrollAdjustment;

      window.setTimeout(() => {
         const mainSection = document.querySelector('.mainSection');
         mainSection.scrollTop -= scrollAdjustment;
      }, 1);
   }
};
export { keepCaretAboveStickyButtons };

const autoCloseBracketLink = e => {
   const thisInput = e.target;
   const { selectionStart, selectionEnd, value: initialText } = e.target;

   const startingText = initialText.substring(0, selectionStart);
   const bracketCheck = startingText.matchAll(/\[.*\]/gim);
   for (const match of bracketCheck) {
      e.preventDefault(); // Need this inside the for loop so that it only fires if we get a match. Otherwise it just breaks typing
      // Make sure this is the bracketed text immediately preceding the open paren
      if (match.index + match[0].length === selectionStart) {
         // If they had any text after this, make sure to tack it on the end of our new text
         // const newText = `${startingText}()${endingText}`;

         thisInput.setSelectionRange(startingText.length, startingText.length);
         document.execCommand('insertText', false, '()');

         // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
         window.setTimeout(
            () =>
               thisInput.setSelectionRange(
                  selectionStart + 1,
                  selectionEnd + 1
               ),
            1
         );
      }
   }
};
export { autoCloseBracketLink };

const wrapTextWithTag = (target, tag) => {
   target.focus();
   const { selectionStart, selectionEnd } = target;
   const initialText = target.value;

   // Check if the text is already wrapped with the tag, and if so, remove it
   const fourCharactersSurroundingStart = initialText.substring(
      selectionStart - 2,
      selectionStart + 2
   );
   const fourCharactersSurroundingEnd = initialText.substring(
      selectionEnd - 2,
      selectionEnd + 2
   );

   let newSelectionStart;
   let newSelectionEnd;
   if (
      (fourCharactersSurroundingStart.includes(tag) &&
         fourCharactersSurroundingEnd.includes(tag)) ||
      (tag === '<"' &&
         (fourCharactersSurroundingStart.includes(tag) ||
            fourCharactersSurroundingEnd.includes('">')))
   ) {
      // If the text is already surrounded by the tag, we need to remove it
      // So what we're gonna do here is take the text up to two characters before the selection, the selection minus the two characters on either end, and the text starting two characters after the end of the selection. This will leave us with a four character gap on either side of the selection, which will be filled in by our de-tagged fourCharacters from earlier

      const indexOfStartTag = fourCharactersSurroundingStart.indexOf(tag);
      const startAdjustment = indexOfStartTag - 2;
      const properSelectionStart = selectionStart + startAdjustment;

      target.setSelectionRange(
         properSelectionStart,
         properSelectionStart + tag.length
      );
      document.execCommand('delete', false);

      const indexOfEndTag = fourCharactersSurroundingEnd.indexOf(
         tag === '<"' ? '">' : tag
      );
      const endAdjustment = indexOfEndTag - 2;
      const properSelectionEnd = selectionEnd + endAdjustment - tag.length; // we subtract tag.length to account for the tag deleted from the start

      target.setSelectionRange(
         properSelectionEnd,
         properSelectionEnd + tag.length
      );
      document.execCommand('delete', false);

      newSelectionStart = properSelectionStart;
      newSelectionEnd = properSelectionEnd;
   } else {
      target.setSelectionRange(selectionStart, selectionStart);
      document.execCommand('insertText', false, tag);
      target.setSelectionRange(
         selectionEnd + tag.length,
         selectionEnd + tag.length
      );
      if (tag === '<"') {
         document.execCommand('insertText', false, '">');
      } else {
         document.execCommand('insertText', false, tag);
      }

      newSelectionStart = selectionStart + tag.length;
      newSelectionEnd = selectionEnd + tag.length;
   }

   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newSelectionStart, newSelectionEnd),
      1
   );
};
export { wrapTextWithTag };

const linkifyText = target => {
   const { selectionStart, selectionEnd } = target;
   const initialText = target.value;

   target.focus();
   target.setSelectionRange(selectionStart, selectionStart);
   document.execCommand('insertText', false, '[');

   target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
   document.execCommand('insertText', false, ']()');

   // If we have text selected, we want to put the cursor inside the parentheses. If we don't, we want to put it inside the brackets.
   let newCursorPos;
   if (selectionStart !== selectionEnd) {
      newCursorPos = selectionEnd + 3;
   } else {
      newCursorPos = selectionStart + 1;
   }

   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newCursorPos, newCursorPos),
      1
   );
};
export { linkifyText };

const addSummaryTagsToText = target => {
   const { selectionStart, selectionEnd } = target;

   target.focus();
   target.setSelectionRange(selectionStart, selectionStart);
   document.execCommand('insertText', false, '>>');

   target.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
   document.execCommand('insertText', false, '<<()');

   // If we have text selected, we want to put the cursor inside the parentheses. If we don't, we want to put it inside the arrows.
   let newCursorPos;
   if (selectionStart !== selectionEnd) {
      newCursorPos = selectionEnd + 5;
   } else {
      newCursorPos = selectionStart + 2;
   }

   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newCursorPos, newCursorPos),
      1
   );
};
export { addSummaryTagsToText };

const encloseSelectedText = e => {
   e.preventDefault();

   const thisInput = e.target;
   const { selectionStart, selectionEnd, value: initialText } = e.target;

   let closer;
   if (e.key === '(') {
      closer = `)`;
   } else if (e.key === '[') {
      closer = `]`;
   } else if (e.key === '{') {
      closer = `}`;
   } else if (e.key === '"') {
      closer = `"`;
   } else if (e.key === "'") {
      closer = `'`;
   } else if (e.key === '<') {
      closer = '>';
   } else if (e.key === '`') {
      closer = '`';
   }

   // const before = initialText.substring(0, selectionStart);
   // const selection = initialText.substring(selectionStart, selectionEnd);
   // const after = initialText.substring(selectionEnd);
   // const newText = `${before}${e.key}${selection}${closer}${after}`;

   thisInput.setSelectionRange(selectionStart, selectionStart);
   document.execCommand('insertText', false, e.key);

   thisInput.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
   document.execCommand('insertText', false, closer);

   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => thisInput.setSelectionRange(selectionStart + 1, selectionEnd + 1),
      1
   );
};
export { encloseSelectedText };

const useSearchResultsSelector = () => {
   const [postSearchResults, setPostSearchResults] = useState([]);
   const [highlightedIndex, setHighlightedIndex] = useState(-1);

   const searchResultsRef = useRef(postSearchResults);
   const highlightedIndexRef = useRef(highlightedIndex);

   const resetResultsSelector = () => {
      setPostSearchResults([]);
      searchResultsRef.current = [];
      setHighlightedIndex(-1);
      highlightedIndexRef.current = -1;
   };

   return {
      postSearchResults,
      setPostSearchResults,
      highlightedIndex,
      setHighlightedIndex,
      searchResultsRef,
      highlightedIndexRef,
      resetResultsSelector
   };
};
export { useSearchResultsSelector };

const tabTheText = target => {
   const { selectionStart, selectionEnd, value: initialText } = target;
   target.focus();

   // First we get all the text before the cursor and all the text after
   const textBeforeCursor = initialText.substring(0, selectionStart);
   const textAfterCursor = initialText.substring(selectionStart);

   // Then we find the last new line before the cursor
   const lastNewLineIndex = textBeforeCursor.lastIndexOf('\n');

   let newText;
   let newSelectionStart;
   let newSelectionEnd;
   if (selectionStart !== selectionEnd) {
      // If text is selected, add a tab at the beginning of the line
      if (lastNewLineIndex === -1) {
         // If there are no new lines, we start at the beginning of the string
         target.setSelectionRange(0, 0);
         document.execCommand('insertText', false, '        ');
      } else {
         // If there are new lines, we start at the beginning of the last new line before the cursor
         target.setSelectionRange(lastNewLineIndex + 1, lastNewLineIndex + 1);
         document.execCommand('insertText', false, '        ');
      }
      newSelectionStart = selectionStart + 8;
      newSelectionEnd = selectionEnd + 8;
   } else {
      // If no text is selected, add spaces till the next tab stop and put the cursor there
      let spacesPastLastTab;
      if (lastNewLineIndex === -1) {
         // If there is no new line before the cursor, we start counting characters at the beginning of the string
         spacesPastLastTab = selectionStart % 8;
      } else {
         // If there is a new line, we start counting characters there
         const charactersSinceNewLine = selectionStart - lastNewLineIndex;
         spacesPastLastTab = charactersSinceNewLine % 8;
      }
      const spacesToNextTab = 8 - spacesPastLastTab;
      let spacesToAdd = '';
      for (let i = 0; i < spacesToNextTab; i += 1) {
         spacesToAdd += ' ';
      }

      target.setSelectionRange(selectionStart, selectionStart);
      document.execCommand('insertText', false, spacesToAdd);

      newSelectionStart = selectionStart + spacesToNextTab;
      newSelectionEnd = selectionEnd + spacesToNextTab;
   }

   window.setTimeout(() => {
      target.setSelectionRange(newSelectionStart, newSelectionEnd);
      dynamicallyResizeElement(target);
   }, 1);
};
export { tabTheText };

const unTabTheText = target => {
   // First we get the text up to the cursor
   const { selectionStart, selectionEnd, value: initialText } = target;
   target.focus();

   const textBeforeCursor = initialText.substring(0, selectionStart);

   // Then we look for the last new line within that text
   const lastNewLineIndex = textBeforeCursor.lastIndexOf('\n');

   let endingText;
   // if we find one, we split up the text into the text before and after that new line
   if (lastNewLineIndex > -1) {
      endingText = initialText.substring(lastNewLineIndex + 1);
   } else {
      // If we don't, we're just going to use the whole string as the ending text
      endingText = initialText;
   }

   // Then we replace up to 8 spaces at the beginning of the string with nothing
   const spaceMatcher = /^[ ]{2,8}/;
   const spacesMatch = endingText.match(spaceMatcher);
   const spacesCount = spacesMatch[0].length;
   // endingText = endingText.replace(spaceMatcher, '');

   target.setSelectionRange(
      lastNewLineIndex + 1,
      lastNewLineIndex + 1 + spacesCount
   );
   document.execCommand('delete', false);

   // Put the pieces back together
   // const newText = `${startingText}${endingText}`;

   window.setTimeout(() => {
      target.setSelectionRange(
         selectionStart - spacesCount,
         selectionEnd - spacesCount
      );
      dynamicallyResizeElement(target);
   }, 1);
};
export { unTabTheText };

const insertLineAbove = target => {
   // First we get the text up to the cursor
   const { selectionStart, selectionEnd, value: initialText } = target;
   const textBeforeCursor = initialText.substring(0, selectionStart);

   // Then we look for the last new line within that text
   const lastNewLineIndex = textBeforeCursor.lastIndexOf('\n');

   let newText;
   let newCursorPos;
   // If we find one, then we add another right before it and put the cursor right after it
   if (lastNewLineIndex > -1) {
      target.setSelectionRange(lastNewLineIndex + 1, lastNewLineIndex + 1);
      document.execCommand('insertText', false, '\n');

      newCursorPos = lastNewLineIndex + 1;
   } else {
      // If we don't find a new line, we put a new line at the beginning of the string and then put the cursor there too
      target.setSelectionRange(0, 0);
      document.execCommand('insertText', false, '\n');
      newCursorPos = 0;
   }
   window.setTimeout(() => {
      target.setSelectionRange(newCursorPos, newCursorPos);
      dynamicallyResizeElement(target);
   }, 1);
};
export { insertLineAbove };
