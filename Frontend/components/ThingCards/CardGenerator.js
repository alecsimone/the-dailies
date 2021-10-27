import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import FlexibleThingCard from './FlexibleThingCard';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import useMe from '../Account/useMe';

const CardGenerator = ({ id, cardType, borderSide }) => {
   const { data, loading, error } = useQuery(SINGLE_THING_QUERY, {
      variables: {
         id
      },
      fetchPolicy: 'cache-first'
   });

   const {
      loggedInUserID,
      memberFields: { role }
   } = useMe('CardGenerator', 'role');

   if (data) {
      if (data.thing == null) {
         return <Error error={{ message: `No thing found for id: ${id}` }} />;
      }
      return (
         <FlexibleThingCard
            key={data.thing.id}
            expanded={cardType === 'regular'}
            thingData={data.thing}
            thingID={data.thing.id}
            contentType={cardType === 'regular' ? 'full' : 'single'}
            canEdit={
               loggedInUserID != null &&
               (data.thing.author.id === loggedInUserID ||
                  ['Admin', 'Editor', 'Moderator'].includes(role))
            }
            titleLink
            borderSide={borderSide}
         />
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
