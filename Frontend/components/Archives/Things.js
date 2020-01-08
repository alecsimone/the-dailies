import styled from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      justify-items: center;
   }
`;

const Things = props => {
   const { things, style } = props;
   const thingCards = things.map(thing => (
      <SmallThingCard data={thing} key={thing.id} />
   ));
   return <StyledThings className={style}>{thingCards}</StyledThings>;
};

export default Things;
