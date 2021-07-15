import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import SmallThingCard from './SmallThingCard';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import ThingCard from './ThingCard';

const CardGenerator = ({
   id,
   cardType,
   fullQuery,
   setExpanded,
   borderSide
}) => {
   const { data, loading, error } = useQuery(SINGLE_THING_QUERY, {
      variables: {
         id
      }
   });
   if (data) {
      if (data.thing == null) {
         return <Error error={{ message: `No thing found for id: ${id}` }} />;
      }
      if (cardType === 'regular') {
         return (
            <ThingCard
               data={data.thing}
               borderSide={borderSide}
               setExpanded={setExpanded}
            />
         );
      }
      return (
         <SmallThingCard data={data.thing} key={id} fullQuery={fullQuery} />
      );
   }
   if (error) {
      return <Error error={error} />;
   }
   return <LoadingRing />;
};
CardGenerator.propTypes = {
   id: PropTypes.string.isRequired,
   cardType: PropTypes.oneOf(['small', 'regular'])
};

export default CardGenerator;
