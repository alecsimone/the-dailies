import { useState, useContext } from 'react';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import StyledForm from '../../styles/StyledForm';
import { ModalContext } from '../ModalProvider';
import Error from '../ErrorMessage';

const REQUEST_PASSWORD_RESET_MUTATION = gql`
   mutation REQUEST_PASSWORD_RESET_MUTATION($email: String!) {
      requestReset(email: $email) {
         id
         email
      }
   }
`;

const StyledConfirmation = styled.div`
   text-align: center;
   button.extraClose {
      position: relative;
      display: block;
      margin: 4rem auto;
      cursor: pointer;
      font-size: ${props => props.theme.smallText};
      color: ${props => props.theme.mainText};
      border: 1px solid ${props => props.theme.mainText};
      opacity: 0.75;
      &:hover {
         opacity: 1;
      }
   }
`;

const RequestPasswordReset = () => {
   const [requestReceived, setRequestReceived] = useState(false);
   const [error, setError] = useState(null);

   const [email, setEmail] = useState('');
   const { setContent } = useContext(ModalContext);

   const [requestReset, { loading }] = useMutation(
      REQUEST_PASSWORD_RESET_MUTATION,
      {
         onCompleted: data => setRequestReceived(true)
      }
   );

   const saveToState = e => {
      if (e.target.name === 'email') {
         setEmail(e.target.value);
      }
   };

   if (requestReceived) {
      return (
         <StyledConfirmation>
            <h3>Request received!</h3>
            <p>
               If an account exists to match the email address you entered,
               you'll receive an email soon with a link to reset your password.
            </p>
            <button className="extraClose" onClick={() => setContent(false)}>
               Return To Site
            </button>
         </StyledConfirmation>
      );
   }
   return (
      <StyledForm
         onSubmit={async e => {
            e.preventDefault();
            if (email === '') {
               alert('You need to enter an email, friend');
               return;
            }
            await requestReset({
               variables: { email }
            }).catch(err => {
               console.log(err.message);
            });
         }}
      >
         Enter your email to reset your password. If an account exists with that
         email, a link will be sent to it which will allow you to create a new
         password.
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
            <button type="submit">Reset</button>
         </fieldset>
      </StyledForm>
   );
};

export default RequestPasswordReset;
