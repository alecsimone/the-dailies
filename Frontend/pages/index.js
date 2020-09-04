import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
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

const StyledHomepage = styled.section`
   padding: 2rem 0;
   .things .thingCard {
      margin: auto;
   }
`;

const Home = props => {
   const { data, loading, error } = useQuery(ALL_THINGS_QUERY, { ssr: false });

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   } else if (data) {
      content = (
         <Things
            things={data.allThings}
            cardSize="regular"
            displayType="list"
            scrollingParentSelector=".mainSection"
            perPage={perPage}
         />
      );
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledHomepage className="homepage">
         <div className="mainSection">{content}</div>
      </StyledHomepage>
   );
};

export default Home;
