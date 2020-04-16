import Link from 'next/link';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import React from 'react';

const StyledLogoBox = styled.div`
   display: inline-flex;
   align-items: center;
   img {
      width: ${props => props.theme.smallHead};
      margin-top: -4px;
      cursor: pointer;
   }
   a,
   a:visited {
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

const LogoBox = () => (
   <StyledLogoBox className="logoBox">
      <Link href="/">
         <img src="/logo.png" alt="logo" />
      </Link>
      <Link href="/">
         <a>OurDailies</a>
      </Link>
   </StyledLogoBox>
);
LogoBox.propTypes = {};

export default React.memo(LogoBox);
