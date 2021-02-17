import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import TweetGetter from './TweetGetter';
import RichText from '../RichText';
import TimeAgo from '../TimeAgo';
import { home } from '../../config';
import HeartIcon from '../Icons/Heart';
import RetweetIcon from '../Icons/Retweet';
import { ModalContext } from '../ModalProvider';

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
   ) {
      saveTweet(tweetURL: $tweetURL, tweeter: $tweeter, tweetText: $tweetText) {
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
            (quotedTweetLink.expanded !== urlObject.expanded_url &&
               !urlObject.expanded_url.includes(quotedTweetLink.expanded))
         ) {
            text = text.replace(
               urlObject.url,
               `\u200B${urlObject.expanded_url}\u200B`
            );
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
      /#(\w{2,})/gim,
      (wholeText, hashtag, matchIndex) => {
         const newText = `https://twitter.com/hashtag/${hashtag}\u200b`;
         if (text[matchIndex - 1] !== ' ') {
            return `\u200B${newText}`;
         }
         return newText;
      }
   );
   return newText;
};

const replyRemover = (text, displayTextRange) =>
   text.substring(displayTextRange[0]);

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
         quoted_status_id_str: quotedTweetID,
         display_text_range
      },
      nested,
      previousTweet,
      nextTweetReplyTarget
   } = props;

   const [liked, setLiked] = useState(
      favorited || (retweetedTweet != null && retweetedTweet.favorited)
   );
   const [likeTweet] = useMutation(LIKE_TWEET, {
      onError: err => alert(err.message)
   });
   const [saveTweet] = useMutation(SAVE_TWEET, {
      onError: err => alert(err.message)
   });

   const { setHeartPosition, setFullHeart } = useContext(ModalContext);

   useEffect(() => {
      if (process.browser) {
         const thisTweet = document.querySelector(`.getter${id}`);
         if (thisTweet != null) {
            const parentContentPiece = thisTweet.closest('.contentPiece');
            if (parentContentPiece != null) {
               parentContentPiece.style.whiteSpace = 'normal';
            }
         }
      }
   }, [id]);

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
   const replyRemovedText = replyRemover(fullText, display_text_range);
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
                     rel="noopener noreferrer"
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
   const quotedTweetContainer = [];
   if (quotedTweet != null) {
      quotedTweetContainer.push(
         <div className="quoteTweetContainer" key={quotedTweet.id_str}>
            <h5 className="tweetHead">
               <img
                  src={quotedTweet.user.profile_image_url_https}
                  className="quotedTweeterAvatar"
               />
               <a
                  href={`https://twitter.com/${quotedTweet.user.screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  @{quotedTweet.user.screen_name}
               </a>
            </h5>
            <Tweet tweet={quotedTweet} nested />
         </div>
      );
   } else if (quotedTweetID) {
      quotedTweetContainer.push(
         <TweetGetter id={quotedTweetID} key={quotedTweetID} />
      );
   }
   if (retweetedTweet != null) {
      // Check if the previousTweet (from props) is the tweet this tweet is replying to
      const rtDirectReply =
         previousTweet != null
            ? previousTweet === retweetedTweet.in_reply_to_status_id_str
            : false;
      // Check if the nextTweetReplyTarget (from props) is this tweet. That is, if this tweet is the tweet the next one is replying to
      const rtDirectlyRepliedTo =
         nextTweetReplyTarget != null
            ? nextTweetReplyTarget === retweetedTweet.id_str
            : false;
      let rtThreadStarter = false;
      if (!rtDirectReply && rtDirectlyRepliedTo) {
         rtThreadStarter = true;
      }
      let rtThreadEnder = false;
      if (rtDirectReply && !rtDirectlyRepliedTo) {
         rtThreadEnder = true;
      }

      // If it's part of a thread but not the starter, we don't show the header
      if ((rtDirectReply || rtDirectlyRepliedTo) && !rtThreadStarter) {
         return (
            <Tweet
               tweet={retweetedTweet}
               previousTweet={previousTweet}
               nextTweetReplyTarget={nextTweetReplyTarget}
            />
         );
      }

      return (
         <div
            className={`tweet retweet${
               rtThreadStarter ? ' threaded threadStarter' : ''
            }`}
         >
            <div className="retweeter tweetHead">
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
            <Tweet
               tweet={retweetedTweet}
               previousTweet={previousTweet}
               nextTweetReplyTarget={nextTweetReplyTarget}
            />
         </div>
      );
   }

   const linkout = `https://twitter.com/${user.screen_name}/status/${id}`;

   // Check if the previousTweet (from props) is the tweet this tweet is replying to
   const directReply =
      previousTweet != null ? previousTweet === replyToID : false;
   // Check if the nextTweetReplyTarget (from props) is this tweet. That is, if this tweet is the tweet the next one is replying to
   const directlyRepliedTo =
      nextTweetReplyTarget != null ? nextTweetReplyTarget === id : false;
   let threadStarter = false;
   if (!directReply && directlyRepliedTo) {
      threadStarter = true;
   }
   let threadEnder = false;
   if (directReply && !directlyRepliedTo) {
      threadEnder = true;
   }

   const doubleClickListener = e => {
      console.log('we got to the doubleClickListener');
      console.log(e);
      if (e.button === 0) {
         e.preventDefault();

         setHeartPosition([e.clientX, e.clientY]);
         setFullHeart(!liked);

         likeTweetHandler();
      }
   };

   return (
      <div
         className={`tweet${
            directReply || directlyRepliedTo ? ' threaded' : ''
         }${threadStarter ? ' threadStarter' : ''}${
            threadEnder ? ' threadEnder' : ''
         }`}
         onClick={e => {
            console.log('you clicked');
            console.log(e);
            e.stopPropagation();
            if (e.button === 0) {
               console.log('and you clicked correctly too');
               window.addEventListener('mousedown', doubleClickListener);

               window.setTimeout(
                  () =>
                     window.removeEventListener(
                        'mousedown',
                        doubleClickListener
                     ),
                  500
               );
            }
         }}
      >
         {replyToID && !directReply && (
            <div className="repliedToTweet">
               {nested ? (
                  <a
                     href={`https://twitter.com/blank/status/${replyToID}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="threadLink"
                  >
                     See thread
                  </a>
               ) : (
                  <TweetGetter id={replyToID} />
               )}
            </div>
         )}
         {tcoReplacedText != null && tcoReplacedText !== '' && (
            <p>
               <RichText text={tcoReplacedText} />
            </p>
         )}
         {quotedTweetContainer.length > 0 && quotedTweetContainer}
         {entities.length > 1 && <div className="entities">{entities}</div>}
         {entities.length === 1 && entities}
         <div className="tweetMeta">
            <div>
               <a
                  href={linkout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linkToOriginalTweet"
               >
                  <TimeAgo time={time} />
               </a>{' '}
               •{' '}
               <a
                  onClick={async () => {
                     const variables = {
                        tweetURL: linkout,
                        tweeter: user.screen_name,
                        tweetText: replyRemovedText
                     };
                     const newThingData = await saveTweet({
                        variables
                     }).catch(err => {
                        alert(err.message);
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
               <span
                  className="favoriteCount"
                  onClick={() => {
                     likeTweetHandler();
                  }}
               >
                  {likes}
                  <HeartIcon
                     className={liked ? 'on' : 'off'}
                     onClick={() => {
                        likeTweetHandler();
                     }}
                  />
               </span>
               {retweets}
               <RetweetIcon />
            </div>
         </div>
      </div>
   );
};
Tweet.propTypes = {
   tweet: PropTypes.shape({
      user: PropTypes.shape({
         name: PropTypes.string.isRequired,
         screen_name: PropTypes.string.isRequired
      }).isRequired,
      full_text: PropTypes.string.isRequired,
      entities: PropTypes.shape({
         urls: PropTypes.array
      }),
      extended_entities: PropTypes.shape({
         media: PropTypes.array
      }),
      id_str: PropTypes.string.isRequired,
      in_reply_to_status_id_str: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      favorite_count: PropTypes.number.isRequired,
      favorited: PropTypes.bool,
      retweeted_status: PropTypes.shape({
         favorited: PropTypes.bool.isRequired,
         id_str: PropTypes.string.isRequired,
         user: PropTypes.shape({
            screen_name: PropTypes.string.isRequired,
            profile_image_url_https: PropTypes.string.isRequired
         }).isRequired
      }),
      retweet_count: PropTypes.number.isRequired,
      quoted_status: PropTypes.shape({
         id_str: PropTypes.string.isRequired,
         user: PropTypes.shape({
            screen_name: PropTypes.string.isRequired,
            profile_image_url_https: PropTypes.string.isRequired
         }).isRequired
      }),
      quoted_status_permalink: PropTypes.object,
      quoted_status_id_str: PropTypes.string,
      display_text_range: PropTypes.array.isRequired
   }),
   nested: PropTypes.bool,
   previousTweet: PropTypes.string,
   nextTweetReplyTarget: PropTypes.string
};

// export default Tweet;
export default React.memo(Tweet, (prevProps, nextProps) => {
   if (prevProps.tweet.id_str === nextProps.tweet.id_str) {
      return true;
   }
   return false;
});
