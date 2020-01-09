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
      padding: 2rem;
      ${props => props.theme.scroll};
   }
`;

const Home = props => (
   <StyledHomepage>
      <Sidebar />
      <div className="homepageContainer">Welcome!</div>
   </StyledHomepage>
);

export default Home;
