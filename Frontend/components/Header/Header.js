import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import NavButtons from './NavButtons';

Router.onRouteChangeStart = () => {
   NProgress.start();
};
Router.onRouteChangeComplete = () => {
   NProgress.done();
};
Router.onRouteChangeError = () => {
   NProgress.done();
};

const StyledHeader = styled.div`
   display: grid;
   grid-template-columns: 1fr auto 1fr;
   width: 94%;
   margin: auto;
   @media screen and (min-width: 800px) {
      width: 100%;
   }
   .memberColumn {
      text-align: right;
   }
`;

const Header = () => (
   <StyledHeader id="header">
      <NavButtons />
      <LogoBox />
      <div className="memberColumn">
         <MemberBox />
      </div>
   </StyledHeader>
);

export default Header;
