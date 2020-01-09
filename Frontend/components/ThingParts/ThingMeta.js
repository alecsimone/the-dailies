import { useContext } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';
import {
   GET_PRIVACY_OPTIONS_QUERY,
   GET_CATEGORIES_QUERY
} from '../NewThingForm';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setLightness } from '../../styles/functions';

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

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   padding-left: 1.25rem;
   padding-top: 0.25rem;
   color: ${props => setLightness(props.theme.highContrastGrey, 40)};
   select {
      color: ${props => setLightness(props.theme.highContrastGrey, 40)};
      border-top: none;
      border-right: none;
      border-left: none;
      margin-left: 2rem;
      background: url('/dropdown.png') no-repeat right;
      appearance: none;
      padding-right: 30px;
   }
   .info {
      font-size: ${props => props.theme.tinyText};
      span {
         margin-right: 1rem;
      }
   }
`;

const MetaOption = props => (
   <option value={props.name} key={props.name}>
      {props.name}
   </option>
);

const ThingMeta = props => {
   const {
      id,
      author,
      link,
      partOfCategory,
      privacy,
      createdAt,
      updatedAt
   } = useContext(ThingContext);

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
      privacyOptions = <MetaOption name={privacy} />;
   } else {
      privacyOptions = privacyOptionsData.__type.enumValues.map(option => (
         <MetaOption name={option.name} key={option.name} />
      ));
   }

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
      categoryOptions = <MetaOption name={partOfCategory.title} />;
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
      <StyledThingMeta className="thingMeta">
         <div className="info">
            <span className="author">By {author.displayName}</span>
            <span className="ago">{convertISOtoAgo(createdAt)} AGO</span>
         </div>
         <div className="selections">
            <select onChange={selectCategory} value={partOfCategory.title}>
               {categoryOptions}
            </select>
            <select onChange={selectPrivacy} value={privacy}>
               {privacyOptions}
            </select>
         </div>
      </StyledThingMeta>
   );
};

export default ThingMeta;
