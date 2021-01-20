import PropTypes from 'prop-types';
import { useLazyQuery } from '@apollo/react-hooks';
import { useRef } from 'react';
import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import { GET_TWEETS_FOR_LIST, filterTweets } from './TwitterReader';
import Tweet from './Tweet';
import X from '../Icons/X';
import ResetIcon from '../Icons/Reset';

const StyledTweets = styled.section`
   position: absolute;
   top: 0;
   bottom: 0;
   left: 0%;
   width: 100%;
   ${props => props.theme.mobileBreakpoint} {
      left: 2%;
      width: 96%;
   }
   padding: 0;
   .tweets {
      height: 100%;
      ${props => props.theme.mobileBreakpoint} {
         height: calc(
            100% - 1.5rem
         ); /* we need to take off 2rem for the margin on .remainingCounters, which pushes .tweets down */
      }
      .tweeters {
         height: 100%;
         ${props => props.theme.mobileBreakpoint} {
            display: grid;
            grid-template-rows: auto 1fr;
            align-items: start;
         }
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
            display: flex;
            align-items: center;
            button {
               border: none;
               padding: 0;
               &:hover {
                  background: none;
               }
               svg {
                  width: ${props => props.theme.smallText};
                  margin-left: 1rem;
                  opacity: 0.8;
                  cursor: pointer;
                  &:hover {
                     opacity: 1;
                  }
                  &.loading {
                     ${props => props.theme.spinBackward};
                  }
                  path {
                     stroke: ${props => props.theme.mainText};
                  }
                  polygon {
                     fill: ${props => props.theme.mainText};
                  }
               }
            }
         }
         .listInfo {
            padding: 0 2rem 2rem;
            display: flex;
            justify-content: space-between;
            span.selectedListName {
               color: ${props => props.theme.secondaryAccent};
               font-weight: bold;
            }
            span.changeList {
               text-decoration: underline;
               cursor: pointer;
            }
            ${props => props.theme.desktopBreakpoint} {
               display: none;
            }
         }
         .tweeterColumnsContainer {
            display: flex;
            overflow-x: auto;
            max-width: 100%;
            ${props => props.theme.scroll};
            min-height: 100%; // We need a min-height on mobile because it looks weird if it doesn't fill up the screen
            height: 100%;
            ${props => props.theme.mobileBreakpoint} {
               min-height: initial;
               align-items: baseline;
               height: auto;
            }
         }
         .tweeterColumn {
            margin: 0;
            ${props => props.theme.desktopBreakpoint} {
               margin: 0 2rem;
            }
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
               ${props => props.theme.bigScreenBreakpoint} {
                  display: block;
               }
            }
            --tweeter-header-height: calc(
               7.5625rem + 2px
            ); /* On mobile, tweeterHeader has a padding of 1rem on either side and a border of 2px on the bottom. It gets its height from the (currently unnamed) div containing the handle and name, which have font sizes of 2.75rem and 1.7rem respectively and line heights of 1.25, for a total of 4.45 * 1.25 or 5.5625rem. Thus we get 7.5625rem + 2px */
            ${props => props.theme.mobileBreakpoint} {
               --tweeter-header-height: calc(
                  8.4rem + 2px
               ); /* On desktop, tweeterHeader has a padding of 1rem on either side and a border of 2px on the bottom. It gets its height from the (currently unnamed) div containing the handle and name, which have font sizes of 2.75rem and 1.25rem respectively and line heights of 1.6, for a total of 4 * 1.6 or 6.4rem. Thus we get 8.4rem + 2px   */
            }
            h3.tweeterHeader {
               font-size: ${props => props.theme.bigText};
               line-height: 1.25;
               ${props => props.theme.mobileBreakpoint} {
                  line-height: 1.6;
               }
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
               a,
               a:visited {
                  color: ${props => props.theme.mainText};
               }
               .bottom {
                  font-size: ${props => props.theme.miniText};
                  ${props => props.theme.mobileBreakpoint} {
                     font-size: ${props => props.theme.tinyText};
                  }
                  font-weight: 300;
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
               max-height: calc(100% - var(--tweeter-header-height));
               padding: 0;
               ${props => props.theme.mobileBreakpoint} {
                  padding: 0 1rem;
               }
            }
         }
         &.empty {
            text-align: center;
            h3 {
               font-size: ${props => props.theme.bigHead};
               font-weight: 700;
               width: 100%;
               text-align: center;
               margin-top: 0;
               padding-top: 6rem;
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
            .listInfo {
               margin-top: 6rem;
            }
         }
      }
   }
`;

