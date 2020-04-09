import { useLazyQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import Tweet from './Tweet';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import { GET_TWEETS_FOR_LIST } from './TwitterReader';
import X from '../Icons/X';
import ResetIcon from '../Icons/Reset';
import { filterTweets } from './TwitterReader';

const StyledTweets = styled.section`
   position: absolute;
   top: 0;
   left: 0%;
   width: 100%;
   ${props => props.theme.mobileBreakpoint} {
      left: 2%;
      width: 96%;
   }
   padding: 0;
   .tweets {
      .tweeters {
         .remainingCounters {
            width: 100%;
            margin: 0;
            padding: 2rem;
            ${props => props.theme.desktopBreakpoint} {
               margin: 1rem 2rem;
               padding: 0;
            }
            opacity: 0.9;
            font-weight: 200;
         }
         .tweeterColumnsContainer {
            display: flex;
            overflow-x: auto;
            max-width: 100%;
            ${props => props.theme.scroll};
         }
         .tweeterColumn {
            margin: 0;
            ${props => props.theme.desktopBreakpoint} {
               margin: 0 2rem;
            }
            /* background: ${props => setLightness(props.theme.midBlack, 1)}; */
            background: ${props => props.theme.lightBlack};
            border-radius: 3px;
            position: relative;
            width: 100%;
            flex-grow: 1;
            min-width: 45rem;
            max-width: 100rem;
            height: 100%;
            overflow: hidden;
            border: 2px solid ${props => setAlpha(props.theme.midBlack, 0.25)};
            border-radius: 4px;
            box-shadow: 0 6px 6px
               ${props => setAlpha(props.theme.deepBlack, 0.4)};
            &.column1 {
               display: none;
               ${props => props.theme.desktopBreakpoint} {
                  display: block;
               }
            }
            &.column2 {
               display: none;
               ${props => props.theme.bigScreenBreakpoint} {
                  display: block;
               }
            }
            h3.tweeterHeader {
               position: relative;
               top: 0;
               left: 0;
               width: 100%;
               display: flex;
               align-items: center;
               justify-content: space-around;
               margin: 0;
               padding: 1rem 0;
               opacity: 0.9;
               border-bottom: 2px solid
                  ${props => setLightness(props.theme.lowContrastGrey, 15)};
               text-align: center;
               border-radius: 3px 3px 0 0;
               &:hover {
                  opacity: 1;
               }
               .bottom {
                  font-size: ${props => props.theme.tinyText};
                  font-weight: 400;
                  opacity: 0.4;
               }
               a.tweeterNameLink {
                  margin-right: 1rem;
               }
               img,
               svg {
                  border-radius: 50%;
                  width: ${props => props.theme.smallHead};
                  height: ${props => props.theme.smallHead};
               }
               svg.markSeen {
                  cursor: pointer;
                  opacity: 0.4;
                  &:hover {
                     opacity: 1;
                  }
                  &.loading {
                     ${props => props.theme.spin};
                  }
               }
            }
            .tweetsContainer {
               ${props => props.theme.scroll};
               max-height: calc(100vh - 21rem);
               padding: 0;
               ${props => props.theme.mobileBreakpoint} {
                  max-height: calc(100vh - 22rem);
                  padding: 0 1rem;
               }
            }
         }
         &.empty {
            margin-top: 4rem;
            text-align: center;
            h3 {
               font-size: ${props => props.theme.bigHead};
               font-weight: 700;
               width: 100%;
               text-align: center;
            }
            button {
               padding: 1rem;
               border: none;
               &:hover {
                  background: none;
               }
               svg {
                  width: 6rem;
                  height: 6rem;
                  path {
                     stroke: ${props => props.theme.mainText};
                  }
                  polygon {
                     fill: ${props => props.theme.mainText};
                  }
                  &.loading {
                     ${props => props.theme.spinBackward};
                  }
               }
            }
         }
      }
   }
`;

const Tweets = ({
   tweets,
   listID,
   markTweetsSeen,
   setActiveTweets,
   myTwitterInfo: {
      id: dailiesID,
      twitterSeenIDs: seenIDs,
      twitterUserID: userID,
      twitterListsObject: listsObject
   }
}) => {
   const [refreshList, { client }] = useLazyQuery(GET_TWEETS_FOR_LIST, {
      ssr: false,
      fetchPolicy: 'network-only',
      variables: {
         listID
      },
      onError: error => {
         console.log(error);
      },
      onCompleted: data => {
         const button = document.querySelector('#refreshButton svg');
         if (button) {
            button.classList.remove('loading');
         }
         const { listTweets } = JSON.parse(data.getTweetsForList.message);

         setActiveTweets(filterTweets(JSON.parse(listTweets), seenIDs));
      }
   });

   let tweetersRemaining;
   let tweetsRemaining;
   const tweetersArray = [];
   const seenTweeters = [];

   let tweetsDisplay;
   if (tweets.length === 0) {
      tweetsDisplay = (
         <div className="tweeters empty">
            <h3>No new tweets.</h3>
            <button
               id="refreshButton"
               onClick={e => {
                  e.target.classList.add('loading');
                  refreshList();
               }}
            >
               <ResetIcon />
            </button>
         </div>
      );
   } else {
      tweets.sort((a, b) => parseInt(a.id_str) - parseInt(b.id_str));
      tweetsRemaining = tweets.length;
      tweets.forEach(tweet => {
         const tweeter = tweet.user;
         if (!seenTweeters.includes(tweeter.screen_name)) {
            const tweeterObject = {
               tweeter: {
                  id: tweeter.id_str,
                  name: tweeter.screen_name,
                  displayName: tweeter.name,
                  pic: tweeter.profile_image_url_https
               },
               tweets: [tweet]
            };
            tweetersArray.push(tweeterObject);
            seenTweeters.push(tweeter.screen_name);
         } else {
            const positionInTweetersArray = tweetersArray.findIndex(
               tweeterObject =>
                  tweeterObject.tweeter.name === tweeter.screen_name
            );
            tweetersArray[positionInTweetersArray].tweets.push(tweet);
         }
      });
      tweetersRemaining = tweetersArray.length;

      const tweetElements = [];

      for (let i = 0; i < 3 && i < seenTweeters.length; i++) {
         const thisTweetersTweets = tweetersArray[i].tweets.map(
            (tweet, index) => (
               <Tweet
                  tweet={tweet}
                  key={tweet.id_str}
                  previousTweet={
                     index > 0
                        ? tweetersArray[i].tweets[index - 1].id_str
                        : null
                  }
                  nextTweetReplyTarget={
                     index < tweetersArray[i].tweets.length - 1
                        ? tweetersArray[i].tweets[index + 1]
                             .in_reply_to_status_id_str
                        : null
                  }
               />
            )
         );

         const thisTweeter = (
            <div
               className={`tweeterColumn column${i}`}
               key={tweetersArray[i].tweeter.name}
            >
               <h3 className="tweeterHeader tweetHead">
                  <img
                     src={tweetersArray[i].tweeter.pic}
                     className="tweeterAvatar"
                     alt="Tweeter Avatar"
                  />
                  <div>
                     <div className="top">
                        <a
                           href={`https://twitter.com/${
                              tweetersArray[i].tweeter.name
                           }`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="tweeterNameLink"
                        >
                           @{tweetersArray[i].tweeter.name}
                        </a>
                        ({thisTweetersTweets.length})
                     </div>
                     <div className="bottom">
                        {tweetersArray[i].tweeter.displayName}
                     </div>
                  </div>
                  <X
                     className="markSeen"
                     onClick={async e => {
                        const theWholeTarget = e.target.closest('svg');
                        theWholeTarget.classList.add('loading');
                        const tweetIDs = [];
                        tweetersArray[i].tweets.forEach(tweet => {
                           tweetIDs.push(tweet.id_str);
                           if (tweet.retweeted_status) {
                              tweetIDs.push(tweet.retweeted_status.id_str);
                           }
                        });
                        const newSeenIDs = seenIDs.concat(tweetIDs);
                        setActiveTweets(filterTweets(tweets, newSeenIDs));
                        markTweetsSeen({
                           variables: {
                              listID,
                              tweetIDs
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              markTweetsSeen: {
                                 __typename: 'Member',
                                 id: dailiesID,
                                 twitterListsObject: listsObject,
                                 twitterSeenIDs: newSeenIDs
                              }
                           }
                        });
                     }}
                  />
               </h3>
               <div className="tweetsContainer">{thisTweetersTweets}</div>
            </div>
         );

         tweetElements.push(thisTweeter);
      }

      tweetsDisplay = (
         <div className="tweeters">
            <div className="remainingCounters">
               {tweetsRemaining} tweets / {tweetersRemaining} tweeters
            </div>
            <div className="tweeterColumnsContainer">{tweetElements}</div>
         </div>
      );
   }

   return (
      <StyledTweets>
         <div className="tweets">{tweetsDisplay}</div>
      </StyledTweets>
   );
};

export default Tweets;
