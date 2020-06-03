import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';
import ErrorMessage from '../components/ErrorMessage';
import { smallThingCardFields } from '../lib/CardInterfaces';
import LoadingRing from '../components/LoadingRing';
import Things from '../components/Archives/Things';
import { perPage } from '../config';

const ALL_THINGS_QUERY = gql`
   query ALL_THINGS_QUERY {
      allThings {
         ${smallThingCardFields}
      }
   }
`;
export { ALL_THINGS_QUERY };

const Home = props => {
   const { data, loading, error } = useQuery(ALL_THINGS_QUERY);

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   } else if (data) {
      content = (
         <Things
            things={data.allThings}
            cardSize="regular"
            displayType="grid"
            scrollingParentSelector=".mainSection"
            perPage={perPage}
         />
      );
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledPageWithSidebar className="styledPageWithSidebar">
         <Sidebar />
         <div className="mainSection">{content}</div>
      </StyledPageWithSidebar>
   );
};

export default Home;
