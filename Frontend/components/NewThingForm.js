import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import Router from 'next/router';
import Error from './ErrorMessage.js';
import { MemberContext } from './Account/MemberProvider';

const CREATE_THING_MUTATION = gql`
   mutation CREATE_THING_MUTATION(
      $title: String!
      $link: String
      $category: String
      $content: String
      $tags: String
      $privacy: String
   ) {
      createThing(
         title: $title
         link: $link
         category: $category
         content: $content
         tags: $tags
         privacy: $privacy
      ) {
         id
      }
   }
`;

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

const StyledNewThingForm = styled.form`
   max-width: 800px;
   margin: auto;
   text-align: center;
   h2 {
      margin: 1rem auto;
   }
   fieldset {
      border: none;
   }
   input,
   textarea,
   select {
      font-size: ${props => props.theme.smallText};
      width: 100%;
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 3px;
      border: 1px solid ${props => props.theme.lowContrastGrey};
   }
   textarea {
      font-family: 'Proxima Nova', sans-serif;
   }
   button {
      background: ${props => props.theme.majorColor};
      border: none;
      border-radius: 2px;
      font-size: ${props => props.theme.smallText};
      margin-top: 1rem;
      padding: 0.75rem 2.25rem;
      color: ${props => props.theme.mainText};
      cursor: pointer;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
   }
`;

const NewThingForm = props => {
   const [
      createThing,
      { data: createData, loading: createLoading, error: createError }
   ] = useMutation(CREATE_THING_MUTATION);

   const { me, loading: memberLoading } = useContext(MemberContext);

   const [formData, setFormData] = useState({
      title: '',
      link: '',
      category: '',
      content: '',
      tags: '',
      privacy: ''
   });

   const handleChange = function(e) {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const resetForm = () => {
      setFormData({
         title: '',
         link: '',
         category: me.defaultCategory.title,
         content: '',
         tags: '',
         privacy: me.defaultPrivacy
      });
   };

   const {
      loading: categoryLoading,
      error: categoryError,
      data: categoryData
   } = useQuery(GET_CATEGORIES_QUERY);
   let categoryOptions;
   if (categoryLoading || me.defaultCategory === 'Loading...') {
      categoryOptions = (
         <option value="" key="loadingCategories">
            Loading Categories...
         </option>
      );
   } else {
      categoryOptions = categoryData.categories.map(category => (
         <option value={category.title} key={category.title}>
            {category.title}
         </option>
      ));
   }

   const {
      loading: privacyOptionsLoading,
      error: privacyOptionsError,
      data: privacyOptionsData
   } = useQuery(GET_PRIVACY_OPTIONS_QUERY);
   let privacyOptions;
   if (privacyOptionsLoading || memberLoading) {
      privacyOptions = (
         <option value="" key="loadingPrivacy">
            Loading Privacy Settings...
         </option>
      );
   } else {
      privacyOptions = privacyOptionsData.__type.enumValues.map(
         privacyOption => (
            <option value={privacyOption.name} key={privacyOption.name}>
               {privacyOption.name}
            </option>
         )
      );
   }

   useEffect(() => {
      if (formData.category === '' && !memberLoading) {
         setFormData({ ...formData, category: me.defaultCategory.title });
      }
      if (formData.privacy === '' && !memberLoading) {
         setFormData({ ...formData, privacy: me.defaultPrivacy });
      }
   });

   return (
      <StyledNewThingForm
         onSubmit={async e => {
            e.preventDefault();
            const res = await createThing({
               variables: {
                  title: formData.title,
                  link: formData.link,
                  category: formData.category,
                  content: formData.content,
                  tags: formData.tags,
                  privacy: formData.privacy
               }
            });
            resetForm();
            Router.push({
               pathname: '/thing',
               query: {
                  id: res.data.createThing.id
               }
            });
         }}
      >
         <h2>New Thing</h2>
         <Error error={createError} />
         <fieldset disabled={createLoading} aria-busy={createLoading}>
            <input
               type="text"
               id="title"
               name="title"
               placeholder="Title"
               value={formData.title}
               onChange={handleChange}
               required
            />
            <input
               type="url"
               id="link"
               name="link"
               placeholder="Link"
               value={formData.link}
               onChange={handleChange}
            />
            <select
               name="category"
               id="category-select"
               onChange={handleChange}
               value={
                  memberLoading ? formData.category : me.defaultCategory.title
               }
            >
               {categoryOptions}
            </select>
            <textarea
               type="textarea"
               id="content"
               name="content"
               placeholder="Content"
               value={formData.content}
               onChange={handleChange}
            />
            <input
               type="text"
               id="tags"
               name="tags"
               placeholder="Tags"
               value={formData.tags}
               onChange={handleChange}
            />
            <select
               name="privacy"
               id="privacy-select"
               onChange={handleChange}
               value={memberLoading ? formData.privacy : me.defaultPrivacy}
            >
               {privacyOptions}
            </select>
            <button type="submit">Create</button>
         </fieldset>
      </StyledNewThingForm>
   );
};

export default NewThingForm;
