import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';

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
   display: flex;
   align-items: center;
   justify-content: space-between;
   flex-wrap: wrap;
   width: 94%;
   margin: auto;
   @media screen and (min-width: 800px) {
      width: 100%;
   }
   .logoBox {
      margin-right: 2rem;
   }
`;

const Header = () => (
   <StyledHeader id="header">
      <LogoBox />
      <MemberBox />
   </StyledHeader>
);

export default Header;
