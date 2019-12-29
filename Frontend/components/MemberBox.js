import styled from 'styled-components';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { MemberContext } from './MemberProvider';

const StyledMemberBox = styled.div`
   color: ${props => props.theme.secondaryAccent};
   background: ${props => props.theme.background};
   display: inline-flex;
   align-items: center;
   font-size: ${props => props.theme.bigText};
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
      width: 6rem;
      height: 6rem;
      object-fit: cover;
      border-radius: 50%;
      margin-left: 3rem;
      cursor: pointer;
   }
   .userMenu {
      position: absolute;
      display: block;
      border-radius: 4px;
      right: -2rem;
      top: -1rem;
      width: calc(100% + 3rem);
      background: ${props => props.theme.solidLowContrastCoolGrey};
      padding-top: 8rem;
      z-index: 2;
      color: ${props => props.theme.mainText};
      font-size: ${props => props.theme.smallText};
      border: 1px solid ${props => props.theme.lowContrastGrey};
      .userMenuLinkRow {
         padding: 1rem;
         cursor: pointer;
         text-align: center;
         &:hover {
            background: ${props => props.theme.lowContrastCoolGrey};
            text-decoration: underline;
         }
      }
      a {
         color: ${props => props.theme.mainText};
      }
      &.closed {
         display: none;
      }
   }
`;

const MemberBox = () => {
   const me = useContext(MemberContext);
   console.log(me);
   const [userMenuOpen, setUserMenuOpen] = useState(false);

   const toggleUserMenu = () => {
      console.log('He wants to show the user menu');
   };

   if (me === 'loading')
      return (
         <StyledMemberBox className="memberBox">
            <p>...</p>
         </StyledMemberBox>
      );
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
                  userMenuOpen ? 'profileLink open' : 'profileLink closed'
               }
            >
               [{me.rep}] {me.displayName}
            </a>
         </Link>
         <img
            src={me.avatar != null ? me.avatar : '/defaultAvatar.jpg'}
            alt="avatar"
            id="avatar"
            onClick={() => toggleUserMenu()}
         />
      </StyledMemberBox>
   );
};

export default MemberBox;
