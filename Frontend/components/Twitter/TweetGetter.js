import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import ErrorMessage from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import Tweet from './Tweet';

const GET_TWEET = gql`
   query GET_TWEET($tweetID: String!) {
      getTweet(tweetID: $tweetID) {
         message
      }
   }
`;

const TweetGetter = props => {
   const { id, nested = true } = props;
   const { loading, error, data } = useQuery(GET_TWEET, {
      variables: {
         tweetID: id
      }
   });
   if (loading) {
      return <LoadingRing />;
   }
   if (error) {
      return <ErrorMessage error={error} />;
   }
   const tweet = JSON.parse(data.getTweet.message);
   if (tweet.errors) {
      return <ErrorMessage error={{ message: tweet.errors[0].message }} />;
   }
   return (
      <div className="quoteTweetContainer" key={tweet.id_str}>
         <h5>
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
            :
         </h5>
         <Tweet tweet={tweet} key={tweet.id_str} nested={nested} />
      </div>
   );
};
TweetGetter.propTypes = {
   id: PropTypes.string.isRequired
};

export default TweetGetter;
