import { urlFinder, isExplodingLink } from '../lib/UrlHandling';
import ExplodingLink from './ExplodingLink';

const processLinksInText = (rawText, keyString = 0) => {
   const urls = rawText.match(urlFinder);
   if (urls == null) {
      return <p key={keyString}>{rawText}</p>;
   }
   if (urls.length === 1) {
      const url = urls[0];
      const urlPosition = rawText.indexOf(url);
      const startingText = rawText.substring(0, urlPosition);
      const endingText = rawText.substring(urlPosition + url.length);
      const link = (
         <ExplodingLink url={url} key={keyString} keyString={keyString} />
      );
      const wholeText = [startingText, link, endingText];
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
         elementsArray.push(startingText);

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
            elementsArray.push(endingText);
         }
      });
      if (isExplodingText) {
         return (
            <div className="explodingLinkGraph" key={keyString}>
               {elementsarray}
            </div>
         );
      }
      return <p key={keyString}>{elementsArray}</p>;
   }
   return <p key={keyString}>{rawText}</p>;
};

const LinkyText = props => {
   const { text } = props;

   const paragraphsAndEmptyStrings = text.split('\n');
   const paragraphs = paragraphsAndEmptyStrings.filter(string => string != '');
   const paragraphElements = paragraphs.map((graph, index) =>
      processLinksInText(graph, index)
   );

   return paragraphElements;
};

export default LinkyText;
