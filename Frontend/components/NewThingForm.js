import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/react-hooks';
import Router from 'next/router';
import Error from './ErrorMessage.js';
import { MemberContext } from './Account/MemberProvider';
import { fullThingFields } from '../lib/CardInterfaces';

const CREATE_THING_MUTATION = gql`
   mutation CREATE_THING_MUTATION(
      $title: String!
      $link: String
      $content: String
      $tags: String
      $privacy: String
   ) {
      createThing(
         title: $title
         link: $link
         content: $content
         tags: $tags
         privacy: $privacy
      ) {
         ${fullThingFields}
      }
   }
`;

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
   margin: 2rem auto;
   text-align: center;
   height: 100%;
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

const NewThingForm = () => {
   const [
      createThing,
      { data: createData, loading: createLoading, error: createError }
   ] = useMutation(CREATE_THING_MUTATION);

   const { me, loading: memberLoading } = useContext(MemberContext);

   const [formData, setFormData] = useState({
      title: '',
      link: '',
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
         content: '',
         tags: '',
         privacy: me.defaultPrivacy
      });
   };

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
                  content: formData.content,
                  tags: formData.tags,
                  privacy: formData.privacy
               }
            }).catch(err => {
               alert(err.message);
            });
            Router.push({
               pathname: '/thing',
               query: {
                  id: res.data.createThing.id
               }
            });
            resetForm();
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
               value={formData.privacy}
            >
               {privacyOptions}
            </select>
            <button type="submit">Create</button>
         </fieldset>
      </StyledNewThingForm>
   );
};
NewThingForm.propTypes = {};

export default NewThingForm;
