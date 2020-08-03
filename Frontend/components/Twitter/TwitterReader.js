import Head from 'next/head';
import gql from 'graphql-tag';
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../../styles/StyledPageWithSidebar';
import Sidebar from '../Sidebar';
import TwitterSidebar from './TwitterSidebar';
import Tweets from './Tweets';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';

const GET_MY_TWITTER_INFO = gql`
   query GET_MY_TWITTER_INFO {
      me {
         __typename
         id
         twitterUserName
         twitterUserID
         twitterSeenIDs
         twitterListsObject
      }
   }
`;

const GET_TWEETS_FOR_LIST = gql`
   query GET_TWEETS_FOR_LIST($listID: String) {
      getTweetsForList(listID: $listID) {
         message
      }
   }
`;
export { GET_TWEETS_FOR_LIST };

const GET_FRESH_LISTS = gql`
   query GET_FRESH_LISTS {
      refreshLists {
         message
      }
   }
`;

const MARK_TWEETS_SEEN = gql`
   mutation MARK_TWEETS_SEEN(
      $listID: String!
      $tweetIDs: [String]!
      $lastTweeter: Boolean
   ) {
      markTweetsSeen(
         listID: $listID
         tweetIDs: $tweetIDs
         lastTweeter: $lastTweeter
      ) {
         __typename
         id
         twitterListsObject
      }
   }
`;

const filterTweets = (tweets, seenIDs) => {
   if (!Array.isArray(tweets) || seenIDs == null) {
      return tweets;
   }
   const filteredTweets = tweets.filter(
      tweet => !seenIDs.includes(tweet.id_str)
   );
   return filteredTweets;
};
export { filterTweets };

const TwitterReader = ({ list }) => {
   const [activeList, setActiveList] = useState(false);
   const [activeTweets, setActiveTweets] = useState(false);

   const {
      loading: myInfoLoading,
      error: myInfoError,
      data: myTwitterInfo
   } = useQuery(GET_MY_TWITTER_INFO);

   // If they didn't ask for a list in the url, which would've been passed down through the list prop, a blank get_tweets_for_list will return their default list.
   const startingListVariables = {};
   if (list != null) {
      startingListVariables.listID = list;
   }
   const { loading, error, data } = useQuery(GET_TWEETS_FOR_LIST, {
      variables: startingListVariables
      // ssr: false
   });

   const [markTweetsSeen] = useMutation(MARK_TWEETS_SEEN);

   const updateLists = () => {
      const el = document.querySelector('svg.refreshLists');
      el.classList.remove('loading');
      const cachedData = client.writeQuery({
         query: GET_FRESH_LISTS,
         data: {
            __typename: 'query',
            getTwitterLists: {
               __typename: 'SuccessMessage',
               message: freshLists.refreshLists.message
            }
         }
      });
   };
   const [
      fetchFreshLists,
      {
         loading: freshListsLoading,
         error: freshListsError,
         data: freshLists,
         client
      }
   ] = useLazyQuery(GET_FRESH_LISTS, {
      // ssr: false,
      onCompleted: updateLists,
      fetchPolicy: 'network-only'
   });

   let content;
   if (loading || myInfoLoading) {
      content = <LoadingRing />;
   }

   if (error) {
      content = <ErrorMessage error={error} />;
   }
   if (myInfoError) {
      content = <ErrorMessage error={myInfoError} />;
   }

   if (data && myTwitterInfo) {
      const { listTweets: tweets, listID, seenIDs: newSeenIDs } = JSON.parse(
         data.getTweetsForList.message
      );
      if (!activeList) {
         setActiveList(listID);
      }
      if (!activeTweets) {
         setActiveTweets(filterTweets(JSON.parse(tweets), newSeenIDs));
      }

      content = (
         <Tweets
            tweets={activeTweets}
            listID={activeList}
            seenIDs={newSeenIDs}
            markTweetsSeen={markTweetsSeen}
            myTwitterInfo={myTwitterInfo.me}
            setActiveTweets={setActiveTweets}
         />
      );
   }

   return (
      <StyledPageWithSidebar>
         <Head>
            <title>Twitter Reader - OurDailies</title>
         </Head>
         <Sidebar
            extraColumnTitle="Tweets"
            extraColumnContent={
               <TwitterSidebar
                  myTwitterInfo={myTwitterInfo}
                  activeList={activeList}
                  activeTweetCount={activeTweets.length}
                  setActiveList={setActiveList}
                  setActiveTweets={setActiveTweets}
                  fetchFreshLists={fetchFreshLists}
               />
            }
         />
         <div className="mainSection">{content}</div>
      </StyledPageWithSidebar>
   );
};
TwitterReader.propTypes = {
   list: PropTypes.string
};

export default TwitterReader;
