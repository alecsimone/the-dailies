import styled from 'styled-components';
import { useEffect } from 'react';
import Router from 'next/router';
import Sidebar from '../components/Sidebar';

const StyledNew = styled.div`
   display: flex;
   flex-wrap: wrap;
   @media screen and (min-width: 800px) {
      flex-wrap: nowrap;
   }
   .sidebar {
      flex-basis: 100%;
      @media screen and (min-width: 800px) {
         flex-basis: 25%;
      }
      @media screen and (min-width: 1800px) {
         flex-basis: 20%;
      }
   }
   .container {
      flex-basis: 100%;
      @media screen and (min-width: 800px) {
         flex-basis: 75%;
      }
      @media screen and (min-width: 1800px) {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      padding: 2rem;
   }
`;

const NewThing = () => {
   useEffect(() => {
      Router.push({ pathname: '/thing', query: { id: 'new' } });
   });

   return (
      <StyledNew>
         <Sidebar />
         <div className="container">Redirecting...</div>
      </StyledNew>
   );
};
export default NewThing;
