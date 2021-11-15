import { SINGLE_THING_QUERY } from '../../pages/thing';
import useQueryAndStoreIt from '../../stuffStore/useQueryAndStoreIt';
import LoadingRing from '../LoadingRing';
import FlexibleThingCard from './FlexibleThingCard';
import Error from '../ErrorMessage';

const CardFetcher = ({ thingID, cardType, borderSide }) => {
   const { data, loading, error } = useQueryAndStoreIt(SINGLE_THING_QUERY, {
      variables: {
         id: thingID
      },
      fetchPolicy: 'cache-first'
   });

   if (loading) {
      return <LoadingRing />;
   }

   if (data) {
      return (
         <FlexibleThingCard
            key={thingID}
            expanded={cardType === 'regular'}
            thingID={thingID}
            contentType={cardType === 'regular' ? 'full' : 'single'}
            titleLink
            borderSide={borderSide}
         />
      );
   }

   if (error) {
      return <Error error={error} />;
   }
};
export default CardFetcher;
