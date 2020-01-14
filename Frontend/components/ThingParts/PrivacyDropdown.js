import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { GET_PRIVACY_OPTIONS_QUERY } from '../NewThingForm';
import MetaOption from './MetaOption';

const SET_THING_PRIVACY_MUTATION = gql`
   mutation SET_THING_PRIVACY_MUTATION(
      $privacySetting: PrivacySetting!
      $thingID: ID!
   ) {
      setThingPrivacy(privacySetting: $privacySetting, thingID: $thingID) {
         __typename
         id
         privacy
      }
   }
`;

const PrivacyDropdown = props => {
   const { initialPrivacy, id } = props;
   const [setThingPrivacy] = useMutation(SET_THING_PRIVACY_MUTATION);

   const selectPrivacy = e => {
      const {
         target: { value }
      } = e;
      setThingPrivacy({
         variables: { privacySetting: value, thingID: id },
         optimisticResponse: {
            __typename: 'Mutation',
            setThingPrivacy: {
               __typename: 'Thing',
               id,
               privacy: value
            }
         }
      });
   };

   let privacyOptions;
   const {
      loading: privacyOptionsLoading,
      error: privacyOptionsError,
      data: privacyOptionsData
   } = useQuery(GET_PRIVACY_OPTIONS_QUERY);

   if (privacyOptionsLoading) {
      privacyOptions = <MetaOption name={initialPrivacy} />;
   } else {
      privacyOptions = privacyOptionsData.__type.enumValues.map(option => (
         <MetaOption name={option.name} key={option.name} />
      ));
   }

   return (
      <select onChange={selectPrivacy} value={initialPrivacy}>
         {privacyOptions}
      </select>
   );
};
PrivacyDropdown.propTypes = {
   initialPrivacy: PropTypes.string.isRequired,
   id: PropTypes.string.isRequired
};

export default PrivacyDropdown;
