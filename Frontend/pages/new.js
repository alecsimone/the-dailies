import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useEffect } from 'react';
import Router from 'next/router';
import styled from 'styled-components';
import {
   myThingsQueryCount,
   MY_THINGS_QUERY
} from '../components/Archives/MyThings';
import { fullThingFields } from '../lib/CardInterfaces';

const NEW_BLANK_THING = gql`
   mutation NEW_BLANK_THING {
      newBlankThing {
         ${fullThingFields}
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
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id, new: true }
         });
      },
      onError: err => alert(err.message),
      context: {
         debounceKey: 'newThing'
      },
      refetchQueries: [
         { query: MY_THINGS_QUERY, variables: { count: myThingsQueryCount } }
      ]
   });

   useEffect(() => {
      newBlankThing();
   }, [newBlankThing]);

   return <StyledNewThing>Creating thing...</StyledNewThing>;
};
export default NewThing;