const Tweets = ({
   tweets,
   listID,
   seenIDs,
   markTweetsSeen,
   setActiveTweets,
   myTwitterInfo: {
      id: dailiesID,
      twitterUserID: userID,
      twitterListsObject: listsObject
   },
   showingListsSidebar,
   setShowingListsSidebar
}) => {
   const [refreshList] = useLazyQuery(GET_TWEETS_FOR_LIST, {
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
         const { listTweets, seenIDs: newSeenIDs } = JSON.parse(
            data.getTweetsForList.message
         );

         setActiveTweets(filterTweets(JSON.parse(listTweets), newSeenIDs));
      }
   });

   const allSeenTweets = useRef(seenIDs);

   let tweetContent; // What's gonna get rendered

   // Count displayed at the top
   let tweetsRemaining;
   let tweetersRemaining;

   // Arrays holding all the tweets
   const tweetersArray = []; // List of tweeters and their tweets
   const seenTweeters = []; // Index of who's already on the list

   if (tweets.length === 0) {
      tweetContent = (
         <div className="tweeters empty">
            <h3>No new tweets.</h3>
            <button
               id="refreshButton"
               onClick={e => {
                  e.target.classList.add('loading');
                  refreshList();
               }}
            >
               <ResetIcon className="listRefresher" />
            </button>
            <div className="listInfo">
               <span>
                  Viewing list:{' '}
                  <span className="selectedListName">
                     {JSON.parse(listsObject)[listID].name}
                  </span>
               </span>{' '}
               <span
                  className="changeList"
                  onClick={() => setShowingListsSidebar(true)}
               >
                  Change List
               </span>
            </div>
         </div>
      );
   } else {
      tweets.sort((a, b) => parseInt(a.id_str) - parseInt(b.id_str));
      tweetsRemaining = tweets.length;

      tweets.forEach(tweet => {
         // We're grouping the tweets by tweeter, making an object for each one with their meta info and an array of all their tweets
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

      // We make a list with Tweet components for all the tweets of the first 3 tweeters on our list
      const tweetElements = []; // The list

      for (let i = 0; i < 2 && i < seenTweeters.length; i++) {
         // Put all their tweets in a list
         const thisTweetersTweets = tweetersArray[i].tweets.map(
            (tweet, index) => {
               let previousTweet;
               const thePreviousTweet = tweetersArray[i].tweets[index - 1];
               let nextTweet;
               const theNextTweet = tweetersArray[i].tweets[index + 1];

               // If either of these tweets does not have the same author as this one, we don't want to thread, so we'll set them to null.
               const currentTweetAuthor =
                  tweet.retweeted_status != null
                     ? tweet.retweeted_status.user.id_str
                     : tweet.user.id_str;
               const previousTweetAuthor =
                  thePreviousTweet?.retweeted_status != null
                     ? thePreviousTweet?.retweeted_status?.user?.id_str
                     : thePreviousTweet?.user?.id_str;
               const nextTweetAuthor =
                  theNextTweet?.retweeted_status != null
                     ? theNextTweet?.retweeted_status?.user?.id_str
                     : theNextTweet?.user?.id_str;

               if (index > 0 && currentTweetAuthor === previousTweetAuthor) {
                  // if the previous tweet is a retweet, we want the ID of the tweet that was retweeted, not the id of the tweet that is a retweet
                  previousTweet =
                     thePreviousTweet.retweeted_status != null
                        ? thePreviousTweet.retweeted_status.id_str
                        : thePreviousTweet.id_str;
               } else {
                  previousTweet = null;
               }

               if (
                  index < tweetersArray[i].tweets.length - 1 &&
                  currentTweetAuthor === nextTweetAuthor
               ) {
                  nextTweet =
                     theNextTweet.retweeted_status != null
                        ? theNextTweet.retweeted_status
                             .in_reply_to_status_id_str
                        : theNextTweet.in_reply_to_status_id_str;
               } else {
                  nextTweet = null;
               }

               return (
                  <Tweet
                     tweet={tweet}
                     key={tweet.id_str}
                     previousTweet={previousTweet}
                     nextTweetReplyTarget={nextTweet}
                  />
               );
            }
         );

         // Make a header and container for it
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
                     onClick={e => {
                        const theWholeTarget = e.target.closest('svg');
                        theWholeTarget.classList.add('loading');

                        const tweetIDs = [];
                        tweetersArray[i].tweets.forEach(tweet => {
                           tweetIDs.push(tweet.id_str);
                           // if (tweet.retweeted_status) {
                           //    tweetIDs.push(tweet.retweeted_status.id_str);
                           // }
                        });

                        allSeenTweets.current =
                           allSeenTweets.current != null
                              ? allSeenTweets.current.concat(tweetIDs)
                              : tweetIDs;
                        const newListsObject = { ...JSON.parse(listsObject) };
                        newListsObject[listID].seenIDs = allSeenTweets.current;

                        setActiveTweets(
                           filterTweets(tweets, allSeenTweets.current)
                        );

                        markTweetsSeen({
                           variables: {
                              listID,
                              tweetIDs,
                              lastTweeter: i === tweetersArray.length - 1
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              markTweetsSeen: {
                                 __typename: 'Member',
                                 id: dailiesID,
                                 twitterListsObject: JSON.stringify(
                                    newListsObject
                                 )
                              }
                           },
                           update: (client, { data }) => {
                              const oldDataRaw = client.readQuery({
                                 query: GET_TWEETS_FOR_LIST,
                                 variables: {
                                    listID
                                 }
                              });
                              const oldMessage = JSON.parse(
                                 oldDataRaw.getTweetsForList.message
                              );
                              oldMessage.seenIDs = allSeenTweets.current;
                              const newMessage = JSON.stringify(oldMessage);
                              const newData = {
                                 getTweetsForList: {
                                    __typename: 'SuccessMessage',
                                    message: newMessage
                                 }
                              };
                              client.writeQuery({
                                 query: GET_TWEETS_FOR_LIST,
                                 variables: {
                                    listID
                                 },
                                 data: newData
                              });
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

      tweetContent = (
         <div className="tweeters">
            <div className="remainingCounters">
               {tweetsRemaining} tweets / {tweetersRemaining} tweeters
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
            <div className="listInfo">
               <span>
                  Viewing list:{' '}
                  <span className="selectedListName">
                     {JSON.parse(listsObject)[listID].name}
                  </span>
               </span>{' '}
               <span
                  className="changeList"
                  onClick={() => setShowingListsSidebar(true)}
               >
                  Change List
               </span>
            </div>
            <div className="tweeterColumnsContainer">{tweetElements}</div>
         </div>
      );
   }

   return (
      <StyledTweets>
         <div className="tweets">{tweetContent}</div>
      </StyledTweets>
   );
};

Tweets.propTypes = {
   tweets: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]).isRequired,
   listID: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
   seenIDs: PropTypes.array.isRequired,
   markTweetsSeen: PropTypes.func,
   setActiveTweets: PropTypes.func,
   myTwitterInfo: PropTypes.shape({
      id: PropTypes.string.isRequired,
      twitterUserID: PropTypes.string.isRequired,
      twitterListsObject: PropTypes.string.isRequired
   })
};

export default Tweets;
