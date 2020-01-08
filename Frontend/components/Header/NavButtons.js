import styled from 'styled-components';
import Link from 'next/link';
import { setAlpha } from '../../styles/functions';

const StyledNav = styled.nav`
   display: flex;
   align-items: center;
   img {
      width: ${props => props.theme.bigText};
      cursor: pointer;
      /* border: 1px solid ${props => props.theme.highContrastGrey}; */
      border-radius: 50%;
      padding: 0rem;
      opacity: 0.8;
      &:hover {
         opacity: 1;
         background: ${props => setAlpha(props.theme.lowContrastCoolGrey, 0.1)};
      }
      &.newPost {
         filter: saturate(0);
      }
   }
`;

const NavButtons = props => (
   <StyledNav className="navButtons">
      <Link href="/new">
         <img src="/green-plus.png" className="newPost" alt="New Post" />
      </Link>
   </StyledNav>
);

export default NavButtons;
