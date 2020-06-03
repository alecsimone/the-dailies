import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { StyledTaxContent } from './tag';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { taxFields } from '../lib/CardInterfaces';
import { MemberContext } from '../components/Account/MemberProvider';
import { SINGLE_TAX_QUERY } from './tag';
import { perPage } from '../config';

const SINGLE_STACK_SUBSCRIPTION = gql`
   subscription SINGLE_STACK_SUBSCRIPTION {
      stack {
         node {
            ${taxFields}
         }
      }
   }
`;

const StackContext = React.createContext();
export { StackContext };

const stack = ({ query: { id, title } }) => {
   const { loading, error, data } = useQuery(SINGLE_TAX_QUERY, {
      variables: {
         title,
         personal: true
      }
   });

   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (data && data.taxByTitle && data.taxByTitle.author && me) {
      if (data.taxByTitle.author.id === me.id) {
         canEdit = true;
      }
      if (['Admin', 'Editor', 'Moderator'].includes(me.role)) {
         canEdit = true;
      }
   }

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_STACK_SUBSCRIPTION, {
      variables: { id }
   });

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = 'Unavailable Stack';
      content = <Error error={error} />;
      sidebar = <Sidebar key="error" />;
   }
   if (loading) {
      pageTitle = 'Loading Stack';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading Stack...</p>}
            extraColumnTitle="Stack"
            key="loading"
         />
      );
   } else if (data) {
      if (data.taxByTitle != null) {
         pageTitle = data.taxByTitle.title;
         const sortedThings = data.taxByTitle.connectedThings.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });
         content = (
            <StyledTaxContent className="content">
               <h2>Tag: {title}</h2>
               <Things
                  things={sortedThings}
                  displayType="grid"
                  cardSize="regular"
                  scrollingParentSelector=".mainSection"
                  perPage={perPage}
               />
            </StyledTaxContent>
         );
         sidebar = (
            <Sidebar
               extraColumnContent={
                  <TaxSidebar context={StackContext} canEdit={canEdit} />
               }
               extraColumnTitle="Stack"
               key="stackData"
            />
         );
      } else {
         pageTitle = "Couldn't find stack";
         content = <p>Stack not found.</p>;
         sidebar = <Sidebar key="missingStack" />;
      }
   }

   return (
      <StackContext.Provider value={loading || error || data.taxByTitle}>
         <StyledPageWithSidebar>
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            {sidebar}
            <div className="mainSection">{content}</div>
         </StyledPageWithSidebar>
      </StackContext.Provider>
   );
};
stack.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
   }).isRequired
};
stack.getInitialProps = async ctx => ({ query: ctx.query });

export default stack;
