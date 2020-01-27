import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Tweet from './Tweet';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';

const MARK_TWEETS_SEEN = gql`
   mutation MARK_TWEETS_SEEN($listID: String!, $tweetIDs: [String]!) {
      markTweetsSeen(listID: $listID, tweetIDs: $tweetIDs) {
         __typename
         id
         twitterListsObject
         twitterSeenIDs
      }
   }
`;

const StyledTweets = styled.section`
   position: absolute;
   top: 0;
   left: 0%;
   width: 100%;
   @media screen and (min-width: 800px) {
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
            @media screen and (min-width: 800px) {
               margin: 1rem 2rem;
               padding: 0;
            }
            opacity: 0.8;
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
            @media screen and (min-width: 800px) {
               margin: 0 2rem;
            }
            background: ${props => setLightness(props.theme.black, 1)};
            border-radius: 3px;
            position: relative;
            width: 100%;
            flex-grow: 1;
            min-width: 45rem;
            max-width: 100rem;
            height: 100%;
            overflow: hidden;
            border: 2px solid
               ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
            box-shadow: 0 4px 4px
               ${props => setAlpha(setLightness(props.theme.black, 1), 0.2)};
            &.column1,
            &.column2 {
               @media screen and (max-width: 800px) {
                  display: none;
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
               background: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 60), 0.15)};
               text-align: center;
               border-radius: 3px 3px 0 0;
               .bottom {
                  font-size: ${props => props.theme.tinyText};
                  font-weight: 400;
                  opacity: 0.4;
               }
               a.tweeterNameLink {
                  margin-right: 1rem;
               }
               img {
                  border-radius: 50%;
                  width: ${props => props.theme.smallHead};
                  height: ${props => props.theme.smallHead};
               }
               img.markSeen {
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
               max-height: calc(100vh - 8rem);
               padding: 0;
               @media screen and (min-width: 800px) {
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
               color: ${props => props.theme.majorColor};
               width: 100%;
               text-align: center;
            }
            button {
               padding: 1rem;
               &.loading {
                  background: ${props => props.theme.lowContrastGrey};
               }
            }
         }
      }
   }
`;

const filterTweets = (tweets, seenIDs) => {
   if (!Array.isArray(tweets)) {
      return tweets;
   }
   const filteredTweets = tweets.filter(tweet => {
      if (seenIDs == null) return true;
      if (tweet.retweeted_status != null) {
         return !seenIDs.includes(tweet.retweeted_status.id_str);
      }
      return !seenIDs.includes(tweet.id_str);
   });
   return filteredTweets;
};
export { filterTweets };

const Tweets = props => {
   const {
      list,
      myTwitterInfo: {
         id: dailiesID,
         twitterSeenIDs: seenIDs,
         twitterUserID: userID,
         twitterListsObject: listsObject
      }
   } = props;
   const tweets = JSON.parse(list.tweets);

   const [markTweetsSeen] = useMutation(MARK_TWEETS_SEEN);

   let tweetersRemaining;
   let tweetsRemaining;
   const tweetersArray = [];
   const seenTweeters = [];

   const filteredTweets = filterTweets(tweets, seenIDs);

   let tweetsDisplay;
   if (filteredTweets.length === 0) {
      tweetsDisplay = (
         <div className="tweeters empty">
            <h3>No new tweets.</h3>
            <button id="refreshButton">Refresh</button>
         </div>
      );
   } else {
      filteredTweets.sort((a, b) => parseInt(a.id_str) - parseInt(b.id_str));
      tweetsRemaining = filteredTweets.length;
      filteredTweets.forEach(tweet => {
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
         const thisTweetersTweets = tweetersArray[i].tweets.map(tweet => (
            <Tweet tweet={tweet} key={tweet.id_str} />
         ));

         const thisTweeter = (
            <div
               className={`tweeterColumn column${i}`}
               key={tweetersArray[i].tweeter.name}
            >
               <h3 className="tweeterHeader">
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
                  <img
                     src="/red-x.png"
                     className="markSeen"
                     alt="Mark tweeter seen"
                     onClick={e => {
                        e.target.classList.add('loading');
                        const tweetIDs = [];
                        tweetersArray[i].tweets.forEach(tweet => {
                           tweetIDs.push(tweet.id_str);
                           if (tweet.retweeted_status) {
                              tweetIDs.push(tweet.retweeted_status.id_str);
                           }
                        });
                        markTweetsSeen({
                           variables: {
                              listID: list.id,
                              tweetIDs
                           },
                           optimisticResponse: {
                              __typename: 'Mutation',
                              markTweetsSeen: {
                                 __typename: 'Member',
                                 id: dailiesID,
                                 twitterListsObject: listsObject,
                                 twitterSeenIDs: seenIDs.concat(tweetIDs)
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
