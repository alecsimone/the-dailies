import styled from 'styled-components';
import Tweet from './Tweet';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';

const StyledTweets = styled.section`
   position: absolute;
   top: 0;
   left: 2%;
   width: 96%;
   padding: 0;
   .tweets {
      .tweeters {
         .remainingCounters {
            width: 100%;
            margin: 1rem 2rem;
            opacity: 0.5;
            font-weight: 200;
         }
         .tweeterColumnsContainer {
            display: flex;
         }
         .tweeterColumn {
            margin: 0 2rem;
            background: ${props =>
               setAlpha(
                  setLightness(
                     setSaturation(props.theme.lowContrastGrey, 10),
                     42
                  ),
                  0.2
               )};
            border-radius: 3px;
            position: relative;
            width: 600px;
            flex-grow: 1;
            min-width: 40rem;
            max-width: 80rem;
            height: 100%;
            overflow: hidden;
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
                  setAlpha(setLightness(props.theme.majorColor, 30), 0.15)};
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
                     animation-name: spin;
                     animation-duration: 750ms;
                     animation-iteration-count: infinite;
                     animation-timing-function: linear;
                  }
               }
               @keyframes spin {
                  from {
                     transform: rotate(0deg);
                  }
                  to {
                     transform: rotate(360deg);
                  }
               }
            }
            .tweetsContainer {
               ${props => props.theme.scroll};
               max-height: calc(100vh - 22rem);
            }
            .scrollToBottomContainer {
               text-align: center;
               padding-top: 2rem;
               img.scrollToBottom {
                  width: ${props => props.theme.bigText};
                  height: auto;
                  transform: rotateX(180deg);
                  cursor: pointer;
                  opacity: 0.4;
                  &:hover {
                     opacity: 1;
                  }
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
      .tweet {
         margin: 2rem 1rem;
         padding: 0 1.5rem 2rem 1.5rem;
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
         border-radius: 0.5rem;
         background: ${props => props.theme.black};
         .repliedToTweet {
            margin-top: 0;
            .quoteTweetContainer {
               border-top: none;
               border-radius: 0;
               .repliedToTweet .quoteTweetContainer {
                  border-radius: 3px;
                  border-top: 1px solid
                     ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
               }
            }
         }
         &.retweet {
            .retweeter {
               display: flex;
               align-items: center;
               margin: 0 -1rem 1rem -1rem;
               padding: 2rem 1rem;
               background: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 30), 0.15)};
               a.retweetLink {
                  color: ${props =>
                     setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
                  &:hover {
                     color: ${props => props.theme.majorColor};
                  }
               }
               img.retweetedAvatar {
                  border-radius: 50%;
                  width: ${props => props.theme.smallHead};
                  height: auto;
                  margin-right: 1rem;
               }
            }
            .repliedToTweet {
               margin-top: -1rem;
               .tweet {
                  border: 1px solid
                     ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
                  border-top: none;
               }
            }
            .tweet {
               padding: 0;
               border: 0;
               margin: 0;
            }
         }
         a,
         a:visited {
            color: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
            &:hover {
               color: ${props => props.theme.majorColor};
            }
         }
         img.embeddedPhoto,
         .embeddedVideo video {
            width: 500px;
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
         }
         .quoteTweetContainer {
            border: 1px solid
               ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
            border-radius: 3px;
            .tweet {
               margin: 0;
               padding: 1rem;
               box-sizing: border-box;
               border: none;
            }
            h5 {
               a,
               a:visited {
                  color: ${props => props.theme.mainText};
               }
               display: flex;
               align-items: center;
               background: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 30), 0.15)};
               margin: 0;
               padding: 1rem 0;
               border-bottom: none;
               border-radius: 3px 3px 0 0;
            }
            img.quotedTweeterAvatar {
               border-radius: 50%;
               max-width: ${props => props.theme.smallHead};
               height: auto;
               margin: 0 1rem;
            }
            article {
               margin-top: 0;
               border-top: none;
               border-radius: 0 0 3px 3px;
               p:first-of-type {
                  margin-top: 0;
                  padding-top: 2rem;
               }
               .replyInfo {
                  margin-top: 0;
                  padding-top: 2rem;
               }
            }
         }
         .tweetMeta {
            margin-top: 1rem;
            color: ${props =>
               setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
            font-size: ${props => props.theme.smallText};
            @media screen and (min-width: 800px) {
               font-size: ${props => props.theme.tinyText};
            }
            display: flex;
            align-items: center;
            justify-content: space-between;
            opacity: 0.8;
            a.linkToOriginalTweet {
               color: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
               &:hover {
                  color: ${props => props.theme.majorColor};
               }
            }
            .score {
               display: inline-flex;
               align-items: center;
               img {
                  opacity: 1;
                  width: ${props => props.theme.smallText};
                  @media screen and (min-width: 800px) {
                     width: ${props => props.theme.tinyText};
                  }
                  height: auto;
                  margin: 0 1rem 0 0.6rem;
                  filter: saturate(0%);
                  cursor: pointer;
                  transition: filter 0.1s;
                  &:hover {
                     filter: saturate(100%);
                  }
                  &.on {
                     filter: saturate(100%);
                     &:hover {
                        filter: saturate(0%);
                     }
                  }
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
      myTwitterInfo: { twitterSeenIDs: seenIDs, twitterUserID: userID }
   } = props;
   const tweets = JSON.parse(list.tweets);

   let tweetersRemaining;
   let tweetsRemaining;
   const tweetersArray = [];
   const seenTweeters = [];

   const filteredTweets = filterTweets(tweets, seenIDs);
   filteredTweets.sort((a, b) => parseInt(a.id_str) - parseInt(b.id_str));
   const oldestTweetID =
      filteredTweets.length > 0 ? filteredTweets[0].id_str : '0';
   tweetsRemaining = filteredTweets.length;

   let tweetsDisplay;
   if (filteredTweets.length === 0) {
      tweetsDisplay = (
         <div className="tweeters empty">
            <h3>No new tweets.</h3>
            <button id="refreshButton">Refresh</button>
         </div>
      );
   } else {
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
