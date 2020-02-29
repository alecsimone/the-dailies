import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import Comments from './Comments';
import LoadingRing from '../LoadingRing';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';

const StyledFullThing = styled.article`
   margin: 0;
   padding: 2rem 0;
   padding-top: 0;
   max-width: 100%;
   ${props => props.theme.mobileBreakpoint} {
      margin: 1rem 0;
      padding: 2rem;
      max-width: 1440px;
      position: absolute;
      top: 2rem;
      left: 3%;
      width: 94%;
      padding: 3rem;
      padding-top: 0;
      border-radius: 1rem;
   }
   border: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
   background: ${props => props.theme.lightBlack};
   box-shadow: 0 4px 4px ${props => setAlpha(props.theme.deepBlack, 0.2)};
   &:after {
      position: absolute;
      content: '';
      bottom: -8rem;
      height: 8rem;
      width: 1px;
   }
   .loadingRing {
      display: none;
   }
   &.loading .loadingRing {
      display: block;
   }
   .tweet {
      .entities {
         display: grid;
         grid-template-columns: 1fr 1fr;
         grid-column-gap: 2rem;
         justify-items: center;
         margin: auto;
      }
   }
`;

const setFullThingToLoading = id => {
   if (id === 'new') {
      const fullThing = document.querySelector('.fullThing');
      fullThing.classList.add('loading');
   }
};
export { setFullThingToLoading };

const FullThing = props => {
   const { canEdit } = props;
   const { id, partOfCategory: category } = useContext(ThingContext) || {};

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
         <div className="loadingRing">
            <LoadingRing />
         </div>
         <FeaturedImage
            context={ThingContext}
            key={`${id}-FeaturedImage`}
            canEdit={canEdit}
         />
         <ThingMeta key={`${id}-ThingMeta`} canEdit={canEdit} />
         {id !== 'new' && <TagBox key={`${id}-TagBox`} canEdit={canEdit} />}
         <Content
            context={ThingContext}
            key={`${id}-Content`}
            canEdit={canEdit}
         />
         {id !== 'new' && (
            <Comments context={ThingContext} key={`${id}-Comments`} />
         )}
      </StyledFullThing>
   );
};
FullThing.propTypes = {
   canEdit: PropTypes.bool
};

export default FullThing;
