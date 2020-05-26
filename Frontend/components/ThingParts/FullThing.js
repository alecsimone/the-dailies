import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TaxBox from './TaxBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import Comments from './Comments';
import LoadingRing from '../LoadingRing';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import VoteBar from './VoteBar';
import { MemberContext } from '../Account/MemberProvider';

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
   .featuredImage {
      ${props => props.theme.mobileBreakpoint} {
         width: calc(100% + 6rem);
         margin: 0 -3rem;
      }
      img.featured,
      .tweet {
         margin-top: 3rem;
      }
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
   .votebar {
      margin: 3rem 0 0;
      ${props => props.theme.mobileBreakpoint} {
         margin: 5rem 0 0;
      }
   }
   .taxBoxes {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin: 0;
      ${props => props.theme.mobileBreakpoint} {
         margin: 0;
         flex-wrap: nowrap;
      }
      > * {
         flex-basis: 100%;
         margin: 3rem 0;
         ${props => props.theme.mobileBreakpoint} {
            margin: 2rem 0;
            flex-basis: 50%;
         }
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
   const { id, color, votes } = useContext(ThingContext) || {};

   const { lowContrastGrey } = useContext(ThemeContext);

   let highlightColor = lowContrastGrey;
   if (color != null) {
      highlightColor = color;
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
         <VoteBar votes={votes} thingID={id} />
         <div className="taxBoxes">
            <TaxBox key={`${id}-TagBox`} canEdit={canEdit} personal={false} />
            <TaxBox key={`${id}-StackBox`} canEdit={canEdit} personal />
         </div>
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
