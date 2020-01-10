import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import FeaturedImage from '../ThingParts/FeaturedImage';
import TruncCont from '../ThingParts/TruncCont';
import Tags from '../ThingParts/Tags';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setAlpha, setLightness } from '../../styles/functions';

const StyledThingCard = styled.div`
   width: 100%;
   padding: 1.25rem;
   max-width: 60rem;
   background: ${props => setAlpha(props.theme.black, 0.4)};
   box-shadow: 0 2px 4px hsla(0, 0%, 0%, 0.4);
   border-radius: 3px;
   border-top: 0.5rem solid ${props => props.theme.majorColor};
   .featuredImage {
      img.featuredImage {
         object-fit: cover;
         width: 100%;
         height: 30rem;
      }
   }
   .meta {
      display: flex;
      justify-content: space-between;
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.highContrastGrey};
   }
   .truncCont {
      margin: 3rem 0;
      padding: 2rem 0.5rem;
      border-top: 2px solid ${props => props.theme.lowContrastGrey};
      border-radius: 3px;
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
                  />
               </a>
            </Link>
            <div className="meta">
               <div className="meta-left">
                  {convertISOtoAgo(createdAt)} ago by {author.displayName} in{' '}
                  {category.title}
               </div>
               <div className="meta-right">{privacy}</div>
            </div>
            <TruncCont cont={content[0]} limit={280} />
            <Tags tags={tags} />
         </StyledThingCard>
      </ThingCardContext.Provider>
   );
};

export default ThingCard;
