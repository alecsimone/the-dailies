import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import { isVideo } from '../../lib/UrlHandling';
import { disabledCodewords } from '../../lib/ThingHandling';
import { stringToObject } from '../../lib/TextHandling';
import AuthorLink from '../ThingParts/AuthorLink';
import TimeAgo from '../TimeAgo';
import ThingCard from './ThingCard';
import ArrowIcon from '../Icons/Arrow';

const StyledSmallThingCard = styled.article`
   margin: 0;
   width: 100%;
   max-width: 25em;
   display: inline-block;
   position: relative;
   padding: 2rem 1rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   box-shadow: 0 2px 2px hsla(0, 0%, 0%, 0.1);
   border-left: 0.5rem solid ${props => setAlpha(props.theme.majorColor, 0.6)};
   font-weight: 600;
   display: flex;
   align-items: center;
   cursor: pointer;
   ${props => props.theme.mobileBreakpoint} {
      opacity: 0.9;
      border-radius: 0 2px 2px 0;
   }
   &:hover {
      opacity: 1;
      background: hsla(0, 0%, 100%, 0.02);
      .meta {
         a,
         a:visited {
            color: ${props => setLightness(props.theme.mainText, 90)};
         }
      }
   }
   img {
      width: 5rem;
      height: 5rem;
      object-fit: cover;
   }
   .meta {
      padding: 0 1.2rem;
      line-height: 1;
      a,
      a:visited {
         color: ${props => setLightness(props.theme.mainText, 75)};
      }
      .tinyMeta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
         font-weight: 300;
         margin-top: 0.6rem;
         display: flex;
         align-items: center;
         .authorBlock {
            display: inline-flex;
            align-items: center;
            margin-right: 0.5rem;
            cursor: pointer;
            .authorLink {
               margin-bottom: 2px;
            }
            .authorImg {
               width: 2rem;
               height: 2rem;
               border-radius: 100%;
               margin-right: 0.5rem;
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
   }
   #arrowWrapper {
      svg.arrow {
         width: ${props => props.theme.bigText};
         position: absolute;
         right: 1rem;
         bottom: 1rem;
      }
   }
`;

const SmallThingCard = ({ data, noPic, fullQuery, borderSide }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   const [expanded, setExpanded] = useState(false);

   if (!data) {
      return (
         <StyledSmallThingCard className="smallThingCard thingCard">
            <div className="meta">Bad thing input.</div>
         </StyledSmallThingCard>
      );
   }
   const { id, title, featuredImage, color, createdAt, author, privacy } = data;

   if (expanded) {
      return (
         <ThingCard
            data={data}
            setExpanded={setExpanded}
            borderSide={borderSide}
         />
      );
   }

   let highlightColor = lowContrastGrey;
   if (color != null) {
      highlightColor = color;
   }

   let isTweet = false;
   if (featuredImage) {
      const tweetMatches = featuredImage.match(/twitter\.com\/\w+\/status/i);
      if (tweetMatches) {
         isTweet = true;
      }
   }

   let query;
   let queryString;
   if (fullQuery != null) {
      queryString = `/thing?${fullQuery}`;
      query = stringToObject(fullQuery, '&=');
   } else {
      query = { id };
      queryString = `/thing?id=${id}`;
   }

   return (
      <Link href={{ pathname: '/thing', query }}>
         <StyledSmallThingCard
            className="smallThingCard thingCard"
            style={{ borderLeft: `0.5rem solid ${highlightColor}` }}
         >
            {!(
               featuredImage == null ||
               isVideo(featuredImage) ||
               disabledCodewords.includes(featuredImage.toLowerCase()) ||
               isTweet
            ) && <img className="thumb" src={featuredImage} />}
            <div className="meta">
               <a href={queryString}>
                  {title.length > 60
                     ? `${title.substring(0, 60).trim()}...`
                     : title}
               </a>
               <div className="tinyMeta">
                  <AuthorLink author={author} noPic={noPic} />{' '}
                  <TimeAgo time={createdAt} />. It's{' '}
                  {privacy === 'Public' || privacy === 'Private'
                     ? privacy
                     : `for ${privacy}${privacy === 'Friends' ? ' only' : ''}`}
                  .
               </div>
            </div>
            <div id="arrowWrapper">
               <ArrowIcon
                  pointing="down"
                  onClick={e => {
                     e.stopPropagation();
                     setExpanded(true);
                  }}
               />
            </div>
         </StyledSmallThingCard>
      </Link>
   );
};
SmallThingCard.propTypes = {
   data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
      createdAt: PropTypes.string,
      author: PropTypes.object.isRequired,
      privacy: PropTypes.string.isRequired
   })
};

export default React.memo(SmallThingCard, (prev, next) => {
   if (
      prev.data.title !== next.data.title ||
      prev.data.featuredImage !== next.data.featuredImage ||
      prev.data.privacy !== next.data.privacy
   ) {
      return false;
   }
   return true;
});
