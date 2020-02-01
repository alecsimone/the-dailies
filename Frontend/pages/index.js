import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';
import PublicThings from '../components/Archives/PublicThings';

const Home = props => (
   <StyledPageWithSidebar>
      <Sidebar />
      <div className="mainSection">
         <PublicThings displayType="grid" />
      </div>
   </StyledPageWithSidebar>
);

export default Home;
