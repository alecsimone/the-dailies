import styled from 'styled-components';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Router from 'next/router';
import Error from '../components/ErrorMessage';
import useMe from '../components/Account/useMe';

const StyledVerificationPage = styled.div`
   max-width: 800px;
   margin: 4rem auto;
`;

const FINISH_SIGNUP_QUERY = gql`
   query FINISH_SIGNUP_QUERY($id: String!, $code: String!) {
      finishSignup(id: $id, code: $code) {
         id
         email
         displayName
         rep
         avatar
      }
   }
`;

const VerificationPage = ({ query }) => {
   const { data, loading, error } = useQuery(FINISH_SIGNUP_QUERY, {
      variables: { id: query.id, code: query.code },
      skip: query == null || query.id == null || query.code == null
   });

   // If they're logged in, tell them they shouldn't be here and redirect them to the homepage
   const { loggedInUserID } = useMe();
   if (loggedInUserID != null && process.browser) {
      Router.push({
         pathname: '/'
      });
      return (
         <StyledVerificationPage>
            You're already verified, silly! Let's get you back home.
         </StyledVerificationPage>
      );
   }

   // If the page has an id and a code, attempt to finish the signup
   if (
      query != null &&
      query.id != null &&
      query.code != null &&
      error == null
   ) {
      if (data && data.finishSignup && data.finishSignup.id === query.id) {
         if (process.browser) {
            Router.push({
               pathname: '/'
            });
         }
         return <StyledVerificationPage>Verified!</StyledVerificationPage>;
      }
      if (
         data &&
         (data.finishSignup == null || data.finishSignup.id !== query.id)
      ) {
         return (
            <StyledVerificationPage>
               <Error
                  error={{
                     message:
                        'Something has gone in the registration process, sorry. Please try again.'
                  }}
               />
            </StyledVerificationPage>
         );
      }
      return <StyledVerificationPage>Verifying...</StyledVerificationPage>;
   }
   if (error) {
      return (
         <StyledVerificationPage>
            <Error error={error} />
         </StyledVerificationPage>
      );
   }

   // If the page doesn't have both an id and a code, tell them their link is bad and they need help
   return (
      <StyledVerificationPage>
         You seem to have clicked a bad verification link. Please try again or
         reach out for some help. Sorry for the trouble.
      </StyledVerificationPage>
   );
};

VerificationPage.getInitialProps = async ctx => ({ query: ctx.query });

export default VerificationPage;
