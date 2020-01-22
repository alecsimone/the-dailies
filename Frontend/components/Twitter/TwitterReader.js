import Head from 'next/head';
import gql from 'graphql-tag';
import {
   useQuery,
   useMutation,
   useLazyQuery,
   readQuery,
   writeQuery
} from '@apollo/react-hooks';
import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sidebar from '../Sidebar';
import Tweets, { filterTweets } from './Tweets';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { setAlpha } from '../../styles/functions';
import { convertISOtoAgo } from '../../lib/ThingHandling';

const GET_TWITTER_LISTS = gql`
   query GET_TWITTER_LISTS {
      getTwitterLists {
         message
      }
   }
`;

const GET_MY_TWITTER_INFO = gql`
   query GET_MY_TWITTER_INFO {
      me {
         __typename
         id
         twitterUserName
         twitterUserID
         twitterSeenIDs
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

const GET_FRESH_LISTS = gql`
   query GET_FRESH_LISTS {
      refreshLists {
         message
      }
   }
`;

const StyledTwitterReader = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 25%;
      @media screen and (min-width: 1800px) {
         flex-basis: 20%;
      }
      h5 {
         font-size: ${props => props.theme.bigText};
         position: relative;
         margin: 1rem 0;
         a.twitterName {
            color: ${props => props.theme.secondaryAccent};
         }
      }
      .listLink {
         padding: .6rem 1rem;
         border-radius: 3px;
         line-height: 1;
         &.selected {
            background: ${props =>
               setAlpha(props.theme.lowContrastGrey, 0.25)};;
         }
         &.loading {
            background: ${props => setAlpha(props.theme.majorColor, 0.1)};;
         }
         cursor: pointer;
         }
         span {
            color: ${props => props.theme.lowContrastGrey};
            margin-left: 0.5rem;
            font-weight: 300;
         }
      }
      .updateLists {
         font-size: ${props => props.theme.tinyText};
         color: ${props => props.theme.lowContrastGrey};
         margin-top: 2rem;
         display: flex;
         align-items: center;
         img {
            margin-left: 1rem;
            width: ${props => props.theme.smallText};
            opacity: .25;
            cursor: pointer;
            &:hover {
               opacity: .6;
            }
            &.loading {
               ${props => props.theme.spin};
            }
         }
      }
   }
   .tweetArea {
      flex-basis: 75%;
      @media screen and (min-width: 1800px) {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      overflow: hidden;
      padding: 2rem;
   }
`;

const TwitterReader = props => {
   const { list } = props;

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

   const [activeList, setActiveList] = useState(false);

   const updateLists = () => {
      const el = document.querySelector('img.refreshLists');
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
                  {listData[listID].user.screen_name ===
                  myTwitterInfo.me.twitterUserName
                     ? ''
                     : `(@${listData[listID].user.screen_name}) `}
                  ({filteredTweets.length})
               </span>
            </div>
         );
      });
      listElements.unshift(
         <h5 key="twiiterUsername">
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
            <img
               src="/reset-icon.png"
               className="refreshLists"
               alt="refresh lists"
               onClick={() => {
                  const el = document.querySelector('img.refreshLists');
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
      <StyledTwitterReader>
         <Head>
            <title>Twitter Reader - OurDailies</title>
         </Head>
         <Sidebar extraColumnTitle="Tweets" extraColumnContent={listElements} />
         <div className="tweetArea">{content}</div>
      </StyledTwitterReader>
   );
};
TwitterReader.propTypes = {
   list: PropTypes.string
};

export default TwitterReader;
