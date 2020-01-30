import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { GET_PRIVACY_OPTIONS_QUERY } from '../ThingParts/PrivacyDropdown';
import { GET_CATEGORIES_QUERY } from '../ThingParts/CategoryDropdown';
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

const DefaultSelects = ({ initialCategory, initialPrivacy, editProfile }) => {
   const {
      loading: loadingCategories,
      data: categoriesData,
      error: categoriesError
   } = useQuery(GET_CATEGORIES_QUERY);

   const handleSelect = (e, categoryID) => {
      const optimisticResponse = {
         __typename: 'Mutation',
         editProfile: {
            __typename: 'Member',
            id,
            [e.target.name]: e.target.value
         }
      };
      if (e.target.name === 'defaultCategory') {
         optimisticResponse.editProfile.defaultCategory = {
            __typename: 'Category',
            id: categoryID,
            title: e.target.value
         };
      }

      editProfile({
         variables: {
            id,
            [e.target.name]: e.target.value
         },
         optimisticResponse
      });
   };

   let categoryOptions;
   if (loadingCategories) {
      categoryOptions = <MetaOption name={initialCategory} />;
   } else {
      categoryOptions = categoriesData.categories.map(option => (
         <MetaOption name={option.title} />
      ));
   }

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
         <div className="categorySelectWrapper selectWrapper">
            Default Category:
            <select
               name="defaultCategory"
               value={initialCategory}
               onChange={e => {
                  const [newCategory] = categoriesData.categories.filter(
                     category => category.title === e.target.value
                  );
                  handleSelect(e, newCategory.id);
               }}
            >
               {categoryOptions}
            </select>
         </div>
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
   initialCategory: PropTypes.string.isRequired,
   initialPrivacy: PropTypes.string.isRequired,
   handleSelect: PropTypes.func.isRequired
};
export default DefaultSelects;
