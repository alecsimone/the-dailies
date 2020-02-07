import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useEffect } from 'react';
import Router from 'next/router';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';

const NEW_BLANK_THING = gql`
   mutation NEW_BLANK_THING {
      newBlankThing {
         __typename
         id
      }
   }
`;
export { NEW_BLANK_THING };

const NewThing = () => {
   const [newBlankThing] = useMutation(NEW_BLANK_THING, {
      onCompleted: data => {
         Router.push({
            pathname: '/thing',
            query: { id: data.newBlankThing.id }
         });
      }
   });

   useEffect(() => {
      newBlankThing();
   }, [newBlankThing]);

   return (
      <StyledPageWithSidebar>
         <Sidebar />
         <div className="mainSection">Creating thing...</div>
      </StyledPageWithSidebar>
   );
};
export default NewThing;
