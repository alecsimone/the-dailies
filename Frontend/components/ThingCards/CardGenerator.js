import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FlexibleThingCard from './FlexibleThingCard';
import CardFetcher from './CardFetcher';

const CardGenerator = ({
   id,
   cardType,
   hideConnections,
   borderSide,
   contentType,
   noPic
}) => {
   const hasData = useSelector(state => state.stuff[`Thing:${id}`] != null);

   let computedContentType = 'full';
   if (contentType != null) {
      computedContentType = contentType;
   } else if (cardType === 'small') {
      computedContentType = 'single';
   }

   if (!hasData) {
      return (
         <CardFetcher
            thingID={id}
            cardType={cardType}
            hideConnections={hideConnections}
            contentType={computedContentType}
            borderSide={borderSide}
            noPic={noPic}
         />
      );
   }

   return (
      <FlexibleThingCard
         key={id}
         expanded={cardType === 'regular'}
         hideConnections={hideConnections}
         thingID={id}
         contentType={computedContentType}
         titleLink
         borderSide={borderSide}
         noPic={noPic}
      />
   );
};
CardGenerator.propTypes = {
   id: PropTypes.string.isRequired,
   cardType: PropTypes.oneOf(['small', 'regular'])
};

export default CardGenerator;
