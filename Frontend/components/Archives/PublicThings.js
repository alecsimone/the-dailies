import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Things from './Things';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import { sidebarPerPage } from '../../config';

const PUBLIC_THINGS_QUERY = gql`
   query PUBLIC_THINGS_QUERY {
      publicThings {
         ${smallThingCardFields}
      }
   }
`;
export { PUBLIC_THINGS_QUERY };

const PublicThings = ({ displayType = 'list' }) => {
   const { data, error, loading } = useQuery(PUBLIC_THINGS_QUERY, {
      pollInterval: 5000
   });

   if (error) return <Error error={error} />;

   if (data) {
      return (
         <Things
            things={data.publicThings}
            displayType={displayType}
            cardSize={displayType === 'grid' ? 'regular' : 'small'}
            scrollingParentSelector=".sidebar"
            perPage={sidebarPerPage}
         />
      );
   }

   if (loading) return <LoadingRing />;

   return <p>Your things here</p>;
};
PublicThings.propTypes = {};

export default PublicThings;
