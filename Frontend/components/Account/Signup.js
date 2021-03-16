import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import Error from '../ErrorMessage.js';
import StyledForm from '../../styles/StyledForm';
import { CURRENT_MEMBER_QUERY } from './MemberProvider';
import { ModalContext } from '../ModalProvider';

const SIGNUP_MUTATION = gql`
   mutation SIGNUP_MUTATION(
      $email: String!
      $displayName: String!
      $password: String!
   ) {
      signup(email: $email, displayName: $displayName, password: $password) {
         id
         email
         displayName
         rep
         avatar
      }
   }
`;

const Signup = ({ callBack }) => {
   const [displayName, setDisplayName] = useState('');
   const [password, setPassword] = useState('');
   const [confirmedPassword, setConfirmedPassword] = useState('');
   const [email, setEmail] = useState('');
   const { setContent } = useContext(ModalContext);

   const saveToState = function(e) {
      if (e.target.name === 'displayName') {
         setDisplayName(e.target.value);
      }
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
      if (e.target.name === 'confirmedPassword') {
         setConfirmedPassword(e.target.value);
      }
      if (e.target.name === 'email') {
         setEmail(e.target.value);
      }
   };

   const [signup, { data, loading, error }] = useMutation(SIGNUP_MUTATION, {
      onError: err => alert(err.message)
   });

   return (
      <StyledForm
         method="post"
         onSubmit={async e => {
            e.preventDefault();
            if (password !== confirmedPassword) {
               alert("Yo, your passwords don't match");
               return;
            }
            await signup({
               variables: { email, displayName, password },
               refetchQueries: [{ query: CURRENT_MEMBER_QUERY }]
            }).catch(err => {
               alert(err.message);
            });
            Router.push({
               pathname: '/'
            });
            setContent(false);
            if (callBack) {
               callBack();
            }
         }}
      >
         <fieldset disabled={loading} aria-busy={loading}>
            <Error error={error} />
            <label htmlFor="displayName">
               <input
                  type="text"
                  name="displayName"
                  placeholder="Display Name"
                  maxLength={24}
                  value={displayName}
                  onChange={saveToState}
               />
            </label>
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
            <label htmlFor="confirmedPassword">
               <input
                  type="password"
                  name="confirmedPassword"
                  placeholder="Confirm Password"
                  value={confirmedPassword}
                  onChange={saveToState}
               />
            </label>

            <button type="submit">Sign Up</button>
         </fieldset>
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
Signup.propTypes = {
   callBack: PropTypes.func
};

export default Signup;
