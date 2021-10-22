import { home } from '../config';
import Login from '../components/Account/Login.js';
import useMe from '../components/Account/useMe';

const LoginPage = () => {
   const { loggedInUserID } = useMe();
   if (loggedInUserID != null && process.browser) {
      window.location.replace(home);
      return (
         <div>You're already logged in, silly! Let's get you back home.</div>
      );
   }
   return <Login />;
};

export default LoginPage;
