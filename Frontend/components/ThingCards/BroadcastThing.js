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
      font-size: ${props => props.theme.smallHead};
      .left {
         max-height: 100%;
         position: relative;
         padding: 0 2rem 8rem;
         flex-basis: 35%;
         flex-grow: 1;
         background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
         display: flex;
         align-items: center;
         border-right: 3px solid ${props => props.theme.deepBlack};
         .explodingLinksWrapper {
            padding-top: 2rem;
            height: 100%;
            text-align: center;
            margin: auto;
         }
         img,
         video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
         }
         &.showingTweet {
            max-height: 100%;
            display: block;
            ${props => props.theme.scroll};
            .tweet {
               margin: auto;
               max-width: 1200px;
               font-size: ${props => props.theme.bigText};
               img.embeddedPhoto {
                  max-width: 590px;
                  margin: 5px;
                  vertical-align: top;
               }
            }
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
         padding-bottom: 8rem;
         .contentWrapper {
            max-width: 1440px;
            background: none;
            border: none;
            margin: 0 auto;
            max-height: 100%;
            ${props => props.theme.scroll};
            p {
               max-width: 1200px;
               min-height: 0.6em;
               margin: 1.8rem auto;
            }
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
            text-align: center;
         }
      }
      .contentNav {
         display: flex;
         justify-content: space-between;
         position: absolute;
         left: 0;
         width: 100%;
         bottom: 0;
         height: 6rem;
         border-top: 3px solid ${props => props.theme.deepBlack};
         svg {
            rect {
               fill: ${props => props.theme.mainText};
            }
            cursor: pointer;
            opacity: 0.8;
            &:hover {
               opacity: 1;
               width: 8rem;
               height: 8rem;
               margin-bottom: -1rem;
            }
            width: 6rem;
            height: 6rem;
            &.leftArrow {
               position: absolute;
               left: 0;
               bottom: 0;
               &:hover {
                  margin-left: -1rem;
               }
            }
            &.rightArrow {
               position: absolute;
               right: 0;
               bottom: 0;
               &:hover {
                  margin-right: -1rem;
               }
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
      explodingLinks[currentExplodingLink] != null &&
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
                     <div className="explodingLinksWrapper">
                        <ExplodingLink
                           url={explodingLinks[currentExplodingLink]}
                           key={explodingLinks[currentExplodingLink]}
                        />
                     </div>
                  }
                  {explodingLinks.length > 1 && (
                     <div className="contentNav">
                        {currentExplodingLink > 0 && (
                           <ArrowIcon
                              pointing="left"
                              className="leftArrow"
                              onClick={() =>
                                 setCurrentExplodingLink(
                                    currentExplodingLink - 1
                                 )
                              }
                           />
                        )}
                        {currentExplodingLink < explodingLinks.length - 1 && (
                           <ArrowIcon
                              pointing="right"
                              className="rightArrow"
                              onClick={() =>
                                 setCurrentExplodingLink(
                                    currentExplodingLink + 1
                                 )
                              }
                           />
                        )}
                     </div>
                  )}
               </div>
            )}
            {(explodingLinks.length == 0 || content.length > 0) && (
               <div className="right">
                  <div className="contentWrapper">{displayContent}</div>
                  {content.length > 1 && (
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
                  )}
               </div>
            )}
         </div>
      </StyledBroadcastThing>
   );
};

export default BroadcastThing;
