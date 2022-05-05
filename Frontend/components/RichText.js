import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Prism from 'prismjs';
import ExplodingLink from './ExplodingLink';
import SummarizedText from './SummarizedText';
import {
   replaceTwitterMentions,
   replaceEmails,
   replaceReddit,
   decodeHTML,
   styleTagSearchString,
   getStartingTextElement,
   getStyleTagElement,
   getQuoteTagElement,
   getEndingTextElement,
   getStyledSpan,
   testBrowserForNegativeLookarounds
} from '../lib/TextHandling';
import { urlFinder } from '../lib/UrlHandling';

Prism.languages['custom-js'] = Prism.languages.extend('js', {
   punctuation: /[,.;]+/,
   keyword: /if|else|return|async|await/,
   null: /null/,
   squareBrackets: /[\[\]]+/,
   parens: /[()]/,
   declarations: /const|let|var|alert|confirm/
});

Prism.languages['custom-css'] = Prism.languages.extend('css', {
   number: { pattern: /[0-9]+[.0-9]*/, greedy: true },
   interpolations: {
      pattern: /(\$){.+?}/,
      greedy: true,
      lookbehind: true,
      inside: {
         function: {
            pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
            lookbehind: true
         },
         curlyBraces: /[{}]/,
         parens: /[()]/,
         number: { pattern: /[0-9]+[.0-9]*/, greedy: true },
         props: /props/
      }
   },
   unit: {
      pattern: /([0-9]+)(px|rem|em|%|deg)/,
      lookbehind: true,
      greedy: true
   },
   element: /^([a-z]{2,}|a|p)(?=[ .]*)/gm,
   selector: /[.:]{1}[a-z]{1}[a-zA-Z0-9.\-\_]* /m,
   calc: /calc/,
   parens: /[()]/,
   punctuation: /[;:,]/,
   function: {
      pattern: /(^|[^-a-z0-9])(?!calc)[-a-z0-9]+(?=\()/i,
      lookbehind: true,
      inside: {
         parens: /[()]/
      }
   },
   stringValue: /[ ]+[a-z;\-]+/,
   operator: /[+\-*/$&]/
});

const RichText = ({
   text,
   priorText,
   nextText,
   matchCount = 0,
   showLinkCards,
   textLocation
}) => {
   let fixedText = replaceReddit(replaceEmails(replaceTwitterMentions(text)));

   useEffect(() => Prism.highlightAll());

   if (
      text == null ||
      typeof text !== 'string' ||
      text === '' ||
      !process.browser
   ) {
      return <p>{fixedText}</p>;
   }

   // Replace any html entities that may have found their way into our text with their human readable equivalents
   fixedText = decodeHTML(fixedText);

   const elementsArray = [];
   let stoppedAtIndex = 0;
   let stoppedAtIndexOverride = false;
   let trimEndingText = false;

   // The URL searches have a lot of repetition in them, so they're written with variables and thus need to be constructed from a string, which I don't believe supports using named capture groups.
   // The list search string is useful in a lot of places on its own, so we separate it out so we can use it there.
   // Here, we'll combine them all into one big search string
   const superMatcherSource = `${urlFinder.source}|${
      styleTagSearchString.source
   }`;
   // |${listSearchString.source}
   const superMatcher = new RegExp(superMatcherSource, 'gim');

   // First we do a big matchAll with a giant superstring of all the things we might be looking for.
   const allMatches = fixedText.matchAll(superMatcher);
   for (const match of allMatches) {
      // So now we take just the style tags and use a proper regex search with named capture groups to parse them.
      const tags = match[0].matchAll(styleTagSearchString);
      for (const tag of tags) {
         // But we're only interested in the first match of all matches. It might not be a style tag, and if it isn't we'd be skipping ahead and mixing things up.
         if (tag[0] === match[0]) {
            // First We break off any text before the match and put it in a RichText at the start of our elements array. We have to do this inside each individual for loop because we need the index of the specific match as well.
            const startingTextElement = getStartingTextElement(
               stoppedAtIndex,
               match.index + tag.index,
               fixedText,
               matchCount,
               showLinkCards
            );
            elementsArray.push(startingTextElement);

            // Now we go through each of the style tags and when we get a hit, we make an element that applies that style around a new RichText, and then push that element into our elements array

            // First, the general <style> tag
            if (tag.groups.style != null) {
               const [tagElement, newStoppedAtIndex] = getStyleTagElement(
                  tag,
                  matchCount,
                  stoppedAtIndex,
                  showLinkCards
               );
               elementsArray.push(tagElement);
               if (newStoppedAtIndex != null) {
                  stoppedAtIndexOverride = newStoppedAtIndex;
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

            if (tag.groups.code != null) {
               let inputLang = tag.groups.codelang;
               if (inputLang === 'js') {
                  inputLang = 'custom-js';
               } else if (inputLang === 'css') {
                  inputLang = 'custom-css';
               }
               elementsArray.push(
                  <pre>
                     <code className={`language-${inputLang} line-numbers`}>
                        {tag.groups.codeTextContent.trim()}
                     </code>
                  </pre>
               );
               // trimEndingText = true;
            }

            if (tag.groups.stars != null) {
               const starsElement = getStyledSpan(
                  { fontWeight: 700, color: 'white' },
                  tag.groups.starsTextContent,
                  matchCount,
                  showLinkCards
               );
               elementsArray.push(starsElement);
            }

            if (tag.groups.bars != null) {
               const barsElement = getStyledSpan(
                  { textDecoration: 'underline' },
                  tag.groups.barsTextContent,
                  matchCount,
                  showLinkCards
               );
               elementsArray.push(barsElement);
            }

            if (tag.groups.slashes != null) {
               const slashesElement = getStyledSpan(
                  { fontStyle: 'italic' },
                  tag.groups.slashesTextContent,
                  matchCount,
                  showLinkCards
               );
               elementsArray.push(slashesElement);
            }

            if (tag.groups.pounds != null) {
               const poundsElement = getStyledSpan(
                  { fontSize: '2em', fontWeight: '700' },
                  tag.groups.poundsTextContent,
                  matchCount,
                  showLinkCards
               );
               elementsArray.push(poundsElement);
            }

            if (tag.groups.quote != null) {
               const [quoteElement, newStoppedAtIndex] = getQuoteTagElement(
                  tag,
                  matchCount,
                  showLinkCards
               );
               trimEndingText = true;
               elementsArray.push(quoteElement);
               if (newStoppedAtIndex != null) {
                  stoppedAtIndexOverride = newStoppedAtIndex;
               }
            }

            const endingTextElement = getEndingTextElement(
               stoppedAtIndexOverride
                  ? match.index + stoppedAtIndexOverride
                  : match.index + tag.index + tag[0].length,
               fixedText,
               trimEndingText,
               matchCount,
               showLinkCards
            );
            elementsArray.push(endingTextElement);

            return elementsArray;
         }
      }

      // If it wasn't a style tag, we check if it's some kind of link
      const urls = match[0].matchAll(urlFinder);
      for (const url of urls) {
         // But we're only interested in the first match of all matches. It might not be a link, and if it isn't we'd be skipping ahead and mixing things up.
         if (url[0].trim() === match[0].trim()) {
            // First We break off any text before the match and put it in a RichText at the start of our elements array. We have to do this inside each individual for loop because we need the index of the specific match as well.
            const startingTextElement = getStartingTextElement(
               stoppedAtIndex,
               match.index + url.index,
               fixedText,
               matchCount,
               showLinkCards
            );
            elementsArray.push(startingTextElement);

            let fullUrl = url[0];

            // Quick kludge until I find a cleaner way to not match this pattern that happens surprisingly often
            if (
               fullUrl.substring(fullUrl.length - 5).toLowerCase() !== '...in'
            ) {
               // If there's no protocol and it's not a mailto, slap an https on that baby
               if (!fullUrl.includes('://') && !fullUrl.includes('mailto')) {
                  fullUrl = `https://${fullUrl}`;
               }

               stoppedAtIndex = match.index + url.index + url[0].length;

               const endingText = fixedText.substring(stoppedAtIndex);

               // ExplodingLink will handle presenting the link itself, now that we've stripped out any leading or trailing text
               const link = (
                  <ExplodingLink
                     url={fullUrl}
                     keyString={matchCount}
                     key={matchCount}
                     priorText={priorText}
                     nextText={endingText || nextText}
                     showLinkCards={showLinkCards}
                     linkSource={textLocation}
                  />
               );
               elementsArray.push(link);

               const endingTextElement = getEndingTextElement(
                  stoppedAtIndex,
                  fixedText,
                  trimEndingText,
                  matchCount,
                  showLinkCards
               );
               elementsArray.push(endingTextElement);

               return elementsArray;
            }
            // If we did get a faulty ...in link, we still need to add the ending text and return something, otherwise the text leading up to the ...in link will be added to the elements arary, and then the whole thing will run again, leading to that text being repeated
            // First we have to add in the faulty link as plain text
            elementsArray.push(fullUrl);

            // Then we get our new ending text
            stoppedAtIndex = match.index + url.index + url[0].length;

            const linkSkipEndingText = getEndingTextElement(
               stoppedAtIndex,
               fixedText,
               trimEndingText,
               matchCount,
               showLinkCards
            );
            elementsArray.push(linkSkipEndingText);
            return elementsArray;
         }
      }

      // // If it wasn't a style tag or a URL, we check if it's a list
      // const lists = match[0].matchAll(listSearchString);
      // for (const list of lists) {
      //    // But we're only interested in the first match of all matches. It might not be a list, and if it isn't we'd be skipping ahead and mixing things up.
      //    if (list[0] === match[0]) {
      //       // First We break off any text before the match and put it in a RichText at the start of our elements array. We have to do this inside each individual for loop because we need the index of the specific match as well.
      //       const startingTextElement = getStartingTextElement(
      //          stoppedAtIndex,
      //          match.index + list.index,
      //          fixedText,
      //          matchCount,
      //          showLinkCards
      //       );
      //       elementsArray.push(startingTextElement);

      //       // First we need to get the whole list. So we'll check the line after this to see if it matches as well
      //       const listItem = list[0];
      //       if (!list.groups.ordinal.includes('www.')) {
      //          const [listElement, endingPoint] = getListElement(
      //             listItem,
      //             fixedText,
      //             match
      //          );

      //          elementsArray.push(listElement);

      //          const endingTextElement = getEndingTextElement(
      //             endingPoint,
      //             fixedText,
      //             trimEndingText,
      //             matchCount,
      //             showLinkCards
      //          );
      //          elementsArray.push(endingTextElement);

      //          return elementsArray;
      //       }
      //    }
      // }
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
