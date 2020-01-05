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
   const { me, loading: memberLoading } = useContext(MemberContext);
   const { loading, error, data } = useQuery(THINGS_BY_MEMBER_QUERY, {
      variables: { id: memberLoading ? '' : me.id }
   });

   if (error) return <Error error={error} />;
   if (data) return <Things things={data.things} />;
   if (loading) return <LoadingRing />;
};

export default Home;
