import styled from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(48rem, 1fr));
      grid-gap: 4rem;
      justify-items: center;
      align-items: stretch;
      h3 {
         font-size: 3.5rem;
      }
   }
   &.list {
      article {
         margin: 2rem 0;
         &:first-child {
            margin-top: 0;
         }
      }
   }
`;

const Things = props => {
   const { things, style, cardSize } = props;
   const thingCards = things.map(thing => {
      if (cardSize === 'regular') {
         return <ThingCard data={thing} key={thing.id} />;
      }
      return <SmallThingCard data={thing} key={thing.id} />;
   });
   return (
      <StyledThings className={`things ${style}`}>{thingCards}</StyledThings>
   );
};

export default Things;
