import styled from 'styled-components';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { setAlpha } from '../../styles/functions';

const StyledNav = styled.nav`
   display: flex;
   align-items: center;
   line-height: 0;
   img {
      width: ${props => props.theme.bigText};
      cursor: pointer;
      /* border: 1px solid ${props => props.theme.highContrastGrey}; */
      border-radius: 50%;
      padding: 0rem;
      opacity: 0.8;
      &:hover {
         opacity: 1;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
      }
      &.newPost {
         filter: saturate(0);
      }
   }
`;

const NavButtons = () => (
   <StyledNav className="navButtons">
      <Link href={{ pathname: 'thing', query: { id: 'new' } }}>
         <a href="/thing?id=new">
            <img src="/green-plus.png" className="newPost" alt="New Post" />
         </a>
      </Link>
   </StyledNav>
);
NavButtons.propTypes = {};

export default NavButtons;
