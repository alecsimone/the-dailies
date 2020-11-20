import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import FeaturedImage from '../ThingParts/FeaturedImage';
import TruncCont from '../ThingParts/TruncCont';
import Taxes from '../ThingParts/Taxes';
import { setAlpha, setLightness } from '../../styles/functions';
import { orderContent } from '../../lib/ContentHandling';
import AuthorLink from '../ThingParts/AuthorLink';
import VoteBar from '../ThingParts/VoteBar';
import TimeAgo from '../TimeAgo';
import ArrowIcon from '../Icons/Arrow';

const StyledThingCard = styled.div`
   position: relative;
   display: block;
   width: 100%;
   max-width: 1200px;
   padding: 0 1.5rem 1.5rem;
   background: ${props => props.theme.lightBlack};
   box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.deepBlack, 0.4)};
   &:hover {
      background: ${props => setLightness(props.theme.lightBlack, 8.5)};
      box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.midBlack, 0.4)};
   }
   ${props => props.theme.mobileBreakpoint} {
      border-radius: 3px;
      padding: 0 2.5rem 1.25rem;
   }
   a:hover {
      text-decoration: none;
   }
   img, video {
      max-width: 100%;
   }
   .featuredImage {
      width: calc(100% + 3rem);
      margin: 0 -1.5rem;
      padding: 1rem 1.5rem;
      ${props => props.theme.mobileBreakpoint} {
         width: calc(100% + 5rem);
         margin: 0 -2.5rem;
         padding: 2rem 2.5rem;
      }
      h3 {
         /* color: ${props => setAlpha(props.theme.mainText, 0.9)}; */
         font-weight: 500;
         font-size: ${props => props.theme.bigText};
         line-height: 1.2;
         &:hover {
            text-decoration: underline;
         }
      }
      img.featured,
      video {
         width: 100%;
         max-height: 30rem;
         margin-top: 2.5rem;
      }
      img.featuredImage {
         object-fit: cover;
      }
      video {
         object-fit: contain;
      }
      .tweet {
         max-height: 50rem;
         margin-top: 2.5rem;
         ${props => props.theme.scroll};
         .tweet {
            max-height: none;
         }
      }
   }
   .meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      font-size: ${props => props.theme.miniText};
      color: ${props => props.theme.lowContrastGrey};
      margin-top: 1.5rem;
      .meta-left {
         display: inline-flex;
         align-items: center;
         .authorBlock {
            display: inline-flex;
            align-items: center;
            margin-right: 1rem;
            cursor: pointer;
            .authorLink {
               margin-bottom: 2px;
            }
            .authorImg {
               width: ${props => props.theme.smallText};;
               height: ${props => props.theme.smallText};;
               border-radius: 100%;
               margin-right: 1rem;
            }
         }
      }
      a,
      a:visited {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
         &:hover {
            color: ${props => setLightness(props.theme.majorColor, 50)};
            text-decoration: none;
         }
      }
   }
   .cardOverflowWrapper {
      width: 100%;
      overflow: hidden;
      .cardPiecesContainer {
         width: 300%;
         display: flex;
         .previousContentWrapper, .currentContentWrapper, .nextContentWrapper {
            display: inline-block;
            width: 34%;
         }
         .currentContentWrapper {
            margin: 0 1.5rem;
         }
         .givesSize {
            height: auto;
         }
         .doesNotGiveSize {
            height: 0;
         }
      }
   }
   .truncCont {
      margin: 3rem 0 1.5rem;
      padding: .8rem 1.25rem;
      border-radius: 3px;
      /* opacity: .9; */
      background: ${props => props.theme.midBlack};
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   }
   .contentSlider {
      display: flex;
      justify-content: center;
      align-items: center;
      svg.arrow {
         width: ${props => props.theme.bigText};
         margin: 0;
         cursor: pointer;
         rect {
            fill: ${props => setLightness(props.theme.mainText, 70)};
         }
         &:hover {
            rect {
               fill: ${props => props.theme.mainText};
            }
         }
      }
   }
   .tags {
      margin-top: 2rem;
   }
   .votebar {
      width: calc(100% + 3rem);
      margin: 1rem -1.5rem 0;
   }
   #arrowWrapper {
      svg.arrow {
         width: ${props => props.theme.smallHead};
         display: block;
         margin: 1rem auto 0;
      }
   }
`;

const ThingCardContext = React.createContext();

