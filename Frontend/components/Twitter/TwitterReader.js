import Head from 'next/head';
import gql from 'graphql-tag';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import StyledPageWithSidebar from '../../styles/StyledPageWithSidebar';
import Sidebar from '../Sidebar';
import TwitterSidebar from './TwitterSidebar';
import Tweets, { filterTweets } from './Tweets';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import ResetIcon from '../Icons/Reset';

const GET_TWITTER_LISTS = gql`
   query GET_TWITTER_LISTS {
      getTwitterLists {
         message
      }
   }
`;
export { GET_TWITTER_LISTS };

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
   query GET_TWEETS_FOR_LIST($listID: String!) {
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

const TwitterReader = props => {
   const { list } = props;

   const [activeList, setActiveList] = useState(false);

   const { loading, error, data } = useQuery(GET_TWITTER_LISTS, { ssr: false });
   const {
      loading: myInfoLoading,
      error: myInfoError,
      data: myTwitterInfo
   } = useQuery(GET_MY_TWITTER_INFO);

   const changeLists = newTweetsData => {
      const parsedData = JSON.parse(newTweetsData.getTweetsForList.message);
      const { listID, listTweets } = parsedData;

      const oldData = listTweetsClient.readQuery({
         query: GET_TWITTER_LISTS
      });
      const parsedOldData = JSON.parse(oldData.getTwitterLists.message);
      parsedOldData[listID].tweets = listTweets;
      const reStringedData = JSON.stringify(parsedOldData);

      const cachedData = listTweetsClient.writeQuery({
         query: GET_TWITTER_LISTS,
         data: {
            __typename: 'query',
            getTwitterLists: {
               __typename: 'SuccessMessage',
               message: reStringedData
            }
         }
      });

      const href = `/twitter?listname=${parsedOldData[listID].name}`;
      const as = href;
      Router.replace(href, as, { shallow: true });
      setActiveList(listID);
   };
   const [
      getTweetsForList,
      { data: listTweets, client: listTweetsClient }
   ] = useLazyQuery(GET_TWEETS_FOR_LIST, {
      ssr: false,
      fetchPolicy: 'network-only',
      onCompleted: changeLists
   });

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

   let listElements;
   if (data && myTwitterInfo) {
      const listData = JSON.parse(data.getTwitterLists.message);
      const dirtyListIDs = Object.keys(listData);
      const listIDs = dirtyListIDs.filter(
         listID => listID !== 'lastUpdateTime'
      );

      if (!activeList) {
         if (list != null) {
            const [defaultList] = listIDs.filter(
               listID =>
                  listData[listID].name.toLowerCase() === list.toLowerCase()
            );
            setActiveList(defaultList);
         } else {
            const [seeAllList] = listIDs.filter(
               listID => listData[listID].name.toLowerCase() === 'see all'
            );
            if (seeAllList) {
               setActiveList(seeAllList);
            } else {
               setActiveList('home');
            }
         }
      }

      listElements = listIDs.map(listID => {
         if (listID === 'lastUpdateTime') {
            return;
         }
         const thisListsTweets = JSON.parse(listData[listID].tweets);
         const filteredTweets = filterTweets(
            thisListsTweets,
            myTwitterInfo.me.twitterSeenIDs
         );
         return (
            <div
               className={`listLink ${listID}${
                  activeList === listID ? ' selected' : ''
               }`}
               key={listID}
               onClick={() => {
                  const el = document.querySelector(`.${CSS.escape(listID)}`);
                  el.classList.add('loading');
                  getTweetsForList({ variables: { listID } });
               }}
            >
               <a>{listData[listID].name}</a>
               <span>
                  {listData[listID].user === myTwitterInfo.me.twitterUserName
                     ? ''
                     : `(@${listData[listID].user}) `}
                  ({filteredTweets.length})
               </span>
            </div>
         );
      });
      listElements.unshift(
         <h5 key="twiterUsername">
            Welcome, @
            <a
               className="twitterName"
               href={`https://twitter.com/${props.userName}`}
               target="_blank"
            >
               {myTwitterInfo.me.twitterUserName}
            </a>
         </h5>
      );
      listElements.push(
         <div className="updateLists" key="updateLists">
            Last updated {convertISOtoAgo(listData.lastUpdateTime)} ago
            <ResetIcon
               className="refreshLists"
               onClick={() => {
                  const el = document.querySelector('svg.refreshLists');
                  el.classList.add('loading');
                  fetchFreshLists();
               }}
            />
         </div>
      );

      content = (
         <Tweets list={listData[activeList]} myTwitterInfo={myTwitterInfo.me} />
      );
   }

   return (
      <StyledPageWithSidebar>
         <Head>
            <title>Twitter Reader - OurDailies</title>
         </Head>
         <Sidebar
            extraColumnTitle="Tweets"
            extraColumnContent={<TwitterSidebar listElements={listElements} />}
         />
         <div className="mainSection">{content}</div>
      </StyledPageWithSidebar>
   );
};
TwitterReader.propTypes = {
   list: PropTypes.string
};

export default TwitterReader;
