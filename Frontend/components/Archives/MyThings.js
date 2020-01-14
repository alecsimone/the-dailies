import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Things from './Things';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import { smallThingCardFields } from '../../lib/CardInterfaces';

const MY_THINGS_QUERY = gql`
   query MY_THINGS_QUERY {
      myThings {
         ${smallThingCardFields}
      }
   }
`;

const MyThings = () => {
   const { data, error, loading } = useQuery(MY_THINGS_QUERY);

   if (error) return <Error error={error} />;

   if (data) {
      return (
         <Things things={data.myThings} displayType="list" cardSize="small" />
      );
   }

   if (loading) return <LoadingRing />;

   return <p>Your things here</p>;
};
MyThings.propTypes = {};

export default MyThings;
