import SmallThingCard from '../ThingCards/SmallThingCard';

const Things = props => {
   const thingCards = props.things.map(thing => (
      <SmallThingCard data={thing} key={thing.id} />
   ));
   return <div>{thingCards}</div>;
};

export default Things;
