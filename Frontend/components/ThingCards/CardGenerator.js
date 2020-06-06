import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import SmallThingCard from './SmallThingCard';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';

const CardGenerator = ({ id, cardType, fullQuery }) => {
   const { data, loading, error } = useQuery(SINGLE_THING_QUERY, {
      variables: {
         id
      }
   });
   if (data) {
      if (data.thing == null) {
         return <Error error={{ message: `No thing found for id: ${id}` }} />;
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
