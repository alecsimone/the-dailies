import Head from 'next/head';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import LoadingRing from '../components/LoadingRing';
import TwitterReader from '../components/Twitter/TwitterReader';
import TwitterLoginStarter from '../components/Twitter/TwitterLoginStarter';
import TwitterLoginFinisher from '../components/Twitter/TwitterLoginFinisher';
import SignupOrLogin from '../components/Account/SignupOrLogin';
import useMe from '../components/Account/useMe';

const twitter = ({ query: { oauth_token, oauth_verifier, listname } }) => {
   const {
      loggedInUserID,
      memberLoading,
      memberFields: { twitterUserName }
   } = useMe('twitter', 'twitterUserName');

   // This page is the gateway. If you're not logged in, it bounces you. If you're logged in but haven't connected twitter, it does that. If you are logged in, it becomes the TwitterReader, which contains its own sidebar.

   let content;
   if (memberLoading) {
      content = <LoadingRing />;
   } else if (loggedInUserID == null) {
      content = <SignupOrLogin explanation styled />;
   } else if (oauth_token && oauth_verifier) {
      content = (
         <TwitterLoginFinisher
            oauth_token={oauth_token}
            oauth_verifier={oauth_verifier}
         />
      );
   } else if (twitterUserName) {
      return <TwitterReader list={listname} />;
   } else {
      content = <TwitterLoginStarter />;
   }

   return (
      <StyledPageWithSidebar>
         <div className="mainSection">{content}</div>
         <Head>
            <title>Twitter Reader - Ouryou</title>
         </Head>
      </StyledPageWithSidebar>
   );
};
twitter.propTypes = {
   query: PropTypes.shape({
      oauth_token: PropTypes.string,
      oauth_verifier: PropTypes.string,
      listname: PropTypes.string
   })
};
twitter.getInitialProps = async ctx => ({ query: ctx.query });

export default twitter;
