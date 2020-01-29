import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { MemberContext } from '../Account/MemberProvider';
import MetaOption from './MetaOption';

const GET_CATEGORIES_QUERY = gql`
   query GET_CATEGORIES_QUERY {
      categories {
         __typename
         id
         title
      }
   }
`;
export { GET_CATEGORIES_QUERY };

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
   const { me } = useContext(MemberContext);

   const checkForRedirect = data => {
      if (id === 'new') {
         Router.push({
            pathname: '/thing',
            query: { id: data.setThingCategory.id }
         });
      }
   };

   const [setThingCategory, { data: setCategoryData }] = useMutation(
      SET_THING_CATEGORY_MUTATION,
      {
         onCompleted: data => checkForRedirect(data)
      }
   );

   let categoryOptions;
   const {
      loading: categoryOptionsLoading,
      error: categoryOptionsError,
      data: categoryOptionsData
   } = useQuery(GET_CATEGORIES_QUERY);

   if (categoryOptionsLoading) {
      categoryOptions = <MetaOption name={initialCategory} />;
   } else {
      categoryOptions = categoryOptionsData.categories.map(option => (
         <MetaOption name={option.title} />
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
      <select
         onChange={selectCategory}
         value={
            initialCategory ||
            (me && me.defaultCategory && me.defaultCategory.title)
         }
      >
         {categoryOptions}
      </select>
   );
};
CategoryDropdown.propTypes = {
   initialCategory: PropTypes.string.isRequired,
   id: PropTypes.string.isRequired
};

export default CategoryDropdown;
