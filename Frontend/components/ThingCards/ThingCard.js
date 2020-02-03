import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import FeaturedImage from '../ThingParts/FeaturedImage';
import TruncCont from '../ThingParts/TruncCont';
import Tags from '../ThingParts/Tags';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setAlpha, setLightness } from '../../styles/functions';
import AuthorLink from '../ThingParts/AuthorLink';

const StyledThingCard = styled.div`
   width: 100%;
   padding: 2rem;
   max-width: ${props => props.theme.mobileBPWidth};;
   background: ${props => setLightness(props.theme.black, 1)};
   border: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
   box-shadow: 0 4px 4px
      ${props => setAlpha(setLightness(props.theme.black, 1), 0.2)};
   border-top: 0.5rem solid ${props => props.theme.majorColor};
   ${props => props.theme.mobileBreakpoint} {
      border-radius: 3px;
   }
   .featuredImage {
      h3 {
         /* color: ${props => setAlpha(props.theme.mainText, 0.9)}; */
      }
      img.featured,
      video {
         width: 100%;
         max-height: 30rem;
      }
      img.featuredImage {
         object-fit: cover;
      }
      video {
         object-fit: contain;
      }
   }
   .meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      font-size: ${props => props.theme.smallText};
      color: ${props => props.theme.lowContrastGrey};
      margin-top: 0.75rem;
      border-bottom: 1px solid ${props => props.theme.lowContrastGrey};
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
               width: 3rem;
               height: 3rem;
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
      margin: 3rem 0 0;
      padding: 2rem 0.5rem;
      border-radius: 3px;
      opacity: .9;
      background: ${props => props.theme.black};
   }
   .tags {
      margin-top: 2rem;
   }
`;

const ThingCardContext = React.createContext();

const ThingCard = props => {
   const { data } = props;
   if (data.featuredImage == null) {
      data.featuredImage = '/defaultPic.jpg';
   }
   const {
      id,
      featuredImage,
      partOfCategory: category,
      author,
      privacy,
      content,
      partOfTags: tags,
      createdAt
   } = data;

   const { majorColor } = useContext(ThemeContext);

   let highlightColor = setAlpha(majorColor, 0.6);
   if (category && category.color != null) {
      highlightColor = category.color;
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
                  ago in {category.title}
               </div>
               <div className="meta-right">{privacy}</div>
            </div>
            <TruncCont cont={content[0]} limit={280} />
            <Tags tags={tags} />
         </StyledThingCard>
      </ThingCardContext.Provider>
   );
};
ThingCard.propTypes = {
   data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
      partOfCategory: PropTypes.object,
      author: PropTypes.object,
      privacy: PropTypes.string,
      content: PropTypes.arrayOf(PropTypes.object),
      partOfTags: PropTypes.arrayOf(PropTypes.object),
      createdAt: PropTypes.string
   })
};

export default ThingCard;
