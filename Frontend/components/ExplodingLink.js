import { useContext } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import CardGenerator from './ThingCards/CardGenerator';
import {
   getThingQueryFromLink,
   getYoutubeVideoIdFromLink,
   getGfycatSlugFromLink,
   getTweetIDFromLink,
   getInstagramIDFromLink,
   urlFinder,
   isImage,
   isVideo
} from '../lib/UrlHandling';
import { home, homeNoHTTP } from '../config';
import ShortLink from './ThingParts/ShortLink';
import Tweet from './Twitter/Tweet';
import TweetGetter from './Twitter/TweetGetter';
import LoadingRing from './LoadingRing';
import RichText from './RichText';
import TikTok from './ThingParts/TikTok';
import LinkCard from './LinkCard';

const bracketCheck = /\[(?<text>.+)\]\((?<href>.+)\)/gi;
export { bracketCheck };

const ExplodingLink = ({
   url,
   keyString,
   alt,
   className,
   priorText,
   nextText,
   showLinkCards,
   hideCardShortlink,
   linkSource,
   wholeCardLink
}) => {
   if (url == null) return null;
   const lowerCaseURL = url.toLowerCase();

   // Bracket Links
   const bracketMatchCheck = url.match(bracketCheck);
   if (bracketMatchCheck != null && process.browser) {
      const bracketMatch = url.matchAll(bracketCheck);
      for (const match of bracketMatch) {
         const cleanText = match.groups.text.trim().toLowerCase();

         if (cleanText.toLowerCase().startsWith('c:')) {
            return (
               <CardGenerator
                  key={match.groups.href}
                  id={match.groups.href}
                  cardType="small"
               />
            );
         }
         if (
            cleanText.toLowerCase().startsWith('p:') ||
            cleanText.toLowerCase().startsWith('t:')
         ) {
            const linkText = match.groups.text.substring(
               3,
               match.groups.text.length - 1
            );
            return (
               <Link
                  href={{
                     pathname: '/thing',
                     query: { id: match.groups.href }
                  }}
               >
                  <a target={target}>
                     <RichText text={linkText} key={match.groups.text} />
                  </a>
               </Link>
            );
         }

         const { href } = match.groups;
         const target = '_blank';
         const linkCheck = href.match(urlFinder);
         if (linkCheck == null) {
            return (
               <Link
                  href={{
                     pathname: '/thing',
                     query: { id: href }
                  }}
               >
                  <a>
                     <RichText
                        text={match.groups.text}
                        key={match.groups.text}
                     />
                  </a>
               </Link>
            );
         }
         if (href.includes(homeNoHTTP)) {
            return (
               <Link
                  href={{
                     pathname: '/thing',
                     query: getThingQueryFromLink(href)
                  }}
               >
                  <a>
                     <RichText
                        text={match.groups.text}
                        key={match.groups.text}
                     />
                  </a>
               </Link>
            );
         }

         return (
            <a href={href} target={target} rel="noopener noreferrer">
               <RichText text={match.groups.text} key={match.groups.text} />
            </a>
         );
      }
   }

   if (isImage(lowerCaseURL)) {
      // Images
      return (
         <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            key={keyString}
         >
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
      // return <div className="test">Does this work?</div>;
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
         <TweetGetter
            id={tweetID}
            nested={false}
            priorText={priorText}
            nextText={nextText}
         />
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
         <a href={url} target="_blank" rel="noopener noreferrer">
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
         <a href={url} target="_blank" rel="noopener noreferrer">
            @{user}
         </a>
      );
   }

   // Things on OurYou
   if (
      lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) &&
      bracketMatchCheck == null
   ) {
      const thingIDPos = lowerCaseURL.indexOf('/thing?id=') + 10;
      const queryStartPos = lowerCaseURL.indexOf('/thing?') + 7;
      let thingID;
      let fullQuery;
      if (lowerCaseURL.includes('&')) {
         const thingIDEnd = lowerCaseURL.indexOf('&');
         thingID = url.substring(thingIDPos, thingIDEnd);
         fullQuery = url.substring(queryStartPos);
      } else {
         thingID = url.substring(thingIDPos);
      }
      return (
         <CardGenerator
            key={thingID}
            id={thingID}
            cardType="small"
            fullQuery={fullQuery}
         />
      );
   }

   // TikTok Links
   if (
      lowerCaseURL.includes('tiktok.com/') &&
      lowerCaseURL.includes('/video/')
   ) {
      return <TikTok url={lowerCaseURL} />;
   }

   // Instagram Links
   if (lowerCaseURL.includes('instagram.com/p/')) {
      const instagramID = getInstagramIDFromLink(url);
      if (instagramID.length <= 12) {
         // For some reason, some instagram posts are not embeddable and also have much longer IDs. So if we get one of those, we'll just render it as a normal link.
         return (
            <div className="embed-container instagram">
               <iframe
                  src={`https://www.instagram.com/p/${instagramID}/embed/captioned`}
                  frameBorder="0"
                  allowFullScreen
               />
            </div>
         );
      }
   }

   // General Links. If they are the end of a line (or alone on that line) they get a LinkCard. Otherwise they're just a ShortLink.
   let zwslessNextText = nextText;
   if (nextText != null) {
      // Sometimes we use zero width spaces to delineate strings, so we'll remove those here to check if there's actually any significant nextText
      zwslessNextText = nextText.replace('\u200b', '');
   }
   if (
      showLinkCards !== false &&
      (nextText == null ||
         zwslessNextText.trim() === '' ||
         zwslessNextText.startsWith('\n'))
   ) {
      return (
         <>
            {!hideCardShortlink && <ShortLink link={url} limit={80} />}
            <LinkCard
               link={url}
               shortlinkHidden={hideCardShortlink}
               storePersonalLink={linkSource === 'ContentPiece'}
               wholeCardLink={wholeCardLink}
            />
         </>
      );
   }
   return <ShortLink link={url} limit={80} />;
};
ExplodingLink.propTypes = {
   url: PropTypes.string.isRequired,
   keyString: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   alt: PropTypes.string,
   className: PropTypes.string,
   priorText: PropTypes.string,
   nextText: PropTypes.string
};

export default ExplodingLink;
// export default React.memo(ExplodingLink);
