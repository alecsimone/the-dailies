import styled, { ThemeContext } from 'styled-components';
import { useState, useRef, useContext, useEffect } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { dynamicallyResizeElement, setAlpha } from '../styles/functions';
import { SEARCH_QUERY } from './SearchResults';
import { home } from '../config';
import {
   getCursorXY,
   autoCloseBracketLink,
   wrapTextWithTag,
   linkifyText,
   addSummaryTagsToText,
   encloseSelectedText,
   useSearchResultsSelector
} from '../lib/RichTextHandling';

const StyledWrapper = styled.div`
   width: 100%;
   max-width: 900px;
   .stylingButtonsBar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      button.stylingButton {
         flex-grow: 1;
         margin: 0 0.5rem;
         font-weight: 300;
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         &.bold {
            font-weight: 700;
         }
         &.italic {
            font-style: italic;
         }
         &.underline {
            text-decoration: underline;
         }
         &.header {
            font-weight: bold;
            color: white;
         }
         &:first-of-type {
            margin: 0 0.5rem 0 0;
         }
         &:last-of-type {
            margin: 0 0 0 0.5rem;
         }
      }
   }
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

const RichTextArea = ({
   text,
   postText,
   setEditable,
   placeholder,
   buttonText,
   hideStyleGuideLink,
   hideButton,
   id,
   inputRef
}) => {
   const originalText = useRef(text); // We use this to check if there have been any changes to the text, because if there haven't been, we don't need to ask for confirmation before cancelling editing.

   const textRef = useRef(text);

   const { mobileBPWidthRaw } = useContext(ThemeContext);

   const {
      postSearchResults,
      setPostSearchResults,
      highlightedIndex,
      setHighlightedIndex,
      searchResultsRef,
      highlightedIndexRef,
      resetResultsSelector
   } = useSearchResultsSelector();

   useEffect(() => {
      dynamicallyResizeElement(inputRef.current);
   }, [inputRef]);

   const secondMiddleOrRightClickListener = e => {
      if (e.button === 1 || e.button === 2) {
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
      resetResultsSelector();

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

      inputRef.current.value = newText;
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
         autoCloseBracketLink(
            e,
            textRef,
            newText => (inputRef.current.value = newText)
         );
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
         e.target.selectionStart !== e.target.selectionEnd &&
         !(e.ctrlKey || e.metaKey)
      ) {
         encloseSelectedText(
            e,
            textRef,
            newText => (inputRef.current.value = newText)
         );
         return;
      }

      // ctrl+b adds tags for bold text
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(
            e.target,
            '**',
            newText => (inputRef.current.value = newText)
         );
      }

      // ctrl+i adds tags for italicized text
      if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(
            e.target,
            '//',
            newText => (inputRef.current.value = newText)
         );
      }

      // ctrl+u adds tags for underlined text
      if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(
            e.target,
            '__',
            newText => (inputRef.current.value = newText)
         );
      }

      if ((e.key === '3' || e.key === '#') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(
            e.target,
            '##',
            newText => (inputRef.current.value = newText)
         );
      }

      // ctrl+' adds tags for block quote
      if ((e.key === "'" || e.key === '"') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(
            e.target,
            '<"',
            newText => (inputRef.current.value = newText)
         );
      }

      // ctrl+k adds bracket link
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         linkifyText(e.target, newText => (inputRef.current.value = newText));
      }

      // ctrl + > adds summary tags
      if ((e.key === '.' || e.key === '>') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         addSummaryTagsToText(
            e.target,
            newText => (inputRef.current.value = newText)
         );
      }
   };

   const handleKeyUp = async e => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab') return;

      const input = e.target;
      const currentText = input.value;
      const selectionPoint = e.target.selectionStart;
      const mostRecentQuoteIndex = currentText.lastIndexOf(
         '"',
         selectionPoint - 1
      );
      if (mostRecentQuoteIndex < 3) return; // Cant be a search string then, needs more text before the quote

      const previousThreeCharacters = currentText.substring(
         mostRecentQuoteIndex - 3,
         mostRecentQuoteIndex
      );
      const previousFiveCharacters = currentText.substring(
         mostRecentQuoteIndex - 5,
         mostRecentQuoteIndex
      );

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
         console.log('we ded');
         closeResults();
         return;
      }
      console.log('we still alive');

      const searchTerm = currentText.substring(
         mostRecentQuoteIndex + 1,
         selectionPoint
      );

      const searchResults = search({
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
            <div className="stylingButtonsBar">
               <button
                  type="button"
                  className="stylingButton bold"
                  onMouseDown={e => {
                     e.preventDefault();
                     wrapTextWithTag(
                        inputRef.current,
                        '**',
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  B
               </button>
               <button
                  type="button"
                  className="stylingButton italic"
                  onMouseDown={e => {
                     e.preventDefault();
                     wrapTextWithTag(
                        inputRef.current,
                        '//',
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  I
               </button>
               <button
                  type="button"
                  className="stylingButton underline"
                  onMouseDown={e => {
                     e.preventDefault();
                     wrapTextWithTag(
                        inputRef.current,
                        '__',
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  U
               </button>
               <button
                  type="button"
                  className="stylingButton header"
                  onMouseDown={e => {
                     e.preventDefault();
                     wrapTextWithTag(
                        inputRef.current,
                        '##',
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  #
               </button>
               <button
                  type="button"
                  className="stylingButton summary"
                  onMouseDown={e => {
                     e.preventDefault();
                     addSummaryTagsToText(
                        inputRef.current,
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  {'><'}
               </button>
               <button
                  type="button"
                  className="stylingButton blockQuote"
                  onMouseDown={e => {
                     e.preventDefault();
                     wrapTextWithTag(
                        inputRef.current,
                        '<"',
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  "
               </button>
               <button
                  type="button"
                  className="stylingButton link"
                  onMouseDown={e => {
                     e.preventDefault();
                     linkifyText(
                        inputRef.current,
                        newText => (inputRef.current.value = newText)
                     );
                     inputRef.current.focus();
                  }}
               >
                  link
               </button>
            </div>
            <textarea
               type="textarea"
               id={id}
               ref={inputRef}
               className="richTextInput"
               onChange={e => {
                  textRef.current = e.target.value;
                  dynamicallyResizeElement(inputRef.current);
               }}
               onKeyDown={e => handleKeyDown(e)}
               onKeyUp={e => handleKeyUp(e)}
               onFocus={() => {
                  dynamicallyResizeElement(inputRef.current);
               }}
               onBlur={e => {
                  closeResults();
               }}
               onMouseUp={e => {
                  if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
                     window.setTimeout(() => {
                        setEditable(false);
                     }, 1);
                     return;
                  }

                  if (e.button === 1 || e.button === 2) {
                     window.setTimeout(
                        () =>
                           window.addEventListener(
                              'mouseup',
                              secondMiddleOrRightClickListener
                           ),
                        1
                     );
                     window.setTimeout(
                        () =>
                           window.removeEventListener(
                              'mouseup',
                              secondMiddleOrRightClickListener
                           ),
                        500
                     );
                  }
               }}
               placeholder={placeholder}
               defaultValue={text}
            />
            <div className="postSearchTooltip" style={{ display: 'none' }}>
               {postSearchResultElements}
            </div>
         </StyledWrapper>
         <div className="postButtonWrapper">
            {hideStyleGuideLink !== true && (
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
            )}
            {hideButton !== true && (
               <button type="submit" className="post">
                  {buttonText}
               </button>
            )}
         </div>
      </form>
   );
};

export default RichTextArea;
