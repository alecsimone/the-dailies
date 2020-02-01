import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

const StyledHomepage = styled.div`
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
   .homepageContainer {
      flex-basis: 100%;
      @media screen and (min-width: 800px) {
         flex-basis: 75%;
      }
      @media screen and (min-width: 1800px) {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      padding: 2rem 0;
      @media screen and (min-width: 800px) {
         max-height: 100%;
         overflow: hidden;
         ${props => props.theme.scroll};
         padding: 2rem;
      }
   }
`;

const Home = props => (
   <StyledHomepage>
      <Sidebar />
      <div className="homepageContainer">Welcome!</div>
   </StyledHomepage>
);

export default Home;
