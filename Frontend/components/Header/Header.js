import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import NavButtons from './NavButtons';
import { makeTransparent } from '../../styles/functions';

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
   border-bottom: 3px solid
      ${props => makeTransparent(props.theme.lowContrastCoolGrey, 0.25)};
   margin-bottom: 2rem;
   .headerContents {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      width: 94%;
      margin: auto;
      margin-bottom: 2rem;
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
