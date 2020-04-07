import gql from 'graphql-tag';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';
import Router from 'next/router';
import { setAlpha } from '../../styles/functions';
import { GET_TWEETS_FOR_LIST } from './TwitterReader';
import { filterTweets } from './Tweets';
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

const StyledTwitterSidebar = styled.div`
   padding: 0 2rem;
   h5 {
      font-size: ${props => props.theme.bigText};
      position: relative;
      margin: 1rem 0;
      a.twitterName {
         color: ${props => props.theme.secondaryAccent};
      }
   }
   .listLink {
      padding: 0.6rem 1rem;
      border-radius: 3px;
      line-height: 1;
      &.selected,
      &:hover {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      }
      &.loading {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
      }
      cursor: pointer;
      span {
         color: ${props => props.theme.lowContrastGrey};
         margin-left: 0.5rem;
         font-weight: 300;
      }
   }
   .updateLists {
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      margin: 2rem 0 1rem;
      ${props => props.theme.mobileBreakpoint} {
         margin: 2rem 0 0 0;
      }
      display: flex;
      align-items: center;
      svg {
         margin-left: 1rem;
         width: ${props => props.theme.smallText};
         opacity: 0.75;
         ${props => props.theme.mobileBreakpoint} {
            opacity: 0.25;
         }
         cursor: pointer;
         transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
         &:hover {
            opacity: 0.6;
         }
         &.loading {
            ${props => props.theme.spinBackward};
         }
      }
   }
`;

const ListElement = React.memo(
   ({ listID, active, data, memberInfo, getTweetsForList }) => {
      const thisListsTweets = JSON.parse(data.tweets);
      console.log('filtering tweets for sidebar');
      const filteredTweets = filterTweets(
         thisListsTweets,
         memberInfo.twitterSeenIDs
      );
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
            <a>{data.name}</a>
            <span>
               {data.user === memberInfo.twitterUserName
                  ? ''
                  : `(@${data.user}) `}
               ({filteredTweets.length})
            </span>
         </div>
      );
   },
   (prevProps, nextProps) => {
      if (prevProps.active !== nextProps.active) return false;
      return true;
   }
);

const TwitterSidebar = ({
   myTwitterInfo,
   activeList,
   setActiveList,
   setActiveTweets
}) => {
   const { loading, error, data } = useQuery(GET_TWITTER_LISTS, { ssr: false });

   // To update seen tweets whenever we change lists (in case we saw some tweets on another device in the meantime), this is the query that needs to get seenIDs added to it
   const [
      getTweetsForList,
      { data: newListData, client: listTweetsClient }
   ] = useLazyQuery(GET_TWEETS_FOR_LIST, {
      ssr: false,
      fetchPolicy: 'network-only',
      onCompleted: () => {
         console.log('changing lists!');
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

   let listElements;
   if (data && myTwitterInfo) {
      const listData = JSON.parse(data.getTwitterLists.message);
      const dirtyListIDs = Object.keys(listData);
      const listIDs = dirtyListIDs.filter(
         listID => listID !== 'lastUpdateTime'
      );

      listElements = listIDs.map(listID => {
         if (listID === 'lastUpdateTime') {
            return;
         }
         return (
            <ListElement
               listID={listID}
               active={activeList === listID}
               data={listData[listID]}
               memberInfo={myTwitterInfo.me}
               getTweetsForList={getTweetsForList}
            />
         );
      });
      listElements.unshift(
         <h5 key="twiterUsername">
            Welcome, @
            <a
               className="twitterName"
               href={`https://twitter.com/${myTwitterInfo.me.twitterUserName}`}
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
   }

   return (
      <StyledTwitterSidebar className="twitterSidebar">
         {listElements}
      </StyledTwitterSidebar>
   );
};
export default TwitterSidebar;
