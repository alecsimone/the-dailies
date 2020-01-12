import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import SmallThingCard from './SmallThingCard';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';

const CardGenerator = props => {
   const { id, cardType } = props;

   const { data, loading, error } = useQuery(SINGLE_THING_QUERY, {
      variables: {
         id
      }
   });
   if (data) {
      return <SmallThingCard data={data.thing} key={id} />;
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
