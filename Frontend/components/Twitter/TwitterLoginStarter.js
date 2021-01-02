import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTwitterLogin = styled.div`
   text-align: center;
   padding-top: 4rem;
   button.login {
      padding: 0.5rem;
      font-size: ${props => props.theme.smallText};
   }
`;

const START_TWITTER_LOGIN = gql`
   mutation START_TWITTER_LOGIN {
      initiateTwitterLogin {
         message
      }
   }
`;

const TwitterLoginStarter = () => {
   const [initiateTwitterLogin] = useMutation(START_TWITTER_LOGIN, {
      onError: err => alert(err.message)
   });

   const startLogin = async () => {
      const { data } = await initiateTwitterLogin().catch(err => {
         alert(err.message);
      });
      window.location.replace(data.initiateTwitterLogin.message);
   };

   return (
      <StyledTwitterLogin>
         <button className="login" onClick={startLogin}>
            Log in with Twitter
         </button>
      </StyledTwitterLogin>
   );
};
TwitterLoginStarter.propTypes = {};

export default TwitterLoginStarter;
