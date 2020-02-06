import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import ErrorMessage from '../ErrorMessage';
import { home } from '../../config';

const FINISH_TWITTER_LOGIN = gql`
   query FINISH_TWITTER_LOGIN($token: String!, $verifier: String!) {
      finishTwitterLogin(token: $token, verifier: $verifier) {
         message
      }
   }
`;

const TwitterLoginFinisher = props => {
   const { oauth_token: token, oauth_verifier: verifier } = props;

   const { loading, error, data } = useQuery(FINISH_TWITTER_LOGIN, {
      variables: {
         token,
         verifier
      }
   });

   if (loading) {
      return <p>Finishing log in...</p>;
   }
   if (error) {
      return <ErrorMessage error={error} />;
   }

   if (process.browswer) {
      window.location.replace(`${home}/twitter`);
   }

   return <p>Refresh and you'll be logged in!</p>;
};
TwitterLoginFinisher.propTypes = {
   oauth_token: PropTypes.string.isRequired,
   oauth_verifier: PropTypes.string.isRequired
};

export default TwitterLoginFinisher;
