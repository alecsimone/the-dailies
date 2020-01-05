import styled from 'styled-components';
import Link from 'next/link';
import { makeTransparent } from '../../styles/functions';

const StyledNav = styled.nav`
   img {
      width: ${props => props.theme.smallHead};
      cursor: pointer;
      border: 1px solid ${props => props.theme.highContrastGrey};
      border-radius: 50%;
      padding: 0.8rem;
      opacity: 0.8;
      &:hover {
         opacity: 1;
         background: ${props =>
            makeTransparent(props.theme.lowContrastCoolGrey, 0.1)};
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
