import styled from 'styled-components';
import PropTypes from 'prop-types';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';
import { setAlpha } from '../../styles/functions';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
      grid-gap: 4rem;
      justify-items: center;
      align-items: stretch;
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

const Things = props => {
   const { things, displayType, cardSize } = props;
   const thingCards = things.map(thing => {
      if (cardSize === 'regular') {
         return <ThingCard data={thing} key={thing.id} />;
      }
      return <SmallThingCard data={thing} key={thing.id} />;
   });
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