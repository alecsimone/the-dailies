import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import { useState } from 'react';
import PropTypes from 'prop-types';
import LogoBox from './LogoBox';
import MemberBox from './MemberBox';
import NavButtons from './NavButtons';
import { setAlpha, setLightness } from '../../styles/functions';

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
   background: ${props => setLightness(props.theme.black, 1)};
   padding: 0.5rem 0;
   .headerContents {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      .navButtons {
         display: none;
      }
      ${props => props.theme.mobileBreakpoint} {
         padding: 0 4rem;
         grid-template-columns: 1fr auto 1fr;
         &.showSearch {
            grid-template-columns: 1fr;
            .memberColumn,
            .logoBox {
               display: none;
            }
            ${props => props.theme.desktopBreakpoint} {
               grid-template-columns: 1fr auto 1fr;
               .memberColumn {
                  display: block;
               }
               .logoBox {
                  display: flex;
               }
            }
         }
         .navButtons {
            display: flex;
         }
      }
      padding: 0 2rem;
      margin: auto;
      .memberColumn {
         text-align: right;
         z-index: 1;
      }
   }
`;

const Header = () => {
   const [showSearch, setShowSearch] = useState(false);
   return (
      <StyledHeader id="header">
         <div className={`headerContents${showSearch ? ' showSearch' : ''}`}>
            <NavButtons showSearch={showSearch} setShowSearch={setShowSearch} />
            <LogoBox />
            <div className="memberColumn">
               <MemberBox />
            </div>
         </div>
      </StyledHeader>
   );
};
Header.propTypes = {};

export default Header;
