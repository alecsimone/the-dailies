import PropTypes from 'prop-types';
import { urlFinder, isExplodingLink } from '../lib/UrlHandling';
import ExplodingLink from './ExplodingLink';
import StylishText from './StylishText';

const processLinksInText = (rawText, keyString = 0) => {
   rawText = rawText.replace(
      /@(\w+)/g,
      (wholeMatch, username) => `https://www.twitter.com/${username}`
   );
   rawText = rawText.replace(
      /^(?!\/)[-A-Z0-9\.]*\.(com|org|net|tv|gg|us|uk|co\.uk|edu|gov|mil|biz|info|moby|ly|tech|xyz|ca|cn|fr|au|in|de|jp|ru|br|es|se|ch|nl)[\/]*[.]*/gi,
      wholeMatch => `https://${wholeMatch}`
   );
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
      const urlPosition = rawText.indexOf(url);
      const startingText = rawText.substring(0, urlPosition);
      const endingText = rawText.substring(urlPosition + url.length);
      const link = (
         <ExplodingLink url={url} key={keyString} keyString={keyString} />
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
         const urlPosition = rawText.indexOf(url, stoppedAtIndex);
         const startingText = rawText.substring(stoppedAtIndex, urlPosition);
         if (startingText !== '' && startingText !== '') {
            elementsArray.push(
               <StylishText text={startingText} key={startingText} />
            );
         }

         const link = (
            <ExplodingLink url={url} keyString={urlNumber} key={urlNumber} />
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
      processLinksInText(graph, index)
   );

   return paragraphElements;
};
LinkyText.propTypes = {
   text: PropTypes.string.isRequired
};

export default LinkyText;
