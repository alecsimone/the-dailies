import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

const StyledHomepage = styled.div`
   display: flex;
   flex-wrap: wrap;
   ${props => props.theme.desktopBreakpoint} {
      flex-wrap: nowrap;
   }
   .sidebar {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 25%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 20%;
      }
   }
   .homepageContainer {
      flex-basis: 100%;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 75%;
      }
      ${props => props.theme.bigScreenBreakpoint} {
         flex-basis: 80%;
      }
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      padding: 2rem 0;
      ${props => props.theme.desktopBreakpoint} {
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
