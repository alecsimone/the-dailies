import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import FeaturedImage from '../ThingParts/FeaturedImage';
import TruncCont from '../ThingParts/TruncCont';
import Taxes from '../ThingParts/Taxes';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setAlpha, setLightness } from '../../styles/functions';
import AuthorLink from '../ThingParts/AuthorLink';
import VoteBar from '../ThingParts/VoteBar';

const StyledThingCard = styled.div`
   width: 100%;
   padding: 0 1.5rem 1.5rem;
   background: ${props => props.theme.lightBlack};
   box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.deepBlack, 0.4)};
   &:hover {
      background: ${props => setLightness(props.theme.lightBlack, 8.5)};
      box-shadow: 0 2px 4px
      ${props => setAlpha(props.theme.midBlack, 0.4)};
   }
   border-top: 0.5rem solid ${props => props.theme.majorColor};
   ${props => props.theme.mobileBreakpoint} {
      border-radius: 3px;
      padding: 0 2.5rem 1.25rem;
   }
   a:hover {
      text-decoration: none;
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
   .truncCont {
      margin: 3rem 0 1.5rem;
      padding: .8rem 1.25rem;
      border-radius: 3px;
      /* opacity: .9; */
      background: ${props => props.theme.midBlack};
      border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   }
   .tags {
      margin-top: 2rem;
   }
   .votebar {
      width: calc(100% + 3rem);
      margin: 1rem -1.5rem 0;
   }
`;

const ThingCardContext = React.createContext();

const ThingCard = ({ data }) => {
   const {
      id,
      featuredImage,
      color,
      author,
      privacy,
      content,
      partOfTags: tags,
      votes,
      score,
      createdAt
   } = data;

   const { lowContrastGrey } = useContext(ThemeContext);

   let highlightColor = lowContrastGrey;
   if (color != null) {
      highlightColor = color;
   }

   return (
      <ThingCardContext.Provider value={data}>
         <StyledThingCard
            className="regularThingCard thingCard"
            style={{ borderTop: `0.5rem solid ${highlightColor}` }}
         >
            <Link href={{ pathname: '/thing', query: { id } }}>
               <a>
                  <FeaturedImage
                     context={ThingCardContext}
                     key={`${id}-FeaturedImage`}
                     titleLimit={80}
                     canEdit={false}
                  />
               </a>
            </Link>
            <div className="meta">
               <div className="meta-left">
                  <AuthorLink author={author} /> {convertISOtoAgo(createdAt)}{' '}
                  ago
               </div>
               <div className="meta-right">{privacy}</div>
            </div>
            <TruncCont cont={content[0]} limit={280} />
            {tags.length > 0 && <Taxes taxes={tags} personal={false} />}
            <VoteBar votes={votes} thingID={id} />
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
