import styled, { ThemeContext } from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useContext } from 'react';
import { setAlpha } from '../../styles/functions';
import FlexibleThingCard from '../ThingCards/FlexibleThingCard';
import useMe from '../Account/useMe';
import CardGenerator from '../ThingCards/CardGenerator';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      .masonryContainer {
         display: flex;
         margin-left: -4rem; /* gutter offset, negative */
         width: auto;
      }
      .column {
         padding-left: 4rem; /* gutter offset, positive */
         background-clip: padding-box;
         .thingCard {
            margin-bottom: 0;
            ${props => props.theme.mobileBreakpoint} {
               margin-bottom: 4rem;
            }
         }
      }
   }
   &.list {
      article {
         margin: 0;
         border: none;
         box-shadow: none;
         border-bottom: 2px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         &.big {
            &:first-child {
               margin-top: 0;
            }
         }
      }
      .flexibleThingCard.big {
         margin: 2rem auto;
      }
   }
`;

const Things = ({
   things,
   displayType,
   cardSize = 'regular',
   contentType = 'single',
   noPic,
   borderSide
}) => {
   const { desktopBPWidthRaw, bigScreenBPWidthRaw } = useContext(ThemeContext);

   const {
      loggedInUserID,
      memberFields: { role }
   } = useMe('Things', 'role');

   // const thingCards = things.map(thing => (
   //    <FlexibleThingCard
   //       key={thing.id}
   //       expanded={cardSize === 'regular'}
   //       thingID={thing.id}
   //       contentType="single"
   //       titleLink
   //       borderSide={borderSide}
   //       noPic={noPic}
   //    />
   // ));
   const thingCards = things.map(thing => (
      <CardGenerator
         id={thing.id}
         cardType={cardSize}
         contentType={contentType}
         noPic={noPic}
         borderSide={borderSide}
      />
   ));
   if (displayType === 'grid') {
      return (
         <StyledThings className={`things ${displayType}`}>
            <Masonry
               breakpointCols={{
                  default: 1,
                  9999: 3,
                  [bigScreenBPWidthRaw]: 2,
                  [desktopBPWidthRaw]: 1
               }}
               className="masonryContainer"
               columnClassName="column"
            >
               {thingCards}
            </Masonry>
         </StyledThings>
      );
   }
   return (
      <StyledThings className={`things ${displayType}`}>
         {thingCards}
      </StyledThings>
   );
};
Things.propTypes = {
   things: PropTypes.array.isRequired,
   displayType: PropTypes.oneOf(['list', 'grid']),
   cardSize: PropTypes.oneOf(['regular', 'small']),
   noPic: PropTypes.bool
};

export default Things;
