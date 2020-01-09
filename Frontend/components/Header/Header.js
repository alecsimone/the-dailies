import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import NavButtons from './NavButtons';
import { setAlpha } from '../../styles/functions';

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
   grid-column: -1 / 1;
   border-bottom: 3px solid
      ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   background: ${props => props.theme.black};
   padding: 0.5rem 0;
   .headerContents {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      padding: 0 4rem;
      margin: auto;
      .memberColumn {
         text-align: right;
      }
   }
`;

const Header = () => (
   <StyledHeader id="header">
      <div className="headerContents">
         <NavButtons />
         <LogoBox />
         <div className="memberColumn">
            <MemberBox />
         </div>
      </div>
   </StyledHeader>
);

export default Header;
