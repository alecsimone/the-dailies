import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import { isVideo } from '../../lib/UrlHandling';
import { convertISOtoAgo, disabledCodewords } from '../../lib/ThingHandling';
import AuthorLink from '../ThingParts/AuthorLink';

const StyledSmallThingCard = styled.article`
   margin: 0;
   width: 100%;
   max-width: ${props => props.theme.desktopBPWidth};
   display: inline-block;
   padding: 2rem 1rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   box-shadow: 0 2px 2px hsla(0, 0%, 0%, 0.1);
   border-left: 0.5rem solid ${props => setAlpha(props.theme.majorColor, 0.6)};
   font-weight: 600;
   display: flex;
   align-items: center;
   cursor: pointer;
   opacity: 0.9;
   ${props => props.theme.mobileBreakpoint} {
      border-radius: 0 2px 2px 0;
   }
   &:hover {
      opacity: 1;
      background: hsla(0, 0%, 100%, 0.02);
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
         &:hover {
            color: ${props => setLightness(props.theme.mainText, 90)};
         }
      }
      .tinyMeta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 35)};
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
`;

const SmallThingCard = props => {
   const {
      data: {
         id,
         title,
         featuredImage,
         partOfCategory: category,
         createdAt,
         author,
         privacy
      }
   } = props;

   const { majorColor } = useContext(ThemeContext);

   let highlightColor = setAlpha(majorColor, 0.6);
   if (category && category.color != null) {
      highlightColor = category.color;
   }

   const timeAgo = convertISOtoAgo(createdAt);

   return (
      <Link href={{ pathname: '/thing', query: { id } }}>
         <StyledSmallThingCard
            className="smallThingCard thingCard"
            style={{ borderLeft: `0.5rem solid ${highlightColor}` }}
         >
            <img
               className="thumb"
               src={
                  featuredImage == null ||
                  isVideo(featuredImage) ||
                  disabledCodewords.includes(featuredImage)
                     ? '/defaultPic.jpg'
                     : featuredImage
               }
            />
            <div className="meta">
               <a href={`/thing?id=${id}`}>
                  {title.length > 60
                     ? `${title.substring(0, 60).trim()}...`
                     : title}
               </a>
               <div className="tinyMeta">
                  <AuthorLink author={author} /> {timeAgo} ago in{' '}
                  {category.title}. It's{' '}
                  {privacy === 'Public' || privacy === 'Private'
                     ? privacy
                     : `for ${privacy} only`}
                  .
               </div>
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
      partOfCategory: PropTypes.shape({
         color: PropTypes.string,
         title: PropTypes.string.isRequired
      }),
      createdAt: PropTypes.string,
      author: PropTypes.object.isRequired
   })
};

export default SmallThingCard;
