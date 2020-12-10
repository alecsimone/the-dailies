import { useContext } from 'react';
import { home } from '../config';
import Login from '../components/Account/Login.js';
import { MemberContext } from '../components/Account/MemberProvider';

const LoginPage = () => {
   const { me } = useContext(MemberContext);
   if (me != null && process.browser) {
      window.location.replace(home);
      return (
         <div>You're already logged in, silly! Let's get you back home.</div>
      );
   }
   return <Login />;
};

export default LoginPage;
