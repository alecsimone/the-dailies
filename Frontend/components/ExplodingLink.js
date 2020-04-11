import { useContext } from 'react';
import PropTypes from 'prop-types';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { MemberContext } from './Account/MemberProvider';
import CardGenerator from './ThingCards/CardGenerator';
import {
   getYoutubeVideoIdFromLink,
   getGfycatSlugFromLink,
   getTweetIDFromLink
} from '../lib/UrlHandling';
import { homeNoHTTP } from '../config';
import ShortLink from './ThingParts/ShortLink';
import Tweet from './Twitter/Tweet';
import TweetGetter from './Twitter/TweetGetter';
import LoadingRing from './LoadingRing';

const ExplodingLink = ({ url, keyString, alt, className }) => {
   const lowerCaseURL = url.toLowerCase();

   const { me } = useContext(MemberContext);

   // Bracket Links
   const bracketCheck = /\[(?<text>.+)\]\((?<href>.+)\)/gi;
   const bracketMatchCheck = url.match(bracketCheck);
   if (bracketMatchCheck != null && process.browser) {
      const bracketMatch = url.matchAll(bracketCheck);
      for (const match of bracketMatch) {
         return (
            <a href={match.groups.href} target="_blank">
               {match.groups.text}
            </a>
         );
      }
   }

   // Bracket Thing References
   const bracketedThingCheck = /\[[pPtT]:"(?<id>.+)"\]/gi;
   const bracketedThingMatchCheck = url.match(bracketedThingCheck);
   if (bracketedThingMatchCheck != null && process.browser) {
      const bracketedThingMatch = url.matchAll(bracketedThingCheck);
      for (const match of bracketedThingMatch) {
         return (
            <CardGenerator
               key={match.groups.id}
               id={match.groups.id}
               cardType="small"
            />
         );
      }
   }

   if (
      lowerCaseURL.includes('.jpg') ||
      lowerCaseURL.includes('.png') ||
      lowerCaseURL.includes('.jpeg') ||
      lowerCaseURL.includes('.gif')
   ) {
      // Images
      return (
         <a href={url} target="_blank" key={keyString}>
            <img src={url} className={className} alt={alt == null ? '' : alt} />
         </a>
      );
   }

   // Videos
   if (lowerCaseURL.includes('.mp4') || lowerCaseURL.includes('.webm')) {
      return <video src={url} key={keyString} className={className} controls />;
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
               className={className}
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
         <div className="tweet" style={{ padding: 0, border: 'none' }}>
            <TweetGetter id={tweetID} nested={false} />
         </div>
      );
   }

   // Twitter Hashtag
   if (lowerCaseURL.includes('twitter.com/hashtag/')) {
      const hashtagStartPos = lowerCaseURL.indexOf('/hashtag/') + 9;
      const hashtagEndPos = lowerCaseURL.indexOf('?');
      let hashtag;
      if (hashtagEndPos > -1) {
         hashtag = url.substring(hashtagStartPos, hashtagEndPos);
      } else {
         hashtag = url.substring(hashtagStartPos);
      }
      return (
         <a href={url} target="_blank">
            #{hashtag}
         </a>
      );
   }

   // Tweeter
   const tweeterURL = lowerCaseURL.match(/twitter\.com\/[-a-z0-9?=_]+$/gim);
   if (tweeterURL) {
      const userStart = lowerCaseURL.indexOf('twitter.com/') + 12;
      const userEnd = lowerCaseURL.indexOf('?');
      let user;
      if (userEnd > -1) {
         user = url.substring(userStart, userEnd);
      } else {
         user = url.substring(userStart);
      }
      return (
         <a href={url} target="_blank">
            @{user}
         </a>
      );
   }

   // Things on OurDailies
   if (
      lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) &&
      bracketMatchCheck == null
   ) {
      const thingIDPos = lowerCaseURL.indexOf('/thing?id=') + 10;
      let thingID;
      if (lowerCaseURL.includes('&')) {
         const thingIDEnd = lowerCaseURL.indexOf('&');
         thingID = url.substring(thingIDPos, thingIDEnd);
      } else {
         thingID = url.substring(thingIDPos);
      }
      return <CardGenerator key={thingID} id={thingID} cardType="small" />;
   }

   // General Links
   return <ShortLink link={url} limit={80} />;
};
ExplodingLink.propTypes = {
   url: PropTypes.string.isRequired,
   keyString: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   alt: PropTypes.string,
   className: PropTypes.string
};

export default ExplodingLink;
// export default React.memo(ExplodingLink);
