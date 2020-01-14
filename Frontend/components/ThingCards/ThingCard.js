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
   padding: 1.25rem;
   max-width: 60rem;
   background: ${props => setAlpha(props.theme.black, 0.75)};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
   box-shadow: 0 3px 6px hsla(0, 0%, 0%, 0.4);
   border-radius: 3px;
   border-top: 0.5rem solid ${props => props.theme.majorColor};
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
      justify-content: space-between;
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      margin-top: 0.75rem;
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
      margin: 3rem 0;
      padding: 2rem 0.5rem;
      border-top: 2px solid ${props => props.theme.lowContrastGrey};
      border-radius: 3px;
      opacity: .9;
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
            className="thingCard"
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
                  {convertISOtoAgo(createdAt)} ago by{' '}
                  <AuthorLink author={author} /> in {category.title}
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
