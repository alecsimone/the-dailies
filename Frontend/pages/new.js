import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useEffect } from 'react';
import Router from 'next/router';
import styled from 'styled-components';
import { MY_THINGS_QUERY } from '../components/Archives/MyThings';

const NEW_BLANK_THING = gql`
   mutation NEW_BLANK_THING {
      newBlankThing {
         __typename
         id
      }
   }
`;
export { NEW_BLANK_THING };

const StyledNewThing = styled.section`
   position: relative;
   padding: 2rem;
`;

const NewThing = () => {
   const [newBlankThing] = useMutation(NEW_BLANK_THING, {
      onCompleted: data => {
         console.log('yeah, that happened');
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id }
         });
      },
      onError: err => alert(err.message),
      context: {
         debounceKey: 'newThing'
      },
      refetchQueries: [
         {
            query: MY_THINGS_QUERY
         }
      ]
   });

   useEffect(() => {
      newBlankThing();
   }, [newBlankThing]);

   return <StyledNewThing>Creating thing...</StyledNewThing>;
};
export default NewThing;
