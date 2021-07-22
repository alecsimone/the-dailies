import Link from 'next/link';
import { useContext } from 'react';
import styled from 'styled-components';
import { ModalContext } from '../ModalProvider';
import Login from './Login';
import Signup from './Signup';

const StyledSignupOrLogin = styled.div`
   &.styled {
      text-align: center;
      p {
         display: inline-block;
         background: ${props => props.theme.deepBlack};
         padding: 2rem;
         border-radius: 4px;
      }
   }
`;

const SignupOrLogin = ({ explanation, styled }) => {
   const { setContent } = useContext(ModalContext);
   return (
      <StyledSignupOrLogin className={styled ? 'styled' : 'unstyled'}>
         <p>
            {explanation && <span>Members only. </span>}
            <Link href={{ pathname: '/signup' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Signup />);
                  }}
               >
                  Sign up
               </a>
            </Link>{' '}
            or{' '}
            <Link href={{ pathname: '/login' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Login redirect={false} />);
                  }}
               >
                  Log in
               </a>
            </Link>
         </p>
      </StyledSignupOrLogin>
   );
};
export default SignupOrLogin;
