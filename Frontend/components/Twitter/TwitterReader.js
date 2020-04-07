import Head from 'next/head';
import gql from 'graphql-tag';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { useState } from 'react';
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

const GET_INITIAL_TWEETS = gql`
   query GET_INITIAL_TWEETS($listName: String) {
      getInitialTweets(listName: $listName) {
         message
      }
   }
`;
export { GET_INITIAL_TWEETS };

const GET_FRESH_LISTS = gql`
   query GET_FRESH_LISTS {
      refreshLists {
         message
      }
   }
`;

const TwitterReader = ({ list }) => {
   const [activeList, setActiveList] = useState(false);
   const [activeTweets, setActiveTweets] = useState(false);

   // So right here, instead of getting all the lists, we want to run a new getInitialList query, and if list != null, we'll pass it along as a variable and the query will fetch that list for us.
   const variables = {};
   if (list != null) {
      variables.listID = list;
   }
   const { loading, error, data } = useQuery(GET_TWEETS_FOR_LIST, {
      variables,
      ssr: false
   });

   const {
      loading: myInfoLoading,
      error: myInfoError,
      data: myTwitterInfo
   } = useQuery(GET_MY_TWITTER_INFO);

   const updateLists = () => {
      const el = document.querySelector('svg.refreshLists');
      el.classList.remove('loading');
      const cachedData = client.writeQuery({
         query: GET_TWITTER_LISTS,
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
      const { listTweets: tweets, listID } = JSON.parse(
         data.getTweetsForList.message
      );
      if (!activeList) {
         setActiveList(listID);
      }
      if (!activeTweets) {
         setActiveTweets(JSON.parse(tweets));
      }

      content = (
         <Tweets
            tweets={activeTweets}
            listID={activeList}
            myTwitterInfo={myTwitterInfo.me}
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
                  setActiveList={setActiveList}
                  setActiveTweets={setActiveTweets}
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
