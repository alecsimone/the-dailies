import Head from 'next/head';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import LoadingRing from '../components/LoadingRing';
import TwitterReader from '../components/Twitter/TwitterReader';
import TwitterLoginStarter from '../components/Twitter/TwitterLoginStarter';
import TwitterLoginFinisher from '../components/Twitter/TwitterLoginFinisher';
import Sidebar from '../components/Sidebar';

const twitter = ({ query: { oauth_token, oauth_verifier, listname } }) => {
   const { me, loading } = useContext(MemberContext);

   let content;
   let sidebar;
   if (loading) {
      content = <LoadingRing />;
      sidebar = <Sidebar />;
   } else if (me == null) {
      content = <p>Members only.</p>;
      sidebar = <Sidebar />;
   } else if (oauth_token && oauth_verifier) {
      content = (
         <TwitterLoginFinisher
            oauth_token={oauth_token}
            oauth_verifier={oauth_verifier}
         />
      );
      sidebar = <Sidebar />;
   } else if (me.twitterUserName) {
      return <TwitterReader list={listname} />;
   } else {
      content = <TwitterLoginStarter />;
   }

   return (
      <StyledPageWithSidebar>
         {sidebar}
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
