import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useContext } from 'react';
import { setAlpha, setLightness } from '../../styles/functions';
import { isVideo } from '../../lib/UrlHandling';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import AuthorLink from '../ThingParts/AuthorLink';

const StyledSmallThingCard = styled.article`
   margin: 0;
   width: 100%;
   max-width: 800px;
   display: inline-block;
   /* background: hsla(45, 1%, 7.5%, 0.9); */
   background: ${props => props.theme.background};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
   padding: 1.2rem;
   border-radius: 0 2px 2px 0;
   border-left: 0.5rem solid ${props => setAlpha(props.theme.majorColor, 0.6)};
   box-shadow: 0 3px 6px hsla(0, 0%, 0%, 0.4);
   font-weight: 600;
   display: flex;
   align-items: center;
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
         &:hover {
            color: ${props => setLightness(props.theme.mainText, 90)};
         }
      }
      .tinyMeta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 35)};
         font-weight: 300;
         margin-top: 0.6rem;
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
`;

const SmallThingCard = props => {
   const {
      data: {
         id,
         title,
         featuredImage,
         partOfCategory: category,
         createdAt,
         author
      }
   } = props;

   const { majorColor } = useContext(ThemeContext);

   let highlightColor = setAlpha(majorColor, 0.6);
   if (category && category.color != null) {
      highlightColor = category.color;
   }

   const timeAgo = convertISOtoAgo(createdAt);

   return (
      <StyledSmallThingCard
         className="smallThingCard"
         style={{ borderLeft: `0.5rem solid ${highlightColor}` }}
      >
         <img
            className="thumb"
            src={
               featuredImage == null || isVideo(featuredImage)
                  ? '/defaultPic.jpg'
                  : featuredImage
            }
         />
         <div className="meta">
            <Link href={{ pathname: '/thing', query: { id } }}>
               <a>
                  {title.length > 60
                     ? `${title.substring(0, 60).trim()}...`
                     : title}
               </a>
            </Link>
            <div className="tinyMeta">
               {timeAgo} ago by <AuthorLink author={author} /> in{' '}
               {category.title}
            </div>
         </div>
      </StyledSmallThingCard>
   );
};

export default SmallThingCard;
