import Head from 'next/head';
import { useContext } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MemberContext } from '../components/Account/MemberProvider';
import LoadingRing from '../components/LoadingRing';
import TwitterReader from '../components/Twitter/TwitterReader';
import TwitterLoginStarter from '../components/Twitter/TwitterLoginStarter';
import TwitterLoginFinisher from '../components/Twitter/TwitterLoginFinisher';
import Sidebar from '../components/Sidebar';

const StyledTwitterPage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 25%;
   }
   .twitterContent {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
   }
`;

const twitter = props => {
   const {
      query: { oauth_token, oauth_verifier, list }
   } = props;
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
      return <TwitterReader list={list} />;
   } else {
      content = <TwitterLoginStarter />;
   }

   return (
      <StyledTwitterPage>
         {sidebar}
         <div className="twitterContent">{content}</div>
         <Head>
            <title>Twitter Reader - OurDailies</title>
         </Head>
      </StyledTwitterPage>
   );
};
twitter.propTypes = {
   query: PropTypes.shape({
      oauth_token: PropTypes.string,
      oauth_verifier: PropTypes.string,
      list: PropTypes.string
   })
};

export default twitter;
