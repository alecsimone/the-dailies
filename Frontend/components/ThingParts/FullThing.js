import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import Comments from './Comments';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';

const StyledFullThing = styled.article`
   margin: 1rem 0;
   border-radius: 1rem;
   max-width: 1440px;
   position: absolute;
   top: 2rem;
   left: 6rem;
   width: 94%;
   padding: 3rem;
   background: ${props => setAlpha(setLightness(props.theme.black, 1), 1)};
   border: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
   box-shadow: 0 4px 4px
      ${props => setAlpha(setLightness(props.theme.black, 1), 0.2)};
   &:after {
      position: absolute;
      content: '';
      bottom: -8rem;
      height: 8rem;
      width: 1px;
   }
`;

const FullThing = props => {
   const { canEdit } = props;
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
         <FeaturedImage
            context={ThingContext}
            key={`${id}-FeaturedImage`}
            canEdit={canEdit}
         />
         <ThingMeta key={`${id}-ThingMeta`} canEdit={canEdit} />
         <Content
            context={ThingContext}
            key={`${id}-Content`}
            canEdit={canEdit}
         />
         <TagBox key={`${id}-TagBox`} canEdit={canEdit} />
         <Comments context={ThingContext} key={`${id}-Comments`} />
      </StyledFullThing>
   );
};
FullThing.propTypes = {
   canEdit: PropTypes.bool
};

export default FullThing;
