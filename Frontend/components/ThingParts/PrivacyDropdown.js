import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import MetaOption from './MetaOption';
import {
   checkForNewThingRedirect,
   ALL_THINGS_QUERY
} from '../../lib/ThingHandling';
import useMe from '../Account/useMe';
import { myThingsQueryCount, MY_THINGS_QUERY } from '../Archives/MyThings';

const GET_PRIVACY_OPTIONS_QUERY = gql`
   query enumValuesOfPrivacySetting {
      __type(name: "PrivacySetting") {
         __typename
         name
         enumValues {
            name
         }
      }
   }
`;
export { GET_PRIVACY_OPTIONS_QUERY };

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
   const {
      loggedInUserID,
      memberFields: { defaultPrivacy }
   } = useMe('PrivacyDropdown', 'defaultPrivacy');

   const [setThingPrivacy] = useMutation(SET_THING_PRIVACY_MUTATION, {
      onCompleted: data =>
         checkForNewThingRedirect(id, 'setThingPrivacy', data),
      onError: err => alert(err.message)
   });

   const selectPrivacy = e => {
      const {
         target: { value }
      } = e;
      // setFullThingToLoading(id);
      setThingPrivacy({
         variables: { privacySetting: value, thingID: id },
         optimisticResponse: {
            __typename: 'Mutation',
            setThingPrivacy: {
               __typename: 'Thing',
               id,
               privacy: value
            }
         },
         refetchQueries: [
            {
               query: ALL_THINGS_QUERY
            },
            { query: MY_THINGS_QUERY, variables: { count: myThingsQueryCount } }
         ]
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
      <select
         onChange={selectPrivacy}
         value={initialPrivacy || (loggedInUserID && defaultPrivacy)}
      >
         {privacyOptions}
      </select>
   );
};
PrivacyDropdown.propTypes = {
   initialPrivacy: PropTypes.string.isRequired,
   id: PropTypes.string.isRequired
};

export default PrivacyDropdown;
