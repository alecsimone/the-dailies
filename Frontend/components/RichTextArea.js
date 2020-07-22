import styled, { ThemeContext } from 'styled-components';
import { useState, useRef, useContext, useEffect } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { dynamicallyResizeElement, setAlpha } from '../styles/functions';
import { SEARCH_QUERY } from '../pages/search';
import { home } from '../config';

const StyledWrapper = styled.div`
   width: 100%;
   .postSearchTooltip {
      background: ${props => props.theme.lightBlack};
      border: 3px solid ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
      border-top: 2px solid
         ${props => setAlpha(props.theme.highContrastGrey, 0.8)};
      display: none;
      position: absolute;
      z-index: 2;
      .postSearchResult {
         padding: 0.25rem 1rem;
         cursor: pointer;
         border-bottom: 2px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
         &:last-child {
            border-bottom: none;
         }
         &.highlighted {
            background: ${props => props.theme.majorColor};
         }
         &:hover {
            background: ${props => props.theme.majorColor};
         }
      }
   }
`;

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

const autoCloseBracketLink = (e, textRef, setText) => {
   const thisInput = e.target;
   const { selectionStart, selectionEnd } = e.target;

   e.preventDefault();

   const startingText = textRef.current.substring(0, selectionStart);
   const bracketCheck = startingText.matchAll(/\[.+\]/gim);
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

const wrapTextWithTag = (e, tag, textRef, setText) => {
   const thisInput = e.target;
   const { selectionStart, selectionEnd } = e.target;

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
      fourCharactersSurroundingStart.includes(tag) &&
      fourCharactersSurroundingEnd.includes(tag)
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
      const detaggedEndCharacters = fourCharactersSurroundingEnd.replace(
         tag,
         ''
      );

      newText = `${before}${detaggedStartCharacters}${selectionMinusFour}${detaggedEndCharacters}${after}`;

      newSelectionStart = selectionStart - tag.length;
      newSelectionEnd = selectionEnd - tag.length;
   } else {
      const before = textRef.current.substring(0, selectionStart);
      const selection = textRef.current.substring(selectionStart, selectionEnd);
      const after = textRef.current.substring(selectionEnd);
      newText = `${before}${tag}${selection}${tag}${after}`;

      newSelectionStart = selectionStart + tag.length;
      newSelectionEnd = selectionEnd + tag.length;
   }

   setText(newText);
   textRef.current = newText;
   // we need to make sure the text has changed before we set the new selection, otherwise it won't be based on the updated text
   window.setTimeout(
      () => thisInput.setSelectionRange(newSelectionStart, newSelectionEnd),
      1
   );
};

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

