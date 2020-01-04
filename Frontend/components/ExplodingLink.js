import { TwitterTweetEmbed } from 'react-twitter-embed';
import {
   getYoutubeVideoIdFromLink,
   getGfycatSlugFromLink,
   getTweetIDFromLink
} from '../lib/UrlHandling';

const ExplodingLink = props => {
   const { url, keyString } = props;
   const lowerCaseURL = url.toLowerCase();

   // Images
   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.gif')
   ) {
      return (
         <a href={url} target="_blank" key={keyString}>
            <img src={url} />
         </a>
      );
   }

   // Videos
   if (lowerCaseURL.includes('.mp4') || lowerCaseURL.includes('.webm')) {
      return <video src={url} key={keyString} controls />;
   }

   // GfyCat
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

   // YouTube
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

   // Tweets
   if (
      lowerCaseURL.includes('twitter.com/') &&
      lowerCaseURL.includes('/status/')
   ) {
      const tweetID = getTweetIDFromLink(url);
      return (
         <TwitterTweetEmbed tweetId={tweetID} options={{ theme: 'dark' }} />
      );
   }

   // General Links
   return (
      <a href={url} target="_blank" key={keyString}>
         {url}
      </a>
   );
};

export default ExplodingLink;
