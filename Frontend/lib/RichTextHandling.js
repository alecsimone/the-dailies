import { useState, useRef } from 'react';

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

const autoCloseBracketLink = (e, textRef, setText) => {
   const thisInput = e.target;
   const { selectionStart, selectionEnd } = e.target;

   e.preventDefault();

   const startingText = textRef.current.substring(0, selectionStart);
   const bracketCheck = startingText.matchAll(/\[.*\]/gim);
   for (const match of bracketCheck) {
      // Make sure this is the bracketed text immediately preceding the open paren
      if (match.index + match[0].length === selectionStart) {
         // If they had any text after this, make sure to tack it on the end of our new text
         const endingText = textRef.current.substring(selectionEnd);
         const newText = `${startingText}()${endingText}`;

         setText(newText);
         textRef.current = newText;
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

const wrapTextWithTag = (target, tag, textRef, setText) => {
   const { selectionStart, selectionEnd } = target;

   // Check if the text is already wrapped with the tag, and if so, remove it
   const fourCharactersSurroundingStart = textRef.current.substring(
      selectionStart - 2,
      selectionStart + 2
   );
   const fourCharactersSurroundingEnd = textRef.current.substring(
      selectionEnd - 2,
      selectionEnd + 2
   );

   let newText;
   let newSelectionStart;
   let newSelectionEnd;
   if (
      (fourCharactersSurroundingStart.includes(tag) &&
         fourCharactersSurroundingEnd.includes(tag)) ||
      (tag === '<"' &&
         (fourCharactersSurroundingStart.includes(tag) ||
            fourCharactersSurroundingEnd.includes(tag)))
   ) {
      // So what we're gonna do here is take the text up to two characters before the selection, the selection minus the two characters on either end, and the text starting two characters after the end of the selection. This will leave us with a four character gap on either side of the selection, which will be filled in by our de-tagged fourCharacters from earlier
      const before = textRef.current.substring(0, selectionStart - 2);
      const selectionMinusFour = textRef.current.substring(
         selectionStart + 2,
         selectionEnd - 2
      );
      const after = textRef.current.substring(selectionEnd + 2);

      const detaggedStartCharacters = fourCharactersSurroundingStart.replace(
         tag,
         ''
      );
      let detaggedEndCharacters;
      if (tag === '<"') {
         detaggedEndCharacters = fourCharactersSurroundingEnd.replace('">', '');
      } else {
         detaggedEndCharacters = fourCharactersSurroundingEnd.replace(tag, '');
      }

      newText = `${before}${detaggedStartCharacters}${selectionMinusFour}${detaggedEndCharacters}${after}`;

      newSelectionStart = selectionStart - tag.length;
      newSelectionEnd = selectionEnd - tag.length;
   } else {
      const before = textRef.current.substring(0, selectionStart);
      const selection = textRef.current.substring(selectionStart, selectionEnd);
      const after = textRef.current.substring(selectionEnd);
      if (tag === '<"') {
         newText = `${before}${tag}${selection}">${after}`;
      } else {
         newText = `${before}${tag}${selection}${tag}${after}`;
      }

      newSelectionStart = selectionStart + tag.length;
      newSelectionEnd = selectionEnd + tag.length;
   }

   setText(newText);
   textRef.current = newText;
   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newSelectionStart, newSelectionEnd),
      1
   );
};
export { wrapTextWithTag };

const linkifyText = (target, textRef, setText) => {
   const { selectionStart, selectionEnd } = target;

   const before = textRef.current.substring(0, selectionStart);
   const selection = textRef.current.substring(selectionStart, selectionEnd);
   const after = textRef.current.substring(selectionEnd);

   const newText = `${before}[${selection}]()${after}`;

   // If we have text selected, we want to put the cursor inside the parentheses. If we don't, we want to put it inside the brackets.
   let newCursorPos;
   if (selectionStart !== selectionEnd) {
      newCursorPos = selectionEnd + 3;
   } else {
      newCursorPos = selectionStart + 1;
   }

   setText(newText);
   textRef.current = newText;
   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newCursorPos, newCursorPos),
      1
   );
};
export { linkifyText };

const addSummaryTagsToText = (target, textRef, setText) => {
   const { selectionStart, selectionEnd } = target;

   const before = textRef.current.substring(0, selectionStart);
   const selection = textRef.current.substring(selectionStart, selectionEnd);
   const after = textRef.current.substring(selectionEnd);

   const newText = `${before}>>${selection}<<()${after}`;

   // If we have text selected, we want to put the cursor inside the parentheses. If we don't, we want to put it inside the arrows.
   let newCursorPos;
   if (selectionStart !== selectionEnd) {
      newCursorPos = selectionEnd + 5;
   } else {
      newCursorPos = selectionStart + 2;
   }

   setText(newText);
   textRef.current = newText;
   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => target.setSelectionRange(newCursorPos, newCursorPos),
      1
   );
};
export { addSummaryTagsToText };

const encloseSelectedText = (e, textRef, setText) => {
   e.preventDefault();

   const thisInput = e.target;
   const { selectionStart, selectionEnd } = e.target;

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

   const before = textRef.current.substring(0, selectionStart);
   const selection = textRef.current.substring(selectionStart, selectionEnd);
   const after = textRef.current.substring(selectionEnd);
   const newText = `${before}${e.key}${selection}${closer}${after}`;

   setText(newText);
   textRef.current = newText;
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
