import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link';
import { useContext } from 'react';
import { setAlpha, setLightness } from '../../styles/functions';
import { isVideo } from '../../lib/UrlHandling';

const StyledSmallThingCard = styled.article`
   margin: 2rem 0;
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
      color: ${props => props.theme.mainText};
      line-height: 1;
      .tinyMeta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 35)};
         font-weight: 300;
         margin-top: 0.6rem;
      }
   }
`;

const SmallThingCard = props => {
   const {
      data: { id, title, featuredImage, partOfCategory: category }
   } = props;

   const { majorColor } = useContext(ThemeContext);

   let highlightColor = setAlpha(majorColor, 0.6);
   if (category && category.color != null) {
      highlightColor = category.color;
   }

   return (
      <StyledSmallThingCard
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
               <a>{title}</a>
            </Link>
            <div className="tinyMeta">Some more metadata here</div>
         </div>
      </StyledSmallThingCard>
   );
};

export default SmallThingCard;
