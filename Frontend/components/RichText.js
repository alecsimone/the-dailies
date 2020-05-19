import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import ExplodingLink from './ExplodingLink';
import {
   replaceTwitterMentions,
   replaceEmails,
   replaceReddit,
   decodeHTML,
   styleTagSearchString
} from '../lib/TextHandling';
import { urlFinder } from '../lib/UrlHandling';

const RichText = ({ text, priorText, nextText, matchCount = 0 }) => {
   if (text[0] === '\n' && text[1] === '\n') {
      // If the text starts with two new lines, we can drop one of them. We do want to keep the new line if there's only one though
      text = text.substring(1);
   }
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
            const splitTag = tag.groups.styleObjectRaw.split(/[:;]/gi);
            const styleObject = {};
            splitTag.forEach((tagPiece, index) => {
               if (index % 2 === 1) {
                  // Actually we only want to do this once for each pair
                  return;
               }
               // We're making an object with the first items in each pair as its properties and the second as their values
               styleObject[splitTag[index].trim()] = splitTag[index + 1].trim();
            });

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
               <span style={{ fontSize: smallHead, fontWeight: '700' }}>
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

               // We're dealing with the textContent, which doesn't include the angle bracket part of the "> closing tag, so we have to tack it back on again so the later quote will match.
               const endingQuoteText = `${allQuotes.substring(
                  firstClosingIndex + 2
               )}>`;
               // + 2 because we need to include both the " and the > for the next rich text to recognize this as a blockquote.
               elementsArray.push(
                  <RichText
                     text={endingQuoteText}
                     key={endingQuoteText}
                     matchCount={matchCount + 1}
                  />
               );
            } else {
               elementsArray.push(
                  <blockquote>
                     <RichText
                        text={tag.groups.quoteTextContent}
                        key={tag.groups.quoteTextContent}
                        matchCount={matchCount + 1}
                     />
                  </blockquote>
               );
            }
         }

         stoppedAtIndex = match.index + tag.index + tag[0].length;

         const endingText = fixedText.substring(stoppedAtIndex);
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
