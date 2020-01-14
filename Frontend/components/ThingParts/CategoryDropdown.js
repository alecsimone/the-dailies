import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { GET_CATEGORIES_QUERY } from '../NewThingForm';
import MetaOption from './MetaOption';

const SET_THING_CATEGORY_MUTATION = gql`
   mutation SET_THING_CATEGORY_MUTATION($category: String!, $thingID: ID!) {
      setThingCategory(category: $category, thingID: $thingID) {
         __typename
         id
         partOfCategory {
            __typename
            title
            id
         }
      }
   }
`;

const CategoryDropdown = props => {
   const { initialCategory, id } = props;
   const [setThingCategory, { data: setCategoryData }] = useMutation(
      SET_THING_CATEGORY_MUTATION
   );

   let categoryOptions;
   const {
      loading: categoryOptionsLoading,
      error: categoryOptionsError,
      data: categoryOptionsData
   } = useQuery(GET_CATEGORIES_QUERY);

   if (categoryOptionsLoading) {
      categoryOptions = <MetaOption name={initialCategory.title} />;
   } else {
      categoryOptions = categoryOptionsData.categories.map(option => (
         <MetaOption name={option.title} key={option.title} />
      ));
   }

   const selectCategory = e => {
      const {
         target: { value }
      } = e;
      const chosenCategory = categoryOptionsData.categories.find(
         category => category.title === value
      );
      setThingCategory({
         variables: { category: value, thingID: id },
         optimisticResponse: {
            __typename: 'Mutation',
            setThingCategory: {
               __typename: 'Thing',
               id,
               partOfCategory: {
                  __typename: 'Category',
                  title: value,
                  id: chosenCategory.id
               }
            }
         }
      });
   };

   return (
      <select onChange={selectCategory} value={initialCategory}>
         {categoryOptions}
      </select>
   );
};
CategoryDropdown.propTypes = {
   initialCategory: PropTypes.string.isRequired,
   id: PropTypes.string.isRequired
};

export default CategoryDropdown;
