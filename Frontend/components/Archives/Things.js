import styled from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';

const StyledThings = styled.div`
   margin: auto;
`;

const Things = props => {
   const thingCards = props.things.map(thing => (
      <SmallThingCard data={thing} key={thing.id} />
   ));
   return <StyledThings>{thingCards}</StyledThings>;
};

export default Things;
