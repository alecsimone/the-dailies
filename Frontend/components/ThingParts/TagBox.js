import { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';

const ADD_TAG_MUTATION = gql`
   mutation ADD_TAG_MUTATION($tag: String!, $thingID: ID!) {
      addTagToThing(tag: $tag, thingID: $thingID) {
         __typename
         id
         partOfTags {
            __typename
            id
            title
         }
      }
   }
`;

const StyledTagBox = styled.section`
   h5 {
      display: inline-block;
      font-weight: 300;
      font-size: ${props => props.theme.bigText};
   }
   a {
      font-size: ${props => props.theme.bigText};
      font-weight: 300;
   }
   form {
      display: inline-block;
   }
   input {
      font-size: ${props => props.theme.bigText};
      &.loading {
         background: red;
      }
   }
`;

const TagBox = () => {
   const { id, partOfTags: tags } = useContext(ThingContext);
   const tagElements = tags.map((tag, index) => {
      if (index < tags.length - 1)
         return (
            <span key={tag.id}>
               <a>{tag.title}</a>,{' '}
            </span>
         );
      return <a key={tag.id}>{tag.title}</a>;
   });

   const [addTagToThing, { loading: addTagLoading }] = useMutation(
      ADD_TAG_MUTATION
   );
   const [tagInput, setTagInput] = useState('');

   const sendNewTag = async e => {
      e.preventDefault();
      setTagInput('');
      await addTagToThing({
         variables: {
            tag: tagInput,
            thingID: id
         }
      });
   };

   return (
      <StyledTagBox>
         <h5>Tags:</h5> {tagElements}
         <form onSubmit={sendNewTag}>
            <input
               type="text"
               id="addTag"
               name="addTag"
               placeholder="+ tag"
               value={tagInput}
               onChange={e => setTagInput(e.target.value)}
               disabled={addTagLoading}
               className={`addTag ${addTagLoading ? 'loading' : 'ready'}`}
               required
            />
         </form>
      </StyledTagBox>
   );
};

export default TagBox;
