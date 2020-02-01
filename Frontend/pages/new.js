import { useEffect } from 'react';
import Router from 'next/router';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';

const NewThing = () => {
   useEffect(() => {
      Router.push({ pathname: '/thing', query: { id: 'new' } });
   });

   return (
      <StyledPageWithSidebar>
         <Sidebar />
         <div className="mainSection">Redirecting...</div>
      </StyledPageWithSidebar>
   );
};
export default NewThing;
