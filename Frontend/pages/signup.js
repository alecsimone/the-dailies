import { useContext } from 'react';
import Signup from '../components/Account/Signup.js';
import { home } from '../config';
import { MemberContext } from '../components/Account/MemberProvider';

const SignupPage = () => {
   const { me } = useContext(MemberContext);
   if (me != null && process.browser) {
      window.location.replace(home);
      return (
         <div>You're already logged in, silly! Let's get you back home.</div>
      );
   }
   return <Signup />;
};

export default SignupPage;
