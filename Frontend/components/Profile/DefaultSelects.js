import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { GET_PRIVACY_OPTIONS_QUERY } from '../ThingParts/PrivacyDropdown';
import MetaOption from '../ThingParts/MetaOption';

const StyledSelectsWrapper = styled.div`
   display: flex;
   justify-content: stretch;
   width: 100%;
   margin: 2rem 0 3rem;
   .selectWrapper {
      display: flex;
      flex-wrap: wrap;
      justify-content: stretch;
      &:first-child {
         margin-right: 2rem;
      }
      select {
         width: 100%;
      }
   }
`;

const DefaultSelects = ({
   initialPrivacy,
   initialExpansion,
   editProfile,
   id
}) => {
   const handleSelect = e => {
      const optimisticResponse = {
         __typename: 'Mutation',
         editProfile: {
            __typename: 'Member',
            id,
            [e.target.name]: e.target.value
         }
      };

      editProfile({
         variables: {
            id,
            [e.target.name]: e.target.value
         },
         optimisticResponse
      });
   };

   const {
      loading: loadingPrivacies,
      data: privacies,
      error: privaciesError
   } = useQuery(GET_PRIVACY_OPTIONS_QUERY);
   let privacyOptions;
   if (loadingPrivacies) {
      privacyOptions = <MetaOption name={initialPrivacy} />;
   } else {
      privacyOptions = privacies.__type.enumValues.map(option => (
         <MetaOption name={option.name} />
      ));
   }

   return (
      <StyledSelectsWrapper className="selectsWrapper">
         <div className="privacySelectWrapper selectWrapper">
            Default Privacy:
            <select
               name="defaultPrivacy"
               value={initialPrivacy}
               onChange={handleSelect}
            >
               {privacyOptions}
            </select>
         </div>
      </StyledSelectsWrapper>
   );
};
DefaultSelects.propTypes = {
   initialPrivacy: PropTypes.string.isRequired,
   id: PropTypes.string.isRequired
};
export default DefaultSelects;
