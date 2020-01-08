import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

const StyledHomepage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 25%;
   }
   .homepageContainer {
      flex-basis: 75%;
      position: relative;
      max-height: 100%;
      overflow-y: auto;
      scrollbar-color: #262626 black;
      scrollbar-width: thin;
      padding: 2rem;
   }
`;

const Home = props => (
   <StyledHomepage>
      <Sidebar />
      <div className="homepageContainer">Welcome!</div>
   </StyledHomepage>
);

export default Home;
