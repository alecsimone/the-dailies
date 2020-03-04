import styled from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';
import { setAlpha } from '../../styles/functions';

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
            margin-bottom: 4rem;
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
         &:first-child {
            margin-top: 0;
         }
      }
   }
`;

const Things = ({ things, displayType, cardSize, noPic }) => {
   const { desktopBPWidthRaw, bigScreenBPWidthRaw } = useContext(ThemeContext);
   const thingCards = things.map(thing => {
      if (cardSize === 'regular') {
         return <ThingCard data={thing} key={thing.id} />;
      }
      return <SmallThingCard data={thing} key={thing.id} noPic={noPic} />;
   });
   if (displayType === 'grid') {
      return (
         <StyledThings className={`things ${displayType}`}>
            <Masonry
               breakpointCols={{
                  default: 3,
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
