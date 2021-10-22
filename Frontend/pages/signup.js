import Signup from '../components/Account/Signup.js';
import { home } from '../config';
import useMe from '../components/Account/useMe.js';

const SignupPage = () => {
   const { loggedInUserID } = useMe();
   if (loggedInUserID != null && process.browser) {
      window.location.replace(home);
      return (
         <div>You're already logged in, silly! Let's get you back home.</div>
      );
   }
   return <Signup />;
};

export default SignupPage;
