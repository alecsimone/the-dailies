import Link from 'next/link';
import styled from 'styled-components';

const StyledLogoBox = styled.div`
   display: inline-flex;
   align-items: center;
   img {
      width: 7rem;
      margin-top: -4px;
      cursor: pointer;
   }
   a,
   a:visited {
      display: none;
      @media screen and (min-width: 800px) {
         display: block;
      }
      font-size: ${props => props.theme.smallHead};
      font-weight: 300;
      opacity: 0.9;
      margin-left: 2rem;
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
         <a>Our Dailies</a>
      </Link>
   </StyledLogoBox>
);

export default LogoBox;
