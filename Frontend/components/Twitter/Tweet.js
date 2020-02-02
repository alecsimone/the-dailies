import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useState } from 'react';
import PropTypes from 'prop-types';
import TweetGetter from './TweetGetter';
import LinkyText from '../LinkyText';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { home } from '../../config';

const LIKE_TWEET = gql`
   mutation LIKE_TWEET($tweetID: String!, $alreadyLiked: String!) {
      likeTweet(tweetID: $tweetID, alreadyLiked: $alreadyLiked) {
         message
      }
   }
`;

const SAVE_TWEET = gql`
   mutation SAVE_TWEET(
      $tweetURL: String!
      $tweeter: String!
      $tweetText: String
      $featuredImage: String
   ) {
      saveTweet(
         tweetURL: $tweetURL
         tweeter: $tweeter
         tweetText: $tweetText
         featuredImage: $featuredImage
      ) {
         __typename
         id
      }
   }
`;

const tcoReplacer = (text, entities, quotedTweetLink) => {
   if (entities.urls.length > 0) {
      entities.urls.forEach(urlObject => {
         if (
            quotedTweetLink == null ||
            quotedTweetLink.expanded !== urlObject.expanded_url
         ) {
            text = text.replace(urlObject.url, urlObject.expanded_url);
         }
      });
   }
   const newText = text.replace(
      /https:\/\/t.co\/[-A-Z0-9+&@#\/%=~_|$?!:,.]*/gim,
      ''
   );
   return newText;
};

const hashtagReplacer = text => {
   const newText = text.replace(
      /#(\w+)/gim,
      (wholeText, hashtag) => `https://twitter.com/hashtag/${hashtag}\u200b`
   );
   return newText;
};

const replyRemover = (text, displayTextRange) =>
   text.substring(displayTextRange[0], displayTextRange[1]);

const Tweet = props => {
   const {
      tweet: {
         user,
         full_text: fullText,
         entities: tweetEntities,
         extended_entities: extendedEntities,
         id_str: id,
         in_reply_to_status_id_str: replyToID,
         created_at: time,
         favorite_count: likes,
         favorited,
         retweeted_status: retweetedTweet,
         retweet_count: retweets,
         quoted_status: quotedTweet,
         quoted_status_permalink: quotedTweetLink,
         quoted_status_id_str: quotedTweetID
      },
      nested
   } = props;

   const [liked, setLiked] = useState(
      favorited || (retweetedTweet != null && retweetedTweet.favorited)
   );
   const [likeTweet] = useMutation(LIKE_TWEET);
   const [saveTweet] = useMutation(SAVE_TWEET);

   const likeTweetHandler = () => {
      const tweetID = retweetedTweet ? retweetedTweet.id_str : id;
      const alreadyLiked = liked ? 'true' : 'false';
      likeTweet({
         variables: {
            tweetID,
            alreadyLiked
         }
      });
      setLiked(!liked);
   };

   const replyRemovedText = replyRemover(
      fullText,
      props.tweet.display_text_range
   );
   const hashtagReplacedText = hashtagReplacer(replyRemovedText);
   const tcoReplacedText = tcoReplacer(
      hashtagReplacedText,
      tweetEntities,
      quotedTweetLink
   );

   const entities = [];
   if (tweetEntities) {
      if (extendedEntities && extendedEntities.media) {
         extendedEntities.media.forEach((entity, index) => {
            if (entity.type === 'photo') {
               entities.push(
                  <a
                     href={entity.media_url_https}
                     target="_blank"
                     key={`${entity.id_str}-photo-${index}`}
                  >
                     <img
                        src={entity.media_url_https}
                        className="embeddedPhoto"
                        alt="embedded photo"
                     />
                  </a>
               );
            } else if (
               entity.type === 'video' ||
               entity.type === 'animated_gif'
            ) {
               const mp4s = entity.video_info.variants.filter(
                  variantObject => variantObject.content_type === 'video/mp4'
               );
               mp4s.sort((a, b) => b.bitrate - a.bitrate);
               entities.push(
                  <div
                     className="embeddedVideo"
                     key={`${entity.id_str}-video-${index}`}
                  >
                     <video
                        src={mp4s[0].url}
                        controls
                        loop={entity.type === 'animated_gif'}
                        autoPlay={entity.type === 'animated_gif'}
                     />
                  </div>
               );
            } else {
               entities.push(
                  <div key={`${entity.id_str}-unknownmedia-${index}`}>
                     There's media that's not a photo here
                  </div>
               );
            }
         });
      }
   }
   if (quotedTweet != null) {
      entities.push(
         <div className="quoteTweetContainer" key={quotedTweet.id_str}>
            <h5>
               <img
                  src={quotedTweet.user.profile_image_url_https}
                  className="quotedTweeterAvatar"
               />
               <a
                  href={`https://twitter.com/${quotedTweet.user.screen_name}`}
                  target="_blank"
               >
                  @{quotedTweet.user.screen_name}
               </a>
               :
            </h5>
            <Tweet tweet={quotedTweet} />
         </div>
      );
   } else if (quotedTweetID) {
      entities.push(<TweetGetter id={quotedTweetID} />);
   }
   if (retweetedTweet != null) {
      return (
         <div className="tweet retweet">
            <div className="retweeter">
               <img
                  src={retweetedTweet.user.profile_image_url_https}
                  className="retweetedAvatar"
                  alt="retweetedAvatar"
               />
               <a
                  href={`https://twitter.com/${
                     retweetedTweet.user.screen_name
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retweetLink"
               >
                  @{retweetedTweet.user.screen_name}
               </a>
            </div>
            <Tweet tweet={retweetedTweet} />
         </div>
      );
   }

   const linkout = `https://twitter.com/${user.screen_name}/status/${id}`;

   return (
      <div className="tweet">
         {replyToID && (
            <div className="repliedToTweet">
               {nested ? (
                  <a
                     href={`https://twitter.com/blank/status/${replyToID}`}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     See thread
                  </a>
               ) : (
                  <TweetGetter id={replyToID} />
               )}
            </div>
         )}
         <LinkyText text={tcoReplacedText} />
         {entities.length > 0 && entities}
         <div className="tweetMeta">
            <div>
               <a
                  href={linkout}
                  target="_blank"
                  className="linkToOriginalTweet"
               >
                  {convertISOtoAgo(time)} ago
               </a>{' '}
               •{' '}
               <a
                  onClick={async () => {
                     const variables = {
                        tweetURL: linkout,
                        tweeter: user.screen_name,
                        tweetText: replyRemovedText
                     };
                     if (
                        tweetEntities &&
                        tweetEntities.media &&
                        tweetEntities.media.length > 0
                     ) {
                        variables.featuredImage =
                           tweetEntities.media[0].media_url_https;
                     }
                     const newThingData = await saveTweet({
                        variables
                     });
                     if (process.browser) {
                        window.open(
                           `${home}/thing?id=${newThingData.data.saveTweet.id}`
                        );
                     }
                  }}
               >
                  Save
               </a>
            </div>
            <div className="score">
               {likes}
               <img
                  src={liked ? '/heart-full.png' : '/heart-outline.png'}
                  className={liked ? 'on' : 'off'}
                  onClick={() => {
                     likeTweetHandler();
                  }}
                  alt="favorites"
               />
               {retweets}
               <img src="/rt-icon.png" alt="retweets" />
            </div>
         </div>
      </div>
   );
};
Tweet.propTypes = {
   tweet: PropTypes.shape({
      user: PropTypes.shape({
         name: PropTypes.string.isRequired
      }).isRequired,
      full_text: PropTypes.string.isRequired,
      entities: PropTypes.shape({
         urls: PropTypes.array
      }),
      id_str: PropTypes.string.isRequired,
      in_reply_to_status_id_str: PropTypes.string,
      created_at: PropTypes.string.isRequired
   }),
   nested: PropTypes.bool
};

export default Tweet;
