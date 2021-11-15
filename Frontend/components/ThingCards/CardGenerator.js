import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FlexibleThingCard from './FlexibleThingCard';
import CardFetcher from './CardFetcher';

const CardGenerator = ({ id, cardType, borderSide }) => {
   const hasData = useSelector(state => state.stuff[`Thing:${id}`] != null);

   if (!hasData) {
      return (
         <CardFetcher
            thingID={id}
            cardType={cardType}
            borderSide={borderSide}
         />
      );
   }

   return (
      <FlexibleThingCard
         key={id}
         expanded={cardType === 'regular'}
         thingID={id}
         contentType={cardType === 'regular' ? 'full' : 'single'}
         titleLink
         borderSide={borderSide}
      />
   );
};
CardGenerator.propTypes = {
   id: PropTypes.string.isRequired,
   cardType: PropTypes.oneOf(['small', 'regular'])
};

export default CardGenerator;
