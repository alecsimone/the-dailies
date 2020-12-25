import styled, { ThemeContext } from 'styled-components';
import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import ThingSummary from './ThingSummary';
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
      position: absolute;
      top: 2rem;
      left: 3%;
      width: 94%;
      max-width: 1920px;
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
         max-height: 90vh;
         max-height: calc(var(--vh, 1vh) * 90);
         object-fit: contain;
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

// const setFullThingToLoading = id => {
//    if (id === 'new') {
//       const fullThing = document.querySelector('.fullThing');
//       fullThing.classList.add('loading');
//    }
// };
// export { setFullThingToLoading };

const FullThing = ({ canEdit, linkedPiece, linkedComment }) => {
   const { id, color, votes, content, summary } =
      useContext(ThingContext) || {};

   const { lowContrastGrey } = useContext(ThemeContext);

   const [isLoading, setIsLoading] = useState(true);

   // scroll to a highlighted content block or comment, if there is one
   useEffect(() => {
      const highlightedPiece = document.querySelector(
         '.contentBlock.highlighted'
      );
      const highlightedComment = document.querySelector('.comment.highlighted');
      if (highlightedPiece == null && highlightedComment == null) return;
      const highlightedElement = highlightedPiece || highlightedComment;

      const highlightedElementOffset = highlightedElement.offsetTop;

      const threeColumns = document.querySelector('.threeColumns');
      threeColumns.scrollTop = highlightedElementOffset;
      const mainSection = document.querySelector('.mainSection');
      mainSection.scrollTop = highlightedElementOffset;
      if (false) console.log(isLoading); // So eslint will keep it as a dependency
      setIsLoading(false);
   }, [isLoading]);

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
         <VoteBar votes={votes} id={id} type="Thing" />
         <div className="taxBoxes">
            <TaxBox key={`${id}-TagBox`} canEdit={canEdit} personal={false} />
         </div>
         {(summary != null || canEdit) && (
            <ThingSummary
               summary={summary}
               thingID={id}
               key={`${id}-Summary`}
               canEdit={canEdit}
            />
         )}
         {((content != null && content.length > 0) || canEdit) && (
            <Content
               context={ThingContext}
               linkedPiece={linkedPiece}
               key={`${id}-Content`}
               canEdit={canEdit}
            />
         )}
         {id !== 'new' && (
            <Comments
               context={ThingContext}
               key={`${id}-Comments`}
               linkedComment={linkedComment}
            />
         )}
      </StyledFullThing>
   );
};
FullThing.propTypes = {
   canEdit: PropTypes.bool
};

export default FullThing;