const ThingCard = ({ data, setExpanded, borderSide }) => {
   const {
      id,
      featuredImage,
      color,
      author,
      privacy,
      content,
      contentOrder,
      partOfTags: tags,
      votes,
      summary,
      score,
      createdAt
   } = data;

   const [contentSliderPosition, setContentSliderPosition] = useState(0);
   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   const { lowContrastGrey, midScreenBPWidthRaw } = useContext(ThemeContext);

   const isSmallScreen =
      process.browser && window.outerWidth <= midScreenBPWidthRaw;

   let highlightColor = lowContrastGrey;
   if (color != null) {
      highlightColor = color;
   }

   const contentArray = orderContent(content, contentOrder);
   if (summary != null && summary !== '' && !contentArray.includes(summary)) {
      contentArray.unshift(summary);
   }

   let translation = touchEnd - touchStart;
   if (contentSliderPosition === 0 && translation > -25) {
      translation = 0;
   }
   if (contentSliderPosition + 1 === contentArray.length && translation < 25) {
      translation = 0;
   }
   if (translation > -25 && translation < 25) {
      translation = 0;
   }

   let contentArea;
   if (isSmallScreen || !process.browser) {
      // We need the "|| !process.browser" to keep the server side render from messing everything up on the client side render. Please don't ask me why.
      // If we're on a small screen, we need to put the content pieces next to each other in an element that can slide from side to side, hiding whatever is overflowing its container
      contentArea = (
         <div
            className="cardTouchWatcher"
            key={id}
            onTouchStart={e => {
               e.preventDefault();
               e.stopPropagation();
               setTouchStart(e.touches[0].clientX);
               setTouchEnd(e.touches[0].clientX);
            }}
            onTouchMove={e => {
               e.preventDefault();
               e.stopPropagation();
               setTouchEnd(e.touches[0].clientX);
            }}
            onTouchEnd={e => {
               e.preventDefault();
               e.stopPropagation();
               if (
                  touchEnd - touchStart < -100 &&
                  contentSliderPosition + 1 < contentArray.length
               ) {
                  setContentSliderPosition(contentSliderPosition + 1);
               }
               if (touchEnd - touchStart > 100 && contentSliderPosition > 0) {
                  setContentSliderPosition(contentSliderPosition - 1);
               }
               setTouchStart(0);
               setTouchEnd(0);
            }}
         >
            <div className="cardOverflowWrapper">
               <div className="cardPiecesContainer">
                  {contentSliderPosition > 0 && (
                     <div
                        className={`previousContentWrapper${
                           translation <= 0 ? ' doesNotGiveSize' : ' givesSize'
                        }`}
                        style={{
                           transform: `translateX(calc(${translation}px - 100% - 2rem))`
                        }}
                     >
                        <TruncCont
                           cont={contentArray[contentSliderPosition - 1]}
                           limit={280}
                        />
                     </div>
                  )}
                  <div
                     className="currentContentWrapper"
                     style={{
                        transform: `translateX(calc(${translation}px - ${
                           contentSliderPosition > 0 ? '1' : '2'
                        }rem - ${contentSliderPosition > 0 ? '100' : '0'}% - ${
                           contentSliderPosition + 1 === contentArray.length
                              ? '1'
                              : '0'
                        }rem))`
                     }}
                  >
                     <TruncCont
                        cont={contentArray[contentSliderPosition]}
                        limit={280}
                     />
                  </div>
                  {contentSliderPosition + 1 < contentArray.length && (
                     <div
                        className={`nextContentWrapper${
                           translation >= 0 ? ' doesNotGiveSize' : ' givesSize'
                        }`}
                        style={{
                           transform: `translateX(calc(${translation}px - ${
                              contentSliderPosition > 0 ? '100' : '0'
                           }%))`
                        }}
                     >
                        <TruncCont
                           cont={contentArray[contentSliderPosition + 1]}
                           limit={280}
                        />
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   } else {
      contentArea = (
         <TruncCont cont={contentArray[contentSliderPosition]} limit={280} />
      );
   }

   let contentSlider;
   if (contentArray.length > 0) {
      contentSlider = (
         <div className="contentSlider">
            {contentSliderPosition > 0 && (
               <ArrowIcon
                  pointing="left"
                  onClick={() =>
                     setContentSliderPosition(contentSliderPosition - 1)
                  }
               />
            )}
            {contentSliderPosition + 1} / {contentArray.length}
            {contentSliderPosition + 1 < contentArray.length && (
               <ArrowIcon
                  pointing="right"
                  onClick={() =>
                     setContentSliderPosition(contentSliderPosition + 1)
                  }
               />
            )}
         </div>
      );
   }

   return (
      <ThingCardContext.Provider value={data}>
         <StyledThingCard
            className="regularThingCard thingCard"
            style={{
               [borderSide === 'left'
                  ? 'borderLeft'
                  : 'borderTop']: `0.5rem solid ${highlightColor}`
            }}
         >
            {!featuredImage?.toLowerCase().includes('twitter.com') && (
               <Link href={{ pathname: '/thing', query: { id } }}>
                  <a>
                     <FeaturedImage
                        context={ThingCardContext}
                        key={`${id}-FeaturedImage`}
                        titleLimit={120}
                        canEdit={false}
                     />
                  </a>
               </Link>
            )}
            {featuredImage?.toLowerCase().includes('twitter.com') && (
               <FeaturedImage
                  context={ThingCardContext}
                  key={`${id}-FeaturedImage`}
                  titleLimit={120}
                  canEdit={false}
                  titleLink={{ pathname: '/thing', query: { id } }}
               />
            )}
            <div className="meta">
               <div className="meta-left">
                  <AuthorLink author={author} />{' '}
                  <TimeAgo time={createdAt} toggleable />
               </div>
               <div className="meta-right">{privacy}</div>
            </div>
            {contentArea}
            {contentSlider}
            {tags.length > 0 && <Taxes taxes={tags} personal={false} />}
            <VoteBar votes={votes} thingID={id} />
            {setExpanded != null && (
               <div id="arrowWrapper">
                  <ArrowIcon
                     pointing="up"
                     onClick={e => {
                        e.stopPropagation();
                        setExpanded(false);
                     }}
                  />
               </div>
            )}
         </StyledThingCard>
      </ThingCardContext.Provider>
   );
};
ThingCard.propTypes = {
   data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
      author: PropTypes.object,
      privacy: PropTypes.string,
      content: PropTypes.arrayOf(PropTypes.object),
      partOfTags: PropTypes.arrayOf(PropTypes.object),
      createdAt: PropTypes.string
   })
};

export default ThingCard;