const RichTextArea = ({
   text,
   setText,
   postText,
   setEditable,
   placeholder,
   buttonText,
   id
}) => {
   const originalText = useRef(text);
   const textRef = useRef(text);
   const { mobileBPWidthRaw } = useContext(ThemeContext);

   const [postSearchResults, setPostSearchResults] = useState([]);
   const [highlightedIndex, setHighlightedIndex] = useState(-1);
   const searchResultsRef = useRef(postSearchResults);
   const highlightedIndexRef = useRef(highlightedIndex);

   useEffect(() => {
      const inputs = document.querySelectorAll(`.richTextInput`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            dynamicallyResizeElement(input);
         });
      }
      if (false) {
         // forcing eslint to include text in the dependencies
         console.log(text);
      }
   }, [text]);

   const secondMiddleClickListener = e => {
      if (e.button === 1) {
         if (originalText.current !== textRef.current) {
            if (!confirm('Discard changes?')) {
               return;
            }
         }
         setEditable(false);
      }
   };

   const [search, { loading: searchLoading }] = useLazyQuery(SEARCH_QUERY, {
      onCompleted: data => {
         setPostSearchResults(data.search);
         searchResultsRef.current = data.search;
      }
   });

   const closeResults = () => {
      setPostSearchResults([]);
      searchResultsRef.current = [];
      setHighlightedIndex(-1);
      highlightedIndexRef.current = -1;

      const input = document.querySelector(`#${id}`);
      if (input == null) return;
      const parent = input.closest('form');
      if (parent == null) return;
      const toolTip = parent.querySelector('.postSearchTooltip');
      toolTip.style.display = 'none';
      window.removeEventListener('keydown', navigateResultsRef.current);
   };

   const chooseResult = () => {
      const thisInput = document.querySelector(`#${id}`);
      if (thisInput == null) return;

      // A search can be triggered by a few different key phrases (see:, [p:", etc). So we need to get the letters before the cursor to know what it was, as it changes how we close the link we will ultimately generate. They all are kicked off by a quote though, so we'll get the most recent quote and work back from there
      const selectionPoint = thisInput.selectionStart;
      const mostRecentQuoteIndex = textRef.current.lastIndexOf(
         '"',
         selectionPoint - 1
      );

      const keyLetters = textRef.current.substring(
         mostRecentQuoteIndex - 5,
         mostRecentQuoteIndex
      );

      const previousText = textRef.current.substring(
         0,
         mostRecentQuoteIndex + 1
      );
      const afterText = textRef.current.substring(selectionPoint);

      const selectedTitle =
         searchResultsRef?.current[highlightedIndexRef.current]?.title;
      const selectedID =
         searchResultsRef?.current[highlightedIndexRef.current]?.id;

      let newText;
      if (keyLetters.toLowerCase() === 'see: ') {
         const newPreviousText = textRef.current.substring(
            0,
            mostRecentQuoteIndex
         );
         newText = `${`${newPreviousText}[${selectedTitle}`}](${selectedID})${afterText}`;
      } else {
         newText = `${previousText +
            selectedTitle}"](${selectedID})${afterText}`;
      }

      setText(newText);
      textRef.current = newText;

      const newCursorPos =
         mostRecentQuoteIndex + selectedTitle.length + selectedID.length + 6;

      thisInput.setSelectionRange(newCursorPos, newCursorPos);

      closeResults();
   };

   const navigateResults = e => {
      if (e.key === 'ArrowDown') {
         e.preventDefault();

         // If we're at the end, newIndex goes back to the beginning, otherwise it's +1
         const newIndex =
            highlightedIndexRef.current + 1 < searchResultsRef.current.length
               ? highlightedIndexRef.current + 1
               : 0;
         setHighlightedIndex(newIndex);
         highlightedIndexRef.current = newIndex;
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();

         // If we're at the beginning, newIndex goes to the end, otherwise it's -1
         const newIndex =
            highlightedIndexRef.current - 1 < 0
               ? searchResultsRef.current.length - 1
               : highlightedIndexRef.current - 1;
         setHighlightedIndex(newIndex);
         highlightedIndexRef.current = newIndex;
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
         closeResults();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
         e.preventDefault();
         chooseResult();
      }
   };
   const navigateResultsRef = useRef(navigateResults);

   const handleKeyDown = async e => {
      // Post the changes on ctrl or cmd + enter
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postText();
         return;
      }
      // Quit editing on escape
      if (e.key === 'Escape' && setEditable) {
         if (originalText.current !== textRef.current) {
            if (!confirm('Discard changes?')) {
               return;
            }
         }
         setEditable(false);
         return;
      }
      // If they type an open paren after a close bracket, close that paren for them
      if (
         e.key === '(' &&
         textRef.current[e.target.selectionStart - 1] === ']' &&
         e.target.selectionStart === e.target.selectionEnd
      ) {
         autoCloseBracketLink(e, textRef, setText);
         return;
      }
      // If they have text highlighted and type any of these characters, enclose the text in that kind of character
      if (
         (e.key === '(' ||
            e.key === '[' ||
            e.key === '{' ||
            e.key === '"' ||
            e.key === '<' ||
            e.key === '`' ||
            e.key === "'") &&
         e.target.selectionStart !== e.target.selectionEnd
      ) {
         encloseSelectedText(e, textRef, setText);
         return;
      }
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e, '**', textRef, setText);
      }
      if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e, '//', textRef, setText);
      }
      if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e, '__', textRef, setText);
      }
   };

   const handleKeyUp = async e => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab') return;

      const input = e.target;
      const selectionPoint = e.target.selectionStart;
      const mostRecentQuoteIndex = text.lastIndexOf('"', selectionPoint - 1);
      if (mostRecentQuoteIndex < 3) return; // Cant be a search string then, needs more text before the quote

      const previousThreeCharacters = text.substring(
         mostRecentQuoteIndex - 3,
         mostRecentQuoteIndex
      );
      const previousFiveCharacters = text.substring(
         mostRecentQuoteIndex - 5,
         mostRecentQuoteIndex
      );
      console.log(previousThreeCharacters);

      const parent = input.closest('form');
      const toolTip = parent.querySelector('.postSearchTooltip');

      // If it's not a search, let's get out of here
      if (
         (previousThreeCharacters.toLowerCase() !== '[p:' &&
            previousThreeCharacters.toLowerCase() !== '[t:' &&
            previousThreeCharacters.toLowerCase() !== '[c:' &&
            previousFiveCharacters.toLowerCase() !== 'see: ') ||
         selectionPoint === mostRecentQuoteIndex + 1
      ) {
         closeResults();
         return;
      }

      const searchTerm = text.substring(
         mostRecentQuoteIndex + 1,
         selectionPoint
      );

      const searchResults = await search({
         variables: {
            string: searchTerm,
            isTitleOnly: true
         }
      });

      if (toolTip.style.display === 'none') {
         const cursorXY = getCursorXY(input, mostRecentQuoteIndex);

         const inputStyle = window.getComputedStyle(input);
         const inputLineHeight = inputStyle.getPropertyValue('line-height');

         let left;
         if (window.innerWidth < mobileBPWidthRaw) {
            left = 0;
         } else if (window.innerWidth - 500 < cursorXY.x) {
            left = window.innerWidth - 500;
         } else {
            left = cursorXY.x;
         }

         toolTip.setAttribute(
            'style',
            `display: block; top: calc(${
               cursorXY.y
            }px + ${inputLineHeight}); left: ${left}px`
         );

         window.addEventListener('keydown', navigateResultsRef.current);
      }
   };

   let postSearchResultElements;
   if (postSearchResults.length > 0) {
      postSearchResultElements = postSearchResults.map((result, index) => (
         <div
            className={
               index === highlightedIndex
                  ? 'postSearchResult highlighted'
                  : 'postSearchResult'
            }
            key={index}
            onMouseDown={e => {
               e.preventDefault();
               setHighlightedIndex(index);
               highlightedIndexRef.current = index;
               chooseResult();
            }}
         >
            {result.title}
         </div>
      ));
   } else if (searchLoading) {
      postSearchResultElements = (
         <div className="postSearchResult">Searching posts...</div>
      );
   } else if (postSearchResults.length === 0) {
      postSearchResultElements = (
         <div className="postSearchResult">No posts found</div>
      );
   }

   return (
      <form
         className="richTextArea"
         onSubmit={async e => {
            e.preventDefault();
            postText();
         }}
      >
         <StyledWrapper>
            <textarea
               type="textarea"
               id={id}
               className="richTextInput"
               value={text}
               onChange={e => {
                  textRef.current = e.target.value;
                  setText(e.target.value);
               }}
               onKeyDown={e => handleKeyDown(e)}
               onKeyUp={e => handleKeyUp(e)}
               onBlur={e => {
                  closeResults();
               }}
               onMouseUp={e => {
                  if (e.button === 1) {
                     window.setTimeout(
                        () =>
                           window.addEventListener(
                              'mouseup',
                              secondMiddleClickListener
                           ),
                        1
                     );
                     window.setTimeout(
                        () =>
                           window.removeEventListener(
                              'mouseup',
                              secondMiddleClickListener
                           ),
                        500
                     );
                  }
               }}
               placeholder={placeholder}
            />
            <div className="postSearchTooltip" style={{ display: 'none' }}>
               {postSearchResultElements}
            </div>
         </StyledWrapper>
         <div className="postButtonWrapper">
            <div className="styleGuideLink">
               See our{' '}
               <a
                  href={`${home}/styling`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  Styling Cheat Sheet
               </a>{' '}
               for all the things you can do in that box.
            </div>
            <button type="submit" className="post">
               {buttonText}
            </button>
         </div>
      </form>
   );
};

export default RichTextArea;
