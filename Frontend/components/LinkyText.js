import PropTypes from 'prop-types';
import {
   urlFinder,
   isExplodingLink,
   topLevelDomains
} from '../lib/UrlHandling';
import ExplodingLink from './ExplodingLink';
import StylishText from './StylishText';

const replaceTwitterMentions = rawText => {
   const mentionSearchString = new RegExp(
      `@(?:([a-z0-9_]+)(?!\\w*\\.(?:${topLevelDomains})))`,
      'gim'
   );
   return rawText.replace(
      mentionSearchString,
      (wholeMatch, username, matchIndex) => {
         const newText = `https://twitter.com/${username}\u200B`;
         // if (
         //    rawText[matchIndex - 1] === '/' &&
         //    rawText[matchIndex + wholeMatch.length] === '/'
         // ) {
         //    // edge case for medium.com links, which have the @ handles of their creators in them.
         //    return wholeMatch;
         // }
         if (rawText[matchIndex - 1] !== ' ') {
            const finalSpaceBeforeMatch = rawText.lastIndexOf(' ', matchIndex);
            const wordBeforeMatch = rawText.substring(
               finalSpaceBeforeMatch === -1 ? 0 : finalSpaceBeforeMatch,
               matchIndex
            );
            const urls = wordBeforeMatch.match(urlFinder);
            if (urls != null) {
               return wholeMatch;
            }
            return `\u200B${newText}`;
         }
         return newText;
      }
   );
};

const replaceEmails = rawText => {
   const emailSearchString = new RegExp(
      `[\\w.!#$%&'*+-/=?^_\`{|}~]+@\\w+\\.(?:${topLevelDomains})`,
      'gim'
   );
   return rawText.replace(emailSearchString, (email, matchIndex, wholeText) => {
      // JS doesn't support negative lookbehinds in regex, so we have to do it manually in our replace function
      const precedingCharacters = wholeText.substring(
         matchIndex - 7,
         matchIndex
      );
      if (precedingCharacters.toLowerCase() === 'mailto:') {
         return email;
      }
      return `mailto:${email}\u200B`;
   });
};

const replaceReddit = rawText =>
   rawText.replace(
      /\/r\/(\w+)[/-a-z?=]*/gim,
      (wholeMatch, subreddit, matchIndex, wholeText) => {
         const precedingCharacters = wholeText.substring(
            matchIndex - 10,
            matchIndex
         );
         if (precedingCharacters.toLowerCase() === 'reddit.com') {
            return wholeMatch;
         }
         return `https://reddit.com${wholeMatch}`;
      }
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

   if (process.browser) {
      const allURLs = rawText.matchAll(urlFinder);
      for (const thisURL of allURLs) {
         console.log(thisURL);
      }
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
         if (!url.includes('://') && !url.includes('mailto')) {
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
   const paragraphs = text.split('\n');
   const paragraphElements = paragraphs.map((graph, index) =>
      processLinksInText(
         replaceReddit(replaceEmails(replaceTwitterMentions(graph))),
         index
      )
   );

   return paragraphElements;
};
LinkyText.propTypes = {
   text: PropTypes.string.isRequired
};

export default LinkyText;
// export default React.memo(LinkyText);
