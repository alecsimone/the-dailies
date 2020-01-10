import { useQuery } from '@apollo/react-hooks';
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

export default CardGenerator;
