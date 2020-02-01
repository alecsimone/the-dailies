import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';

const Home = props => (
   <StyledPageWithSidebar>
      <Sidebar />
      <div className="mainSection">Welcome!</div>
   </StyledPageWithSidebar>
);

export default Home;
