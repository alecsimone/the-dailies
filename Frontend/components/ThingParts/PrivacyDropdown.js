import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { MemberContext } from '../Account/MemberProvider';
import MetaOption from './MetaOption';

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
   const { me } = useContext(MemberContext);

   const checkForRedirect = data => {
      if (id === 'new') {
         Router.push({
            pathname: '/thing',
            query: { id: data.setThingPrivacy.id }
         });
      }
   };

   const [setThingPrivacy] = useMutation(SET_THING_PRIVACY_MUTATION, {
      onCompleted: data => checkForRedirect(data)
   });

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
      <select
         onChange={selectPrivacy}
         value={initialPrivacy || (me && me.defaultPrivacy)}
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
