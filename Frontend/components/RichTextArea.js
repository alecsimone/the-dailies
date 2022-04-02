import styled, { ThemeContext } from 'styled-components';
import { useState, useRef, useContext, useEffect } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import debounce from 'lodash.debounce';
import { dynamicallyResizeElement, setAlpha } from '../styles/functions';
import { SEARCH_QUERY } from './SearchResults';
import { home } from '../config';
import {
   getCursorXY,
   keepCaretAboveStickyButtons,
   autoCloseBracketLink,
   wrapTextWithTag,
   linkifyText,
   addSummaryTagsToText,
   encloseSelectedText,
   useSearchResultsSelector,
   tabTheText,
   unTabTheText,
   insertLineAbove
} from '../lib/RichTextHandling';
import LinkIcon from './Icons/Link';
import { ModalContext } from './ModalProvider';
import SaveOrDiscardContentInterface from './SaveOrDiscardContentInterface';

const StyledWrapper = styled.div`
   width: 100%;
   max-width: 900px;
   .stylingButtonsPlaceholder,
   .stylingButtonsBar {
      width: 100%;
   }
   .stylingButtonsPlaceholder {
      position: relative;
      height: 0px;
   }
   .stylingButtonsBar {
      display: flex;
      justify-content: space-between;
      background: ${props => props.theme.midBlack};
      z-index: 2;
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
         &.link {
            display: flex;
            justify-content: center;
            align-items: center;
            svg {
               height: ${props => props.theme.smallText};
               width: auto;
               opacity: 0.8;
            }
         }
         &.imageToText {
            font-family: serif;
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

const debouncedUnsavedChangesHandler = debounce(
   (handler, e) => handler(e),
   3000,
   {
      leading: true,
      trailing: true
   }
);

const RichTextArea = ({
   text,
   postText,
   setEditable,
   rawUpdateText,
   placeholder,
   buttonText,
   hideStyleGuideLink,
   hideButton,
   id,
   inputRef,
   unsavedChangesHandler,
   unsavedContent,
   alwaysShowExtras = true,
   clearUnsavedContentPieceChanges,
   setUnsavedNewContent
}) => {
   const originalText = useRef(text); // We use this to check if there have been any changes to the text, because if there haven't been, we don't need to ask for confirmation before cancelling editing.

   const [showingExtras, setShowingExtras] = useState(alwaysShowExtras);

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

   const { setContent } = useContext(ModalContext);

   const secondMiddleOrRightClickListener = e => {
      if (inputRef.current == null || setEditable == null) return;
      if (e.button === 1 || e.button === 2) {
         if (originalText.current !== inputRef.current.value) {
            setContent(
               <SaveOrDiscardContentInterface
                  postContent={rawUpdateText}
                  clearUnsavedContentPieceChanges={
                     clearUnsavedContentPieceChanges
                  }
                  setUnsavedNewContent={setUnsavedNewContent}
                  setEditable={setEditable}
                  editable
               />
            );
         } else {
            setEditable(false);
         }
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
      const thisInput = inputRef.current;
      if (thisInput == null) return;

      // First we get the text that's currently in our input and figure out where our cursor is in that text
      const { value: currentText, selectionStart: selectionPoint } = thisInput;

      // A search is triggered by a double open square brackets, so we need to find the most recent one of those to figure out where our search starts
      const mostRecentDoubleOpenBracketsIndex = currentText.lastIndexOf(
         '[[',
         selectionPoint - 1
      );

      // And we'll also look for closing double square brackets
      const nextClosingBracketsIndex = currentText.indexOf(
         ']]',
         mostRecentDoubleOpenBracketsIndex
      );
      // And for any other double open square brackets between here and there
      const textBetweenBrackets = currentText.substring(
         mostRecentDoubleOpenBracketsIndex + 2,
         nextClosingBracketsIndex
      );
      const interruptingDoubleOpenBracketsIndex = textBetweenBrackets.indexOf(
         '[['
      );

      // Then we're going to find the first space that comes after the character before our cursor (ie, the first space after our cursor or one character before it)
      const nextSpaceIndex = currentText.indexOf(' ', selectionPoint - 1);

      // Then we'll figure out where to end our search string
      let terminationPoint;
      if (
         nextClosingBracketsIndex !== -1 &&
         interruptingDoubleOpenBracketsIndex === -1
      ) {
         // If we have closing brackets with no other open brackets between here and there, the closing brackets are the termination point
         terminationPoint = nextClosingBracketsIndex;
      } else if (nextSpaceIndex !== -1) {
         // Otherwise, if we have a space after our cursor or one character before it, we terminate there
         terminationPoint = nextSpaceIndex;
      } else {
         // If we don't have either of those, we close at the end of the text
         terminationPoint = currentText.length;
      }

      const previousText = currentText.substring(
         0,
         mostRecentDoubleOpenBracketsIndex
      );
      const afterText = currentText.substring(terminationPoint);

      const selectedTitle =
         searchResultsRef?.current[highlightedIndexRef.current]?.title;
      const selectedID =
         searchResultsRef?.current[highlightedIndexRef.current]?.id;

      const newText = `${previousText}[${selectedTitle}](${selectedID})${afterText}`;

      inputRef.current.value = newText;

      const newCursorPos =
         mostRecentDoubleOpenBracketsIndex +
         selectedTitle.length +
         selectedID.length +
         4;

      thisInput.setSelectionRange(newCursorPos, newCursorPos);

      closeResults();
      window.setTimeout(() => {
         dynamicallyResizeElement(inputRef.current);
      }, 1);
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
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
         postText();
         return;
      }

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
         e.preventDefault();
         insertLineAbove(e.target);
      }

      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
         if (rawUpdateText == null) return;
         e.preventDefault();
         rawUpdateText();
      }

      // Quit editing on escape
      if (e.key === 'Escape' && setEditable) {
         if (originalText.current !== inputRef.current.value) {
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
         inputRef.current.value[e.target.selectionStart - 1] === ']' &&
         e.target.selectionStart === e.target.selectionEnd
      ) {
         autoCloseBracketLink(e);
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
         encloseSelectedText(e);
         return;
      }

      // ctrl+b adds tags for bold text
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e.target, '**');
         return;
      }

      // ctrl+i adds tags for italicized text
      if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e.target, '//');
         return;
      }

      // ctrl+u adds tags for underlined text
      if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e.target, '__');
         return;
      }

      if ((e.key === '3' || e.key === '#') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e.target, '##');
         return;
      }

      // ctrl+' adds tags for block quote
      if ((e.key === "'" || e.key === '"') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         wrapTextWithTag(e.target, '<"');
         return;
      }

      // ctrl+k adds bracket link
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         linkifyText(e.target);
         return;
      }

      // ctrl + > adds summary tags
      if ((e.key === '.' || e.key === '>') && (e.ctrlKey || e.metaKey)) {
         e.preventDefault();
         addSummaryTagsToText(e.target);
         return;
      }

      if (e.key === 'Tab' && !e.shiftKey) {
         e.preventDefault();
         tabTheText(e.target);
         return;
      }

      if (e.key === 'Tab' && e.shiftKey) {
         e.preventDefault();
         unTabTheText(e.target);
      }
   };

   const handleKeyUp = async e => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab') return;

      // First we get the text that's currently in our input and figure out where our cursor is in that text
      const input = e.target;
      const { value: currentText, selectionStart: selectionPoint } = input;

      // Then we're going to find the most recent double open square brackets before our cursor
      const mostRecentBracketsIndex = currentText.lastIndexOf(
         '[[',
         selectionPoint - 1
      );

      // If there's no double brackets, nevermind
      if (mostRecentBracketsIndex < 0) return;

      // And we'll also look for closing double square brackets
      const nextClosingBracketsIndex = currentText.indexOf(
         ']]',
         mostRecentBracketsIndex
      );

      // If those closing brackets come before our cursor, we're not in a search anymore, so let's close the results if they're open and then return
      if (
         nextClosingBracketsIndex !== -1 &&
         nextClosingBracketsIndex < selectionPoint
      ) {
         closeResults();
         return;
      }

      // And for any other double open square brackets between here and there
      const textBetweenBrackets = currentText.substring(
         mostRecentBracketsIndex + 2,
         nextClosingBracketsIndex
      );
      const interruptingDoubleOpenBracketsIndex = textBetweenBrackets.indexOf(
         '[['
      );

      // Then we're going to find the first space that comes after the character before our cursor (ie, the first space after our cursor or one character before it)
      const nextSpaceIndex = currentText.indexOf(' ', selectionPoint - 1);

      // Then we'll figure out where to end our search string
      let terminationPoint;
      if (
         nextClosingBracketsIndex !== -1 &&
         interruptingDoubleOpenBracketsIndex === -1
      ) {
         // If we have closing brackets with no other open brackets between here and there, the closing brackets are the termination point
         terminationPoint = nextClosingBracketsIndex;
      } else if (nextSpaceIndex !== -1) {
         // Otherwise, if we have a space after our cursor or one character before it, we terminate there
         terminationPoint = nextSpaceIndex;
      } else {
         // If we don't have either of those, we close at the end of the text
         terminationPoint = currentText.length;
      }

      // We'll get our search term by taking the characters between the double open square brackets and our termination point
      const searchTerm = currentText.substring(
         mostRecentBracketsIndex + 2,
         terminationPoint
      );

      // And if the search term is an empty string, we're not ready yet
      if (searchTerm === '') return;

      // Then we'll do a search for that string
      const searchResults = search({
         variables: {
            string: searchTerm,
            isTitleOnly: true
         }
      });

      const parent = input.closest('form');
      const toolTip = parent.querySelector('.postSearchTooltip');

      if (toolTip.style.display === 'none') {
         // If the search results are not displaying, we should display them. First we have to find where on the page (as opposed to within the text box) the cursor is
         const cursorXY = getCursorXY(input, mostRecentBracketsIndex);

         const inputStyle = window.getComputedStyle(input);
         const inputLineHeight = inputStyle.getPropertyValue('line-height');

         let left;
         if (window.innerWidth < mobileBPWidthRaw) {
            // If we're on mobile, the search results should take up the whole width of the screen
            left = 0;
         } else if (window.innerWidth - 500 < cursorXY.x) {
            // If the cursor is less than 500px from the right edge of the screen, we'll make the left edge 500px from the right edge of the screen
            left = window.innerWidth - 500;
         } else {
            // Otherwise we'll put the left edge where the cursor is
            left = cursorXY.x;
         }

         // Then we'll turn on the search results display, which we'll put one line below the cursor, aligned as we decided it should be in the previous step
         toolTip.setAttribute(
            'style',
            `display: block; top: calc(${
               cursorXY.y
            }px + ${inputLineHeight}); left: ${left}px`
         );

         // And finally, we'll start the listner that allows us to navigate the search results
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
         onFocus={() => setShowingExtras(true)}
      >
         <StyledWrapper>
            {showingExtras && <div className="stylingButtonsPlaceholder" />}
            {showingExtras && (
               <div className="stylingButtonsBar">
                  <button
                     type="button"
                     className="stylingButton bold"
                     title="Bold"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '**');
                        inputRef.current.focus();
                     }}
                  >
                     B
                  </button>
                  <button
                     type="button"
                     className="stylingButton italic"
                     title="Italics"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '//');
                        inputRef.current.focus();
                     }}
                  >
                     I
                  </button>
                  <button
                     type="button"
                     className="stylingButton underline"
                     title="Underline"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '__');
                        inputRef.current.focus();
                     }}
                  >
                     U
                  </button>
                  <button
                     type="button"
                     className="stylingButton header"
                     title="Header"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '##');
                        inputRef.current.focus();
                     }}
                  >
                     #
                  </button>
                  <button
                     type="button"
                     className="stylingButton summary"
                     title="Summary"
                     onClick={e => {
                        e.preventDefault();
                        addSummaryTagsToText(inputRef.current);
                        inputRef.current.focus();
                     }}
                  >
                     {'><'}
                  </button>
                  <button
                     type="button"
                     className="stylingButton blockQuote"
                     title="Blockquote"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '<"');
                        inputRef.current.focus();
                     }}
                  >
                     "
                  </button>
                  <button
                     type="button"
                     className="stylingButton link"
                     title="Link"
                     onClick={e => {
                        e.preventDefault();
                        linkifyText(inputRef.current);
                        inputRef.current.focus();
                     }}
                  >
                     <LinkIcon />
                  </button>
                  <button
                     type="button"
                     className="stylingButton imageToText"
                     title="Image to Text"
                     onClick={e => {
                        e.preventDefault();
                        wrapTextWithTag(inputRef.current, '<text>');
                        inputRef.current.focus();
                     }}
                  >
                     T
                  </button>
               </div>
            )}
            <textarea
               type="textarea"
               id={id}
               ref={inputRef}
               className="richTextInput"
               onChange={e => {
                  dynamicallyResizeElement(inputRef.current);
                  keepCaretAboveStickyButtons(inputRef.current);
                  if (unsavedChangesHandler != null) {
                     debouncedUnsavedChangesHandler(unsavedChangesHandler, e);
                  }
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
                  if (
                     e.button === 0 &&
                     (e.ctrlKey || e.metaKey) &&
                     setEditable != null
                  ) {
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
               defaultValue={unsavedContent == null ? text : unsavedContent}
            />
            <div className="postSearchTooltip" style={{ display: 'none' }}>
               {postSearchResultElements}
            </div>
         </StyledWrapper>
         <div className="postButtonWrapper">
            {hideStyleGuideLink !== true && showingExtras && (
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
            {hideButton !== true && showingExtras && (
               <button type="submit" className="post">
                  {buttonText}
               </button>
            )}
         </div>
      </form>
   );
};

export default RichTextArea;
