import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import Error from '../ErrorMessage.js';
import StyledForm from '../../styles/StyledForm';
import { CURRENT_MEMBER_QUERY } from './MemberProvider';
import { ModalContext } from '../ModalProvider';
import { ALL_THINGS_QUERY } from '../../pages/index';

const LOGIN_MUTATION = gql`
   mutation LOGIN_MUTATION($email: String!, $password: String!) {
      login(email: $email, password: $password) {
         id
         email
         displayName
      }
   }
`;

const Login = props => {
   const { redirect, callBack } = props;

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);

   const { setContent } = useContext(ModalContext);

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
                  { query: ALL_THINGS_QUERY }
               ]
            });
            if (redirect !== false) {
               Router.push({
                  pathname: '/'
               });
               setContent(false);
            }
            if (callBack) {
               callBack();
            }
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
      </StyledForm>
   );
};
Login.propTypes = {
   redirect: PropTypes.bool,
   callBack: PropTypes.func
};

export default Login;
