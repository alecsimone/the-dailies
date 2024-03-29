import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import styled from 'styled-components';
import Error from '../ErrorMessage.js';
import StyledForm from '../../styles/StyledForm';
import { CURRENT_MEMBER_QUERY } from './MemberProvider';
import { ModalContext } from '../ModalProvider';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import RequestPasswordReset from './RequestPasswordReset';
import { myThingsQueryCount, MY_THINGS_QUERY } from '../Archives/MyThings.js';

const LOGIN_MUTATION = gql`
   mutation LOGIN_MUTATION($email: String!, $password: String!) {
      login(email: $email, password: $password) {
         id
         email
         displayName
      }
   }
`;

const StyledForgotLink = styled.div`
   text-align: center;
   margin: 2rem auto 4rem;
   a {
      cursor: pointer;
   }
`;

const Login = props => {
   const { redirect, callBack } = props;

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState(null);
   const { setContent } = useContext(ModalContext);

   const [login, { loading }] = useMutation(LOGIN_MUTATION, {
      onError: err => setError(err),
      onCompleted: data => {
         if (redirect !== false) {
            Router.push({
               pathname: '/'
            });
         }
         if (callBack) {
            callBack();
         }
         setContent(false);
      }
   });

   const saveToState = function(e) {
      if (e.target.name === 'email') {
         setEmail(e.target.value);
      }
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
   };

   return (
      <StyledForm
         method="post"
         onSubmit={async e => {
            e.preventDefault();
            await login({
               variables: { email, password },
               refetchQueries: [
                  { query: CURRENT_MEMBER_QUERY },
                  { query: ALL_THINGS_QUERY },
                  {
                     query: MY_THINGS_QUERY,
                     variables: { count: myThingsQueryCount }
                  }
               ]
            }).catch(err => {
               console.log(err.message);
            });
         }}
      >
         <fieldset disabled={loading} aria-busy={loading}>
            <Error error={error} />
            <label htmlFor="email">
               <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={saveToState}
               />
            </label>
            <label htmlFor="password">
               <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={saveToState}
               />
            </label>

            <button type="submit">Log In</button>
         </fieldset>
         <StyledForgotLink className="forgotPassword">
            <a
               className="forgotPasswordLink" // If you change this className, you have to change the clickOutsideDetector on Modal.js to check for a click on the new className
               onClick={e => {
                  e.preventDefault();
                  setContent(<RequestPasswordReset />);
               }}
            >
               Forgot your password?
            </a>
         </StyledForgotLink>
         <div className="cookieWarning">
            When you sign up or log in, we'll put a cookie on your computer. All
            it contains is an encoded representation of your member ID, so we
            can recognize you. It doesn't track you or anything like that, it's
            literally just a string with a property name. By signing up or
            logging in, you're agreeing to let us put that cookie there. Thanks!
         </div>
      </StyledForm>
   );
};
Login.propTypes = {
   redirect: PropTypes.bool,
   callBack: PropTypes.func
};

export default Login;
