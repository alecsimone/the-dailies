import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useContext } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import { smallThingCardFields } from '../lib/CardInterfaces';
import LoadingRing from '../components/LoadingRing';
import Things from '../components/Archives/Things';
import MyThings from '../components/Archives/MyThings';
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
   display: flex;
   position: relative;
   height: 100%;
   .content {
      width: 75%;
      max-height: 100%;
      flex-grow: 1;
      padding: 2rem 0;
      overflow: hidden;
      ${props => props.theme.scroll};
      .things .thingCard {
         margin: 0 auto 4rem;
         .thingCard {
            margin: 2rem 0;
         }
      }
      ${props => props.theme.desktopBreakpoint} {
         padding: 2rem;
      }
   }
   .sidebar {
      width: 25%;
      display: none;
      p.emptyThings {
         padding: 0 2rem;
      }
      .list .regularThingCard {
         margin: 0;
      }
      ${props => props.theme.desktopBreakpoint} {
         max-height: 100%;
         display: block;
         background: ${props => props.theme.midBlack};
         overflow: hidden;
         ${props => props.theme.scroll};
      }
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
            scrollingParentSelector=".content"
            perPage={perPage}
         />
      );
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledHomepage className="homepage">
         <div className="content">{content}</div>
         <div className="sidebar">
            <MyThings scrollingSelector=".sidebar" borderSide="left" />
         </div>
      </StyledHomepage>
   );
};

export default Home;
