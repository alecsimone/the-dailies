import styled from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';
import { setAlpha } from '../../styles/functions';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      .masonryContainer {
         display: flex;
         margin-left: -2.5rem; /* gutter offset, negative */
         width: auto;
      }
      .column {
         padding-left: 2.5rem; /* gutter offset, positive */
         background-clip: padding-box;
         .thingCard {
            margin-bottom: 3rem;
         }
      }
      h3 {
         font-size: 3.5rem;
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

const Things = ({ things, displayType, cardSize }) => {
   const thingCards = things.map(thing => {
      if (cardSize === 'regular') {
         return <ThingCard data={thing} key={thing.id} />;
      }
      return <SmallThingCard data={thing} key={thing.id} />;
   });
   if (displayType === 'grid') {
      return (
         <StyledThings className={`things ${displayType}`}>
            <Masonry
               breakpointCols={{ default: 3, 1800: 2, 1280: 1 }}
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
   cardSize: PropTypes.oneOf(['regular', 'small'])
};

export default Things;
