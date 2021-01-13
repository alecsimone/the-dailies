import Head from 'next/head';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import LoadingRing from '../components/LoadingRing';
import TwitterReader from '../components/Twitter/TwitterReader';
import TwitterLoginStarter from '../components/Twitter/TwitterLoginStarter';
import TwitterLoginFinisher from '../components/Twitter/TwitterLoginFinisher';

const twitter = ({ query: { oauth_token, oauth_verifier, listname } }) => {
   const { me, loading } = useContext(MemberContext);

   // This page is the gateway. If you're not logged in, it bounces you. If you're logged in but haven't connected twitter, it does that. If you are logged in, it becomes the TwitterReader, which contains its own sidebar.

   let content;
   if (loading) {
      content = <LoadingRing />;
   } else if (me == null) {
      content = <p>Members only.</p>;
   } else if (oauth_token && oauth_verifier) {
      content = (
         <TwitterLoginFinisher
            oauth_token={oauth_token}
            oauth_verifier={oauth_verifier}
         />
      );
   } else if (me.twitterUserName) {
      return <TwitterReader list={listname} />;
   } else {
      content = <TwitterLoginStarter />;
   }

   return (
      <StyledPageWithSidebar>
         <div className="mainSection">{content}</div>
         <Head>
            <title>Twitter Reader - OurDailies</title>
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
