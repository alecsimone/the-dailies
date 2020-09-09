import PropTypes from 'prop-types';
import React from 'react';
import Router from 'next/router';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { filterTweets, GET_TWEETS_FOR_LIST } from './TwitterReader';

const ListElement = ({
   listID,
   active,
   activeTweetCount,
   memberInfo,
   setActiveList,
   setActiveTweets
}) => {
   const { loading, error, data } = useQuery(GET_TWEETS_FOR_LIST, {
      variables: {
         listID
      },
      ssr: false
   });

   const [getTweetsForList, { data: newListData }] = useLazyQuery(
      GET_TWEETS_FOR_LIST,
      {
         ssr: false,
         fetchPolicy: 'network-only',
         onCompleted: () => {
            changeLists(newListData);
         }
      }
   );

   const changeLists = newTweetsData => {
      const { listName, listTweets, seenIDs: newSeenIDs } = JSON.parse(
         newTweetsData.getTweetsForList.message
      );

      const href = `/twitter?listname=${listName}`;
      const as = href;
      Router.replace(href, as, { shallow: true });

      setActiveTweets(filterTweets(JSON.parse(listTweets), newSeenIDs));

      setActiveList(listID);
      const refreshIcon = document.querySelector(`.listRefresher`);
      if (refreshIcon != null) {
         refreshIcon.classList.remove('loading');
      }
   };

   const thisList = JSON.parse(memberInfo.twitterListsObject)[listID];

   let tweetCount;
   if (error) {
      // Retry?
   }
   if (data) {
      if (active) {
         tweetCount = `(${activeTweetCount})`;
      } else {
         const message = JSON.parse(data.getTweetsForList.message);
         const thisListsTweets = JSON.parse(message.listTweets);
         const filteredTweets = filterTweets(thisListsTweets, message.seenIDs);
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

            const refreshIcon = document.querySelector(`.listRefresher`);
            if (refreshIcon != null) {
               refreshIcon.classList.add('loading');
            }

            getTweetsForList({ variables: { listID } });
         }}
      >
         <a>{thisList.name}</a>
         <span>
            {thisList.user === memberInfo.twitterUserName
               ? ''
               : `(@${thisList.user}) `}
            {tweetCount}
         </span>{' '}
      </div>
   );
};

ListElement.propTypes = {
   listID: PropTypes.string.isRequired,
   active: PropTypes.bool.isRequired,
   activeTweetCount: PropTypes.number,
   memberInfo: PropTypes.shape({
      twitterListsObject: PropTypes.string,
      twitterSeenIDs: PropTypes.array,
      twitterUserName: PropTypes.string
   }),
   setActiveList: PropTypes.func.isRequired,
   setActiveTweets: PropTypes.func.isRequired
};

export default React.memo(ListElement, (prevProps, nextProps) => {
   if (prevProps.active || nextProps.active) return false;
   return true;
});
