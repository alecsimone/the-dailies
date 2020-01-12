import styled from 'styled-components';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { MemberContext } from '../Account/MemberProvider';
import MemberMenu from './MemberMenu';
import { setAlpha } from '../../styles/functions';

const StyledMemberBox = styled.div`
   color: ${props => props.theme.secondaryAccent};
   display: inline-flex;
   align-items: center;
   font-size: ${props => props.theme.smallText};
   font-weight: 600;
   position: relative;
   z-index: 3;
   a,
   a:visited {
      color: ${props => props.theme.secondaryAccent};
      margin: 1rem;
      cursor: pointer;
      z-index: 3;
   }
   img {
      z-index: 3;
      width: ${props => props.theme.smallHead};
      height: ${props => props.theme.smallHead};
      object-fit: cover;
      border-radius: 50%;
      margin-left: 1rem;
      cursor: pointer;
   }
`;

const MemberBox = () => {
   const { me, loading: memberLoading } = useContext(MemberContext);
   const [memberMenuOpen, setMemberMenuOpen] = useState(false);

   const toggleMemberMenu = () => {
      window.addEventListener('keydown', escapeDetector);
      window.addEventListener('click', clickOutsideDetector);
      setMemberMenuOpen(!memberMenuOpen);
   };

   const escapeDetector = e => {
      if (e.which === 27) {
         setMemberMenuOpen(false);
         window.removeEventListener('click', escapeDetector);
      }
   };

   const clickOutsideDetector = e => {
      if (
         !e.target.classList.contains('MemberMenu') &&
         e.target.id !== 'avatar'
      ) {
         setMemberMenuOpen(false);
         window.removeEventListener('click', clickOutsideDetector);
      }
   };

   if (memberLoading) {
      return (
         <StyledMemberBox className="memberBox">
            <a>...</a>
            <img
               src="/defaultAvatar.jpg"
               alt="avatar"
               id="avatar"
               onClick={() => toggleMemberMenu()}
            />
         </StyledMemberBox>
      );
   }
   if (me == null) {
      return (
         <StyledMemberBox className="memberBox">
            <p>
               <Link href={{ pathname: '/signup' }}>
                  <a>Sign up</a>
               </Link>{' '}
               or{' '}
               <Link href={{ pathname: '/login' }}>
                  <a>Log in</a>
               </Link>
            </p>
         </StyledMemberBox>
      );
   }
   return (
      <StyledMemberBox className="memberBox">
         <Link href={{ pathname: '/me' }}>
            <a
               className={
                  memberMenuOpen ? 'profileLink open' : 'profileLink closed'
               }
            >
               [{me.rep}] {me.displayName}
            </a>
         </Link>
         <img
            src={me.avatar != null ? me.avatar : '/defaultAvatar.jpg'}
            alt="avatar"
            id="avatar"
            onClick={() => toggleMemberMenu()}
         />
         {memberMenuOpen && <MemberMenu />}
      </StyledMemberBox>
   );
};
MemberBox.propTypes = {};

export default MemberBox;
