import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Things from './Things';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import { smallThingCardFields } from '../../lib/CardInterfaces';

const MY_FRIENDS_THINGS_QUERY = gql`
   query MY_FRIENDS_THINGS_QUERY {
      myFriendsThings {
         ${smallThingCardFields}
      }
   }
`;

const MyFriendsThings = () => {
   const { data, error, loading } = useQuery(MY_FRIENDS_THINGS_QUERY);

   if (error) {
      return <Error error={error} />;
   }

   if (data) {
      return (
         <Things
            things={data.myFriendsThings}
            displayType="list"
            cardSize="small"
         />
      );
   }

   if (loading) {
      return <LoadingRing />;
   }
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
