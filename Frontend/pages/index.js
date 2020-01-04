import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import { MemberContext } from '../components/Account/MemberProvider';
import { smallThingCardFields } from '../lib/CardInterfaces';
import Things from '../components/Archives/Things';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';

const THINGS_BY_MEMBER_QUERY = gql`
   query THINGS_BY_MEMBER_QUERY($id: ID!) {
      things(where: {author: {id: $id}}) {
         ${smallThingCardFields}
      }
   }
`;

const Home = () => {
   const { id } = useContext(MemberContext);
   const { loading, error, data } = useQuery(THINGS_BY_MEMBER_QUERY, {
      variables: { id }
   });

   if (loading) return <LoadingRing />;
   if (error) return <Error error={error} />;

   return <Things things={data.things} />;
};

export default Home;
