import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useEffect } from 'react';
import ErrorMessage from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import Tweet from './Tweet';
import { getTweetIDFromLink } from '../../lib/UrlHandling';

const GET_TWEET = gql`
   query GET_TWEET($tweetID: String!) {
      getTweet(tweetID: $tweetID) {
         message
      }
   }
`;

const TweetGetter = props => {
   const { id, nested = true, priorText, nextText } = props;
   const { loading, error, data } = useQuery(GET_TWEET, {
      variables: {
         tweetID: id
      },
      ssr: false
   });

   const tweetCheck = new RegExp(
      /https:\/\/twitter.com\/[\w]+\/status\/[\S]+/,
      'gim'
   );

   let nextTweetID;
   if (nextText != null) {
      const nextTextTweetCheck = nextText.toLowerCase().match(tweetCheck);
      if (nextTextTweetCheck && nextTextTweetCheck.length > 0) {
         const [nextTweetUrl] = nextTextTweetCheck;
         nextTweetID = getTweetIDFromLink(nextTweetUrl);
      }
   }

   const {
      loading: nextTweetLoading,
      error: nextTweetError,
      data: nextTweetData
   } = useQuery(GET_TWEET, {
      variables: {
         tweetID: nextTweetID
      },
      skip: !nextTweetID
   });

   if (loading || nextTweetLoading) {
      return <LoadingRing />;
   }
   if (error || nextTweetError) {
      return <ErrorMessage error={error || nextTweetError} />;
   }
   const tweet = JSON.parse(data.getTweet.message);
   if (tweet.errors) {
      return <ErrorMessage error={{ message: tweet.errors[0].message }} />;
   }

   let nextTweetReplyTarget;
   if (nextTweetData) {
      const nextTweet = JSON.parse(nextTweetData.getTweet.message);
      if (nextTweet.errors) {
         return (
            <ErrorMessage error={{ message: nextTweet.errors[0].message }} />
         );
      }

      nextTweetReplyTarget = nextTweet.in_reply_to_status_id_str;
   }

   let previousTweetID;
   if (priorText != null) {
      const priorTextTweetCheck = priorText.toLowerCase().match(tweetCheck);
      if (priorTextTweetCheck && priorTextTweetCheck.length > 0) {
         const [previousTweetUrl] = priorTextTweetCheck;
         previousTweetID = getTweetIDFromLink(previousTweetUrl);
      }
   }

   // Check if the previousTweet (from props) is the tweet this tweet is replying to
   const directReply =
      previousTweetID != null
         ? previousTweetID === tweet.in_reply_to_status_id_str
         : false;
   // Check if the nextTweetReplyTarget (from props) is this tweet. That is, if this tweet is the tweet the next one is replying to
   const directlyRepliedTo =
      nextTweetReplyTarget != null
         ? nextTweetReplyTarget === tweet.id_str
         : false;
   let threadStarter = false;
   if (!directReply && directlyRepliedTo) {
      threadStarter = true;
   }
   let threadEnder = false;
   if (directReply && !directlyRepliedTo) {
      threadEnder = true;
   }

   // If it's part of a thread but not the starter, we don't show the header
   if ((directReply || directlyRepliedTo) && !threadStarter) {
      return (
         <Tweet
            tweet={tweet}
            previousTweet={previousTweetID}
            nextTweetReplyTarget={nextTweetReplyTarget}
         />
      );
   }

   return (
      <div
         className={threadStarter ? `tweet threadStarter getter${id}` : 'tweet'}
         style={{ padding: 0, border: 'none' }}
      >
         <div className="quoteTweetContainer" key={tweet.id_str}>
            <h5 className="tweetHead">
               <img
                  src={tweet.user.profile_image_url_https}
                  className="quotedTweeterAvatar"
                  alt="quoted tweeter avatar"
               />
               <a
                  href={`https://twitter.com/${tweet.user.screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  @{tweet.user.screen_name}
               </a>
            </h5>
            <Tweet
               tweet={tweet}
               key={tweet.id_str}
               nested={nested}
               previousTweet={previousTweetID}
               nextTweetReplyTarget={nextTweetReplyTarget}
            />
         </div>
      </div>
   );
};
TweetGetter.propTypes = {
   id: PropTypes.string.isRequired,
   nested: PropTypes.bool,
   priorText: PropTypes.string,
   nextText: PropTypes.string
};

export default TweetGetter;
