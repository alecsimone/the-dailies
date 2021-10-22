import styled from 'styled-components';
import { useContext, useState } from 'react';
import Router from 'next/router';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { CURRENT_MEMBER_QUERY } from '../components/Account/MemberProvider';
import { ModalContext } from '../components/ModalProvider';
import Error from '../components/ErrorMessage';
import StyledForm from '../styles/StyledForm';
import Login from '../components/Account/Login';
import useMe from '../components/Account/useMe';

const StyledResetPage = styled.div`
   max-width: 800px;
   margin: 4rem auto;
   &.resetForm,
   &.resetComplete {
      background: ${props => props.theme.midBlack};
      padding: 4rem;
      p.prompt {
         text-align: center;
      }
      a.loginLink {
         cursor: pointer;
      }
   }
   &.resetComplete {
      text-align: center;
   }
`;

const FINISH_RESET_QUERY = gql`
   query FINISH_RESET_QUERY($id: String!, $code: String!) {
      finishReset(id: $id, code: $code) {
         id
         email
         displayName
         rep
         avatar
      }
   }
`;

const CHANGE_PASSWORD_MUTATION = gql`
   mutation CHANGE_PASSWORD_MUTATION(
      $id: String!
      $code: String!
      $password: String!
   ) {
      changePassword(id: $id, code: $code, password: $password) {
         id
         email
         displayName
         rep
         avatar
      }
   }
`;

const PasswordResetPage = ({ query }) => {
   const [resetError, setResetError] = useState(null);
   const [resetApproved, setResetApproved] = useState(false);
   const [resetComplete, setResetComplete] = useState(false);

   const [password, setPassword] = useState('');
   const [confirmedPassword, setConfirmedPassword] = useState('');

   const saveToState = function(e) {
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
      if (e.target.name === 'confirmedPassword') {
         setConfirmedPassword(e.target.value);
      }
   };

   const { data, error } = useQuery(FINISH_RESET_QUERY, {
      variables: { id: query.id, code: query.code },
      skip: query == null || query.id == null || query.code == null,
      onCompleted: data => setResetApproved(true)
   });

   const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION, {
      variables: {
         id: query.id,
         code: query.code,
         password
      },
      refetchQueries: [{ query: CURRENT_MEMBER_QUERY }],
      onCompleted: () => {
         setResetComplete(true);
         setResetApproved(false);
      }
   });

   const { setContent } = useContext(ModalContext);

   // If they're logged in, tell them they shouldn't be here and redirect them to the homepage
   const { loggedInUserID } = useMe();
   if (loggedInUserID != null && process.browser) {
      Router.push({
         pathname: '/'
      });
      return (
         <StyledResetPage>
            You're already logged in, silly! Let's get you back home.
         </StyledResetPage>
      );
   }

   if (resetComplete) {
      return (
         <StyledResetPage className="resetComplete">
            Reset complete!{' '}
            <a className="loginLink" onClick={() => setContent(<Login />)}>
               Log in
            </a>{' '}
            to get going.
         </StyledResetPage>
      );
   }

   if (resetApproved) {
      return (
         <StyledResetPage className="resetForm">
            <StyledForm
               onSubmit={async e => {
                  e.preventDefault();
                  if (password !== confirmedPassword) {
                     setResetError({
                        message: "Yo, your passwords don't match"
                     });
                  }
                  await changePassword();
               }}
            >
               <p className="prompt">Please enter a new password</p>
               <fieldset disabled={loading} aria-busy={loading}>
                  <Error error={resetError} />
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
                  <button type="submit">Change Password</button>
               </fieldset>
            </StyledForm>
         </StyledResetPage>
      );
   }

   // If the page has an id and a code, attempt to finish the reset
   if (
      query != null &&
      query.id != null &&
      query.code != null &&
      error == null
   ) {
      if (
         (data && data.finishReset == null) ||
         (data && data.finishReset.id !== query.id)
      ) {
         return (
            <StyledResetPage>
               <Error
                  error={{
                     message:
                        'Something has gone in the reset process, sorry. Please try again.'
                  }}
               />
            </StyledResetPage>
         );
      }
      return <StyledResetPage>Verifying...</StyledResetPage>;
   }

   if (error) {
      return (
         <StyledResetPage>
            <Error error={error} />
         </StyledResetPage>
      );
   }

   // If the page doesn't have both an id and a code, tell them their link is bad and they need help
   return (
      <StyledResetPage>
         You seem to have clicked a bad verification link. Please try again or
         reach out for some help. Sorry for the trouble.
      </StyledResetPage>
   );
};

PasswordResetPage.getInitialProps = async ctx => ({ query: ctx.query });

export default PasswordResetPage;
