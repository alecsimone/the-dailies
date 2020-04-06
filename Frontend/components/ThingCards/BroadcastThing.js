import { useContext, useState } from 'react';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';
import { disabledCodewords } from '../../lib/ThingHandling';
import LinkyText from '../LinkyText';
import { setAlpha, setLightness } from '../../styles/functions';
import ExplodingLink from '../ExplodingLink';
import ArrowIcon from '../Icons/Arrow';
import { urlFinder, isImage, isVideo } from '../../lib/UrlHandling';

const StyledBroadcastThing = styled.article`
   background: ${props => props.theme.midBlack};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   margin: 2rem;
   padding: 0;
   position: relative;
   height: 100%;
   max-height: calc(100% - 4rem);
   overflow: hidden;
   display: grid;
   grid-template-rows: auto 1fr;
   h2.thingTitle {
      text-align: center;
      font-size: ${props => props.theme.bigHead};
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
      padding: 2rem;
      background: ${props => setAlpha(props.theme.deepBlack, 0.8)};
      border-bottom: 1px solid
         ${props => setLightness(props.theme.lowContrastGrey, 15)};
   }
   .broadcastBody {
      display: flex;
      position: relative;
      max-height: 100%;
      overflow: hidden;
      font-size: 3.5rem;
      .left {
         position: relative;
         padding: 0 2rem 6rem;
         flex-basis: 35%;
         flex-grow: 1;
         background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
         display: flex;
         align-items: center;
         border-right: 3px solid ${props => props.theme.deepBlack};
         a {
            width: 100%;
         }
         img {
            width: 100%;
            object-fit: contain;
         }
         &.showingTweet {
            max-height: 100%;
            display: block;
            ${props => props.theme.scroll};
         }
         .embed-container {
            width: 100%;
            height: 90%;
         }
      }
      .right {
         position: relative;
         flex-grow: 2;
         flex-basis: 65%;
         max-height: 100%;
         padding: 2rem;
         padding-bottom: 6rem;
         .contentWrapper {
            max-width: 1440px;
            background: none;
            border: none;
            margin: 0 auto;
            max-height: 100%;
            ${props => props.theme.scroll};
            a.shortlink {
               color: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 70), 0.9)};
            }
         }
         p.noContent {
            opacity: 0.6;
            font-weight: 300;
            font-style: italic;
            font-size: ${props => props.theme.bigText};
         }
      }
      .contentNav {
         display: flex;
         justify-content: space-between;
         position: absolute;
         left: 0;
         width: 100%;
         bottom: 0;
         height: 5rem;
         svg {
            cursor: pointer;
            opacity: 0.6;
            &:hover {
               opacity: 1;
            }
            width: 5rem;
            height: 5rem;
            &.leftArrow {
               position: absolute;
               left: 0;
               bottom: 0;
            }
            &.rightArrow {
               position: absolute;
               right: 0;
               bottom: 0;
            }
         }
      }
   }
`;

const BroadcastThing = ({ id }) => {
   const { title, featuredImage, content } = useContext(ThingContext);
   const [currentContentPiece, setCurrentContentPiece] = useState(0);
   const [currentExplodingLink, setCurrentExplodingLink] = useState(0);

   let displayContent;
   const explodingLinks = [];
   if (content.length > 0) {
      const urls = content[currentContentPiece].content.match(urlFinder);
      if (urls != null) {
         urls.forEach(url => {
            if (isImage(url) || isVideo(url)) {
               explodingLinks.push(url);
            }
         });
      }

      let counter = 0;
      const linklessText = content[currentContentPiece].content.replace(
         urlFinder,
         (url, captures, offset, fullText) => {
            if (isImage(url) || isVideo(url)) {
               counter++;
               return `[fig ${counter}]`;
            }
            return url;
         }
      );

      displayContent = (
         <LinkyText text={linklessText} key={content[currentContentPiece].id} />
      );
   } else {
      displayContent = <p className="noContent">No content yet</p>;
   }

   if (
      featuredImage != null &&
      !disabledCodewords.includes(featuredImage.toLowerCase())
   ) {
      explodingLinks.push(featuredImage);
   }

   let showingTweet = false;
   if (
      explodingLinks[currentExplodingLink]
         .toLowerCase()
         .includes('twitter.com/') &&
      explodingLinks[currentExplodingLink].toLowerCase().includes('/status/')
   ) {
      showingTweet = true;
   }

   return (
      <StyledBroadcastThing>
         <h2 className="thingTitle">{title}</h2>
         <div className="broadcastBody">
            {explodingLinks.length > 0 && (
               <div className={showingTweet ? 'left showingTweet' : 'left'}>
                  {
                     <ExplodingLink
                        url={explodingLinks[currentExplodingLink]}
                        key={explodingLinks[currentExplodingLink]}
                     />
                  }
                  <div className="contentNav">
                     {currentExplodingLink > 0 && (
                        <ArrowIcon
                           pointing="left"
                           className="leftArrow"
                           onClick={() =>
                              setCurrentExplodingLink(currentExplodingLink - 1)
                           }
                        />
                     )}
                     {currentExplodingLink < explodingLinks.length - 1 && (
                        <ArrowIcon
                           pointing="right"
                           className="rightArrow"
                           onClick={() =>
                              setCurrentExplodingLink(currentExplodingLink + 1)
                           }
                        />
                     )}
                  </div>
               </div>
            )}
            <div className="right">
               <div className="contentWrapper">{displayContent}</div>
               <div className="contentNav">
                  {currentContentPiece > 0 && (
                     <ArrowIcon
                        pointing="left"
                        className="leftArrow"
                        onClick={() =>
                           setCurrentContentPiece(currentContentPiece - 1)
                        }
                     />
                  )}
                  {currentContentPiece < content.length - 1 && (
                     <ArrowIcon
                        pointing="right"
                        className="rightArrow"
                        onClick={() =>
                           setCurrentContentPiece(currentContentPiece + 1)
                        }
                     />
                  )}
               </div>
            </div>
         </div>
      </StyledBroadcastThing>
   );
};

export default BroadcastThing;
