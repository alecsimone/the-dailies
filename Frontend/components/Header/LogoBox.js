import Link from 'next/link';
import styled, { ThemeContext } from 'styled-components';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ModalContext } from '../ModalProvider';
import Logo from '../Icons/Logo';

const StyledLogoBox = styled.div`
   display: inline-flex;
   align-items: center;
   a.logo {
      line-height: 0;
      height: ${props => props.theme.smallHead};
      svg {
         width: ${props => props.theme.smallHead};
         cursor: pointer;
         ${props => props.theme.mobileBreakpoint} {
            margin-top: -2px;
         }
      }
   }
   a.name,
   a.name:visited {
      display: none;
      ${props => props.theme.mobileBreakpoint} {
         display: block;
      }
      font-size: ${props => props.theme.bigText};
      font-weight: 300;
      opacity: 0.9;
      margin-left: 1rem;
      color: ${props => props.theme.secondaryAccent};
      :hover {
         text-decoration: none;
      }
   }
`;

const LogoBox = () => {
   const { mobileBPWidthRaw } = useContext(ThemeContext);
   const {
      thingsSidebarIsOpen,
      setThingsSidebarIsOpen,
      navSidebarIsOpen,
      setNavSidebarIsOpen
   } = useContext(ModalContext);
   return (
      <StyledLogoBox className="logoBox">
         <Link href="/">
            <a
               className="logo"
               href="/"
               onClick={e => {
                  if (window.outerWidth <= mobileBPWidthRaw) {
                     e.preventDefault();
                     if (
                        thingsSidebarIsOpen === true &&
                        navSidebarIsOpen === false
                     ) {
                        setThingsSidebarIsOpen(false);
                     }
                     setNavSidebarIsOpen(!navSidebarIsOpen);
                  } else {
                     setThingsSidebarIsOpen(false);
                  }
               }}
            >
               <Logo />
            </a>
         </Link>
         <Link href="/">
            <a className="name" onClick={() => setThingsSidebarIsOpen(false)}>
               Ouryou
            </a>
         </Link>
      </StyledLogoBox>
   );
};
LogoBox.propTypes = {};

export default React.memo(LogoBox);
