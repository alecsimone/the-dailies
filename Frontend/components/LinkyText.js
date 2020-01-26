import PropTypes from 'prop-types';
import { urlFinder, isExplodingLink } from '../lib/UrlHandling';
import ExplodingLink from './ExplodingLink';
import StylishText from './StylishText';

const replaceTwitterMentions = rawText =>
   rawText.replace(
      /@([a-z0-9_]*(?!.*\.com))/gm,
      (wholeMatch, username) => `https://twitter.com/${username}`
   );

const processLinksInText = (rawText, keyString = 0) => {
   const urls = rawText.match(urlFinder);
   if (urls == null) {
      return (
         <p key={keyString}>
            {rawText === '' ? '' : <StylishText text={rawText} key={rawText} />}
         </p>
      );
   }
   if (urls.length === 1) {
      const url = urls[0];
      let fullUrl = url;
      if (!url.includes('://') && !url.includes('mailto')) {
         fullUrl = `https://${url}`;
      }
      const urlPosition = rawText.indexOf(url);
      const startingText = rawText.substring(0, urlPosition);
      const endingText = rawText.substring(urlPosition + url.length);
      const link = (
         <ExplodingLink url={fullUrl} key={keyString} keyString={keyString} />
      );
      const wholeText = [
         startingText === '' ? (
            ''
         ) : (
            <StylishText text={startingText} key={startingText} />
         ),
         link,
         endingText === '' ? (
            ''
         ) : (
            <StylishText text={endingText} key={endingText} />
         )
      ];
      if (isExplodingLink(url)) {
         return (
            <div className="explodingLinkGraph" key={keyString}>
               {wholeText}
            </div>
         );
      }
      return <p key={keyString}>{wholeText}</p>;
   }
   if (urls.length > 1) {
      const elementsArray = [];
      let stoppedAtIndex = 0;
      let isExplodingText = false;
      urls.forEach((url, urlNumber) => {
         let fullUrl = url;
         if (!url.includes('://')) {
            fullUrl = `https://${url}`;
         }
         const urlPosition = rawText.indexOf(url, stoppedAtIndex);
         const startingText = rawText.substring(stoppedAtIndex, urlPosition);
         if (startingText !== '' && startingText !== '') {
            elementsArray.push(
               <StylishText text={startingText} key={startingText} />
            );
         }

         const link = (
            <ExplodingLink
               url={fullUrl}
               keyString={urlNumber}
               key={urlNumber}
            />
         );
         elementsArray.push(link);

         stoppedAtIndex = urlPosition + url.length;
         if (isExplodingLink(url)) {
            isExplodingText = true;
         }

         if (urlNumber === urls.length - 1) {
            const endingText = rawText.substring(stoppedAtIndex);
            if (endingText !== '' && endingText !== ' ') {
               elementsArray.push(
                  <StylishText text={endingText} key={endingText} />
               );
            }
         }
      });
      if (isExplodingText) {
         return (
            <div className="explodingLinkGraph" key={keyString}>
               {elementsArray}
            </div>
         );
      }
      return <p key={keyString}>{elementsArray}</p>;
   }
   return (
      <p key={keyString}>
         {rawText === '' ? '' : <StylishText text={rawText} key={rawText} />}
      </p>
   );
};

const decodeHTML = text => {
   const txt = document.createElement('textarea');
   txt.innerHTML = text;
   return txt.value;
};

const LinkyText = ({ text }) => {
   if (process.browser) {
      text = decodeHTML(text);
   }
   const paragraphsAndEmptyStrings = text.split('\n');
   const paragraphs = paragraphsAndEmptyStrings.filter(string => string != '');
   const paragraphElements = paragraphs.map((graph, index) =>
      processLinksInText(replaceTwitterMentions(graph), index)
   );

   return paragraphElements;
};
LinkyText.propTypes = {
   text: PropTypes.string.isRequired
};

export default LinkyText;
