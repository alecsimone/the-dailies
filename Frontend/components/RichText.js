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

const RichText = ({ text }) => {
   console.log('--------------------------------');
   console.log(text);
   const { smallHead } = useContext(ThemeContext);

   if (process.browser) {
      text = decodeHTML(text);
   }

   const fixedText = replaceReddit(replaceEmails(replaceTwitterMentions(text)));

   if (
      text == null ||
      typeof text !== 'string' ||
      text === '' ||
      !process.browser
   ) {
      return fixedText;
   }
   const elementsArray = [];
   let matchCount = 0;
   let stoppedAtIndex = 0;
   const superMatcherSource = `${urlFinder.source}|${
      styleTagSearchString.source
   }`;
   const superMatcher = new RegExp(superMatcherSource, 'gim');
   const allMatches = fixedText.matchAll(superMatcher);

   for (const match of allMatches) {
      console.log(match);

      const tags = match[0].matchAll(styleTagSearchString);
      for (const tag of tags) {
         if (tag[0].length !== match[0].length) continue;
         const startingText = fixedText.substring(
            stoppedAtIndex,
            match.index + tag.index
         );
         if (startingText !== '' && startingText !== ' ') {
            elementsArray.push(
               <RichText text={startingText} key={startingText} />
            );
         }

         if (tag.groups.style != null) {
            const splitTag = tag.groups.styleObjectRaw.split(/[:;]/gi);
            const styleObject = {};
            splitTag.forEach((tagPiece, index) => {
               if (index % 2 === 1) {
                  return;
               }
               styleObject[splitTag[index].trim()] = splitTag[index + 1].trim();
            });

            const tagElement = (
               <span style={styleObject} key={stoppedAtIndex}>
                  <RichText
                     text={tag.groups.styleTextContent}
                     key={tag.groups.styleTextContent}
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
                  />
               </span>
            );
         }

         stoppedAtIndex = match.index + tag.index + tag[0].length;

         const endingText = fixedText.substring(stoppedAtIndex);
         if (endingText !== '' && endingText !== ' ') {
            elementsArray.push(<RichText text={endingText} key={endingText} />);
         }
         return elementsArray;
      }

      const urls = match[0].matchAll(urlFinder);
      for (const url of urls) {
         if (url[0].length !== match[0].length) continue;
         let fullUrl = url[0];

         // Quick kludge until I find a way to not match this pattern that happens surprisingly often
         if (fullUrl.toLowerCase() === '...in') continue;

         if (!fullUrl.includes('://') && !fullUrl.includes('mailto')) {
            fullUrl = `https://${fullUrl}`;
         }

         const startingText = fixedText.substring(stoppedAtIndex, match.index);
         if (startingText !== '' && startingText !== ' ') {
            elementsArray.push(
               <RichText text={startingText} key={startingText} />
            );
         }

         const link = (
            <ExplodingLink
               url={fullUrl}
               keyString={matchCount}
               key={matchCount}
            />
         );
         matchCount++;
         elementsArray.push(link);

         stoppedAtIndex = match.index + url[0].length;

         const endingText = fixedText.substring(stoppedAtIndex);
         if (endingText !== '' && endingText !== ' ') {
            elementsArray.push(<RichText text={endingText} key={endingText} />);
         }
         return elementsArray;
      }
   }

   return fixedText;
};

RichText.propTypes = {
   text: PropTypes.string.isRequired
};

export default React.memo(RichText, (prev, next) => {
   if (prev.text !== next.text) {
      return false;
   }
   return true;
});
