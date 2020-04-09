import React from 'react';
import Router from 'next/router';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { filterTweets, GET_TWEETS_FOR_LIST } from './TwitterReader';

const ListElement = React.memo(
   ({
      listID,
      active,
      activeTweetCount,
      memberInfo,
      setActiveList,
      setActiveTweets
   }) => {
      const { loading, error, data } = useQuery(GET_TWEETS_FOR_LIST, {
         ssr: false,
         variables: {
            listID
         }
      });

      // To update seen tweets whenever we change lists (in case we saw some tweets on another device in the meantime), this is the query that needs to get seenIDs added to it
      const [
         getTweetsForList,
         { data: newListData, client: listTweetsClient }
      ] = useLazyQuery(GET_TWEETS_FOR_LIST, {
         ssr: false,
         fetchPolicy: 'network-only',
         onCompleted: () => {
            changeLists(newListData);
         }
      });

      const changeLists = newTweetsData => {
         const { listID, listName, listTweets } = JSON.parse(
            newTweetsData.getTweetsForList.message
         );

         setActiveTweets(JSON.parse(listTweets));

         const href = `/twitter?listname=${listName}`;
         const as = href;
         Router.replace(href, as, { shallow: true });
         setActiveList(listID);
      };

      const thisList = JSON.parse(memberInfo.twitterListsObject)[listID];

      let tweetCount;
      if (data) {
         if (active) {
            tweetCount = `(${activeTweetCount})`;
         } else {
            const message = JSON.parse(data?.getTweetsForList.message);
            const thisListsTweets = JSON.parse(message.listTweets);
            console.log('filtering tweets for sidebar');
            const filteredTweets = filterTweets(
               thisListsTweets,
               memberInfo.twitterSeenIDs
            );
            tweetCount = `(${filteredTweets.length})`;
         }
      } else if (loading) {
         tweetCount = '(...)';
      }

      return (
         <div
            className={`listLink ${listID}${active ? ' selected' : ''}`}
            key={listID}
            onClick={() => {
               const el = document.querySelector(`.${CSS.escape(listID)}`);
               el.classList.add('loading');
               getTweetsForList({ variables: { listID } });
            }}
         >
            <a>{thisList.name}</a>
            <span>
               {thisList.user === memberInfo.twitterUserName
                  ? ''
                  : `(@${thisList.user}) `}
               {tweetCount}
            </span>
         </div>
      );
   },
   (prevProps, nextProps) => {
      if (
         prevProps.active &&
         prevProps.activeTweetCount !== nextProps.activeTweetCount
      ) {
         return false;
      }
      if (prevProps.active || nextProps.active) return false;
      return true;
   }
);

export default ListElement;
