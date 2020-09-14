import Head from 'next/head';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import TwitterSidebar from './TwitterSidebar';
import Tweets from './Tweets';
import SidebarHeaderIcon from '../Icons/SidebarHeaderIcon';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import X from '../Icons/X';
import { setAlpha } from '../../styles/functions';

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

const StyledTwitterReader = styled.section`
   position: relative;
   display: flex;
   height: 100%;
   .content {
      width: 80%;
      flex-grow: 1;
      position: relative;
   }
   .sidebar {
      display: none;
      background: ${props => props.theme.midBlack};
      height: calc(
         100% - 13.5rem - 4px
      ); /* 6.75rem + 2px is the height of the header and bottom bar */
      top: calc(6.75rem + 2px);
      width: 100%;
      right: 0;
      text-align: center;
      width: 100%;
      position: fixed;
      &.visible {
         display: block;
         svg.sidebarCloseIcon {
            height: ${props => props.theme.smallHead};
            margin: 2rem auto 0;
            opacity: 0.8;
            cursor: pointer;
         }
         svg.twitterLogo {
            display: none;
         }
      }
      ${props => props.theme.desktopBreakpoint} {
         display: block;
         position: relative;
         height: 100%;
         width: 20%;
         top: 0;
         right: 0;
         padding: 0rem 0;
         border-left: 3px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         svg.twitterLogo {
            height: ${props => props.theme.bigText};
            margin: 2rem auto 0;
            path {
               fill: ${props => props.theme.majorColor};
            }
         }
         svg.sidebarCloseIcon {
            display: none;
         }
      }
      .twitterSidebar {
         text-align: left;
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
      variables: startingListVariables,
      ssr: false,
      fetchPolicy: 'network-only'
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
      ssr: false,
      onCompleted: updateLists,
      fetchPolicy: 'network-only'
   });

   const [showingListsSidebar, setShowingListsSidebar] = useState(false);

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
            showingListsSidebar={showingListsSidebar}
            setShowingListsSidebar={setShowingListsSidebar}
         />
      );
   }

   return (
      <StyledTwitterReader>
         <Head>
            <title>Twitter Reader - OurDailies</title>
         </Head>
         <div className="content">{content}</div>
         <div
            className={
               showingListsSidebar ? 'sidebar visible' : 'sidebar hidden'
            }
         >
            <SidebarHeaderIcon icon="tweets" className="twitterLogo" />
            <X
               className="sidebarCloseIcon"
               onClick={() => setShowingListsSidebar(false)}
            />
            <TwitterSidebar
               myTwitterInfo={myTwitterInfo}
               activeList={activeList}
               activeTweetCount={activeTweets.length}
               setActiveList={setActiveList}
               setActiveTweets={setActiveTweets}
               fetchFreshLists={fetchFreshLists}
               setShowingListsSidebar={setShowingListsSidebar}
            />
         </div>
      </StyledTwitterReader>
   );
};
TwitterReader.propTypes = {
   list: PropTypes.string
};

export default TwitterReader;
