import { SINGLE_THING_QUERY } from '../../pages/thing';
import useQueryAndStoreIt from '../../stuffStore/useQueryAndStoreIt';
import LoadingRing from '../LoadingRing';
import FlexibleThingCard from './FlexibleThingCard';
import Error from '../ErrorMessage';
import PlaceholderThings from '../PlaceholderThings';

const CardFetcher = ({
   thingID,
   cardType,
   hideConnections,
   borderSide,
   noPic,
   contentType,
   draggable,
   groupName,
   index,
   showEmptyContent
}) => {
   const { data, loading, error } = useQueryAndStoreIt(SINGLE_THING_QUERY, {
      variables: {
         id: thingID
      },
      fetchPolicy: 'cache-first'
   });

   if (loading) {
      return (
         <PlaceholderThings
            count={1}
            borderSide={borderSide}
            contentType={contentType}
            expanded={cardType === 'regular'}
         />
      );
   }

   if (data) {
      return (
         <FlexibleThingCard
            key={thingID}
            expanded={cardType === 'regular'}
            hideConnections={hideConnections}
            thingID={thingID}
            contentType={contentType}
            titleLink
            noPic={noPic}
            borderSide={borderSide}
            draggable={draggable}
            groupName={groupName}
            index={index}
            showEmptyContent={showEmptyContent}
         />
      );
   }

   if (error) {
      return (
         <Error
            error={
               error.message != null
                  ? error
                  : { message: `No thing found for ID ${thingID}` }
            }
         />
      );
   }
};
export default CardFetcher;
