import { useState, useRef } from 'react';
import { getElementHeight } from '../Stickifier/stickifier';
import { getScrollingParent } from '../Stickifier/useStickifier';
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
   // Because we've added an element at the bottom of the screen that covers our textareas, we need a function to adjust our scroll position to make sure our cursor stays higher up than those buttons. Effectively, we need to figure out where our cursor is, figure out where those buttons are, and then adjust our scroll position accordingly.

   // Before we go any further, let's make sure this textarea is part of a content block, and that it has sticky buttons, because if it doesn't, we don't need to bother with any of this
   const parentBlock = el.closest('.contentBlock');
   if (parentBlock == null) return;

   const buttons = parentBlock.querySelector('.newcontentButtons');
   if (buttons == null) return;

   // We also want to check if we're in a comments section and if that has content buttons, because if it doesn't, we don't need to do any of this either
   const commentsContainer = el.closest('.commentsContainer');
   const commentsButtons = commentsContainer.querySelector(
      '.newcontentBUttons'
   );
   if (commentsButtons == null) console.log('yeah no buttons here');
   if (commentsButtons == null) return;

   // First we have to figure out how far from the top of the textarea the cursor is. We'll use a function I found online for that, which needs the current position of the cursor. We'll use the selection end because we're trying to stay above the bottom of the screen, so we want the lowest relevant part of the selection.
   const cursorPosition = el.selectionEnd;
   const cursorXY = getCursorXY(el, cursorPosition);

   // Then we have to figure out how far the top of the textarea is from the top of the scrolling element
   let totalOffset = 0; // Normally we'd start with the element's offsetTop, but that's already included in our getCursorXY function, which we'll be adding the total offset to, so we'll just skip it here
   let parent = el.offsetParent;
   while (parent != null) {
      totalOffset += parent.offsetTop;
      parent = parent.offsetParent;
   }

   // Then we'll also have to add the height of a line of text so we can get the bottom of the cursor instead of the top of it
   const elStyle = window.getComputedStyle(el);
   const elLineHeight = parseInt(elStyle.lineHeight);

   // So the position of the bottom of the cursor is equal to its Y position as calculated by our helper function, plus the total offset of all its parent elements, plus the height of a line of text
   const cursorBottom = cursorXY.y + totalOffset + elLineHeight;

   // Next we need to figure out where the bottom of the screen is
   const scrollingParent = getScrollingParent(el);
   const windowHeight = window.innerHeight;

   // If there's a bottom bar (ie, if we're on mobile), we'll need to adjust for that
   const bottomBar = document.querySelector('.bottomBar');
   const bottomBarHeight = bottomBar != null ? bottomBar.offsetHeight : 0;

   // Same for our sticky buttons
   const buttonsHeight = getElementHeight(buttons);

   // So the visible bottom is equal to the scrollTop of our scroller, plus the height of the window, minus the height of the bottom bar and the sticky buttons
   const visibleBottom =
      scrollingParent.scrollTop +
      windowHeight -
      bottomBarHeight -
      buttonsHeight;

   // However, the bottom of the screen is simply equal to the scrollingParent's scrollTop plus the height of the window
   const screenBottom = scrollingParent.scrollTop + windowHeight;

   // If the screen bottom is above the cursor bottom, the browser will adjust to correct for that, so we just need to adjust for the height of the sticky buttons
   if (screenBottom < cursorBottom) {
      const scrollAdjustment = buttonsHeight;
      window.setTimeout(() => {
         scrollingParent.scrollTop += scrollAdjustment;
      }, 1);
   } else if (visibleBottom < cursorBottom) {
      // If the screen bottom is below the cursor bottom, the browser won't adjust for us, so we need to adjust by the difference between the cursorBottom and the visibleBottom
      const scrollAdjustment = cursorBottom - visibleBottom;
      window.setTimeout(() => {
         scrollingParent.scrollTop += scrollAdjustment;
      }, 1); // I know this is exactly the same as the timeout code in the block above, but if we pull it out of the conditional, then it runs even when no adjustment is needed (at least I think that's what's happening. The scrolling definitely goes crazy if you do that.)
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
   // First we need to focus on the input, find out where the cursor/selection is, and find out what text is already in the input
   target.focus();
   const { selectionStart, selectionEnd } = target;
   const initialText = target.value;

   let endTag = tag;
   if (tag === '<"') {
      endTag = '">';
   } else if (tag === '<text>') {
      endTag = '</text>';
   }

   // Then we need to figure out if the text is already wrapped in the tag or not, because if it is we want to remove the tags, if it's not we want to add them
   const charactersSurroundingStart = initialText.substring(
      selectionStart - tag.length,
      selectionStart + tag.length
   );
   const charactersSurroundingEnd = initialText.substring(
      selectionEnd - endTag.length,
      selectionEnd + endTag.length
   );

   let newSelectionStart;
   let newSelectionEnd;
   if (
      charactersSurroundingStart.includes(tag) &&
      charactersSurroundingEnd.includes(endTag)
   ) {
      // If the text is already surrounded by the tag, we need to remove it. We start by selecting and then deleting the starting tag

      // First we figure out where the tag starts relative to the selection, as it might be inside the selection or just outside of it
      const indexOfStartTag = charactersSurroundingStart.indexOf(tag);

      // We'll need to move our selection to surround the start tag. By subtracting the length of the tag, we move the cursor to the beginning of our charactersSurroundingStart string, and then we add the indexOfStartTag to move the cursor to the start of the tag.
      let properSelectionStart = selectionStart - tag.length + indexOfStartTag;

      if (charactersSurroundingStart.length < 2 * tag.length) {
         // However, there may not have been enough characters at the start of the input for our charactersSurroundingStart to have started where we'd expect it to, so we'll check for that.
         const charactersMissingFromSurroundingStartString =
            2 * tag.length - charactersSurroundingStart.length;

         // Our properSelectionStart will be off by the number of characters missing, so we just add them in here
         properSelectionStart += charactersMissingFromSurroundingStartString;
      }

      // Then we set our new selection, starting where we just determined the start of the tag was, and ending as many characters as the tag is after that
      target.setSelectionRange(
         properSelectionStart,
         properSelectionStart + tag.length
      );

      // and we delete the selected tag
      document.execCommand('delete', false);

      // Now we need to do the same thing with the end tag

      // First we figure out where the tag starts relative to the selection, as it might be inside the selection or just outside of it
      const indexOfEndTag = charactersSurroundingEnd.indexOf(endTag);

      // We'll need to move our selection to surround the end tag. By subtracting the length of the tag, we move the cursor to the beginning of our charactersSurroundingEnd string, and then we add the indexOfEndTag to move the cursor to the start of the tag. Then we also have to account for the lenght of the deleted start tag
      const properSelectionEnd =
         selectionEnd - endTag.length + indexOfEndTag - tag.length;

      // We don't need to adjust the end position the way we adjusted the start position to account for a truncated charactersSurrounding string, because the end tag will always be able to start at the assumed point, which is all that matters.

      target.setSelectionRange(
         properSelectionEnd,
         properSelectionEnd + endTag.length
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
      document.execCommand('insertText', false, endTag);

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
