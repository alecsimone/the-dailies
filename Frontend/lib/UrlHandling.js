import { TwitterTweetEmbed } from 'react-twitter-embed';

const processLinksInText = text => {
   const urls = text.match(urlFinder);
   if (urls == null) {
      return text;
   }
   if (urls.length === 1) {
      const url = urls[0];
      const urlPosition = text.indexOf(url);
      const startingText = text.substring(0, urlPosition);
      const endingText = text.substring(urlPosition + url.length);
      const link = makeLinkorMedia(url);
      return (
         <div>
            {startingText}
            {link}
            {endingText}
         </div>
      );
   }
   if (urls.length > 1) {
      const elementsArray = [];
      let stoppedAtIndex = 0;
      urls.forEach((url, urlNumber) => {
         const urlPosition = text.indexOf(url, stoppedAtIndex);
         const startingText = text.substring(stoppedAtIndex, urlPosition);
         elementsArray.push(startingText);

         const link = makeLinkorMedia(url, urlNumber);
         elementsArray.push(link);

         stoppedAtIndex = urlPosition + url.length;

         if (urlNumber === urls.length - 1) {
            const endingText = text.substring(stoppedAtIndex);
            elementsArray.push(endingText);
         }
      });
      return <p>{elementsArray}</p>;
   }
   return text;
};

export { processLinksInText };

const makeLinkorMedia = (url, key = 'link') => {
   const lowerCaseURL = url.toLowerCase();
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.gif')
   ) {
      return (
         <a href={url} target="_blank" key={key}>
            <img src={url} />
         </a>
      );
   }
   if (lowerCaseURL.includes('.mp4') || lowerCaseURL.includes('.webm')) {
      return <video src={url} key={key} controls />;
   }
   if (lowerCaseURL.includes('gfycat.com/')) {
      const slug = getGfycatSlugFromLink(url);
      return (
         <div className="embed-container">
            <iframe
               src={`https://gfycat.com/ifr/${slug}?autoplay=0&hd=1`}
               frameBorder="0"
               scrolling="no"
               allowFullScreen
            />
         </div>
      );
   }
   if (
      lowerCaseURL.includes('youtube.com/watch?v=') ||
      lowerCaseURL.includes('youtu.be/')
   ) {
      const slug = getYoutubeVideoIdFromLink(url);
      return (
         <div className="embed-container">
            <iframe
               src={`https://www.youtube.com/embed/${slug}?autoplay=0&loop=1&playlist=${slug}`}
               frameBorder="0"
               scrolling="no"
               allowFullScreen
            />
         </div>
      );
   }
   if (
      lowerCaseURL.includes('twitter.com/') &&
      lowerCaseURL.includes('/status/')
   ) {
      const tweetID = getTweetIDFromLink(url);
      return (
         <TwitterTweetEmbed tweetId={tweetID} options={{ theme: 'dark' }} />
      );
   }
   return (
      <a href={url} target="_blank" key={key}>
         {url}
      </a>
   );
};

const getYoutubeVideoIdFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   if (lowerCaseURL.includes('youtube.com/watch?v=')) {
      const idStartPos = url.indexOf('youtube.com/watch?v=') + 20;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   if (lowerCaseURL.includes('youtu.be')) {
      const idStartPos = url.indexOf('youtu.be/') + 9;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   return false;
};

const getGfycatSlugFromLink = url => {
   let gfyCode;
   if (url.indexOf('/detail/') > -1) {
      const gfyCodePosition = url.indexOf('/detail/') + 8;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   } else {
      const gfyCodePosition = url.indexOf('gfycat.com/') + 11;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('.mp4') > -1) {
         const gfyCodeEndPosition = url.indexOf('.mp4');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('-') > -1) {
         const gfyCodeEndPosition = url.indexOf('-');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   }
   return gfyCode;
};

const getTweetIDFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   const statusPos = url.indexOf('/status/') + 8;
   const parametersPos = url.indexOf('?', statusPos);
   if (parametersPos > -1) {
      return url.substring(statusPos, parametersPos);
   }
   return url.substring(statusPos);
};

const urlFinder = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
export { urlFinder };
