import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import FlexibleThingCard from './FlexibleThingCard';
import Error from '../ErrorMessage';
import LoadingRing from '../LoadingRing';
import { MemberContext } from '../Account/MemberProvider';

const CardGenerator = ({
   id,
   cardType,
   fullQuery,
   setExpanded,
   borderSide
}) => {
   const { data, loading, error } = useQuery(SINGLE_THING_QUERY, {
      variables: {
         id
      }
   });

   const { me } = useContext(MemberContext);

   if (data) {
      if (data.thing == null) {
         return <Error error={{ message: `No thing found for id: ${id}` }} />;
      }
      return (
         <FlexibleThingCard
            key={data.thing.id}
            expanded={cardType === 'regular'}
            thingData={data.thing}
            contentType={cardType === 'regular' ? 'full' : 'single'}
            canEdit={
               me != null &&
               (data.thing.author.id === me.id ||
                  ['Admin', 'Editor', 'Moderator'].includes(me.role))
            }
            titleLink
            borderSide={borderSide}
         />
      );
      // if (cardType === 'regular') {
      //    return (
      //       <ThingCard
      //          data={data.thing}
      //          borderSide={borderSide}
      //          setExpanded={setExpanded}
      //       />
      //    );
      // }
      // return (
      //    <SmallThingCard data={data.thing} key={id} fullQuery={fullQuery} />
      // );
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
