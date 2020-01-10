import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import Comments from './Comments';
import { setAlpha } from '../../styles/functions';

const StyledFullThing = styled.article`
   margin: 1rem 0;
   border-radius: 8px;
   max-width: 1440px;
   position: absolute;
   top: 2rem;
   left: 4%;
   width: 100%;
   /* padding: 2rem; */
   /* background: ${props => setAlpha(props.theme.black, 0.4)}; */
   &:after {
      position: absolute;
      content: '';
      bottom: -8rem;
      height: 8rem;
      width: 1px;
   }
`;

const FullThing = props => {
   const { id, partOfCategory: category } = useContext(ThingContext);

   const { majorColor } = useContext(ThemeContext);

   let highlightColor = setAlpha(majorColor, 0.6);
   if (category && category.color != null) {
      highlightColor = category.color;
   }

   return (
      <StyledFullThing
         className="fullThing"
         style={{ borderTop: `0.6rem solid ${highlightColor}` }}
      >
         <FeaturedImage context={ThingContext} key={`${id}-FeaturedImage`} />
         <ThingMeta key={`${id}-ThingMeta`} />
         <Content context={ThingContext} key={`${id}-Content`} />
         <TagBox key={`${id}-TagBox`} />
         <Comments context={ThingContext} key={`${id}-Comments`} />
      </StyledFullThing>
   );
};

export default FullThing;
