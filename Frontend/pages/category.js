import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import Sidebar from '../components/Sidebar';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import TaxSidebar from '../components/TaxSidebar';
import Things from '../components/Archives/Things';
import { catFields } from '../lib/CardInterfaces';

const SINGLE_CATEGORY_QUERY = gql`
   query SINGLE_CATEGORY_QUERY($title: String!) {
      categoryByTitle(title: $title) {
         ${catFields}
      }
   }
`;
export { SINGLE_CATEGORY_QUERY };

const SINGLE_CATEGORY_SUBSCRIPTION = gql`
   subscription SINGLE_CATEGORY_SUBSCRIPTION {
      category {
         node {
            ${catFields}
         }
      }
   }
`;

const CategoryContext = React.createContext();
export { CategoryContext };

const category = props => {
   const {
      query: { id, title }
   } = props;
   const { loading, error, data } = useQuery(SINGLE_CATEGORY_QUERY, {
      variables: {
         title
      }
   });

   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (me && ['Admin', 'Editor', 'Moderator'].includes(me.role)) {
      canEdit = true;
   }

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_CATEGORY_SUBSCRIPTION, {
      variables: { id }
   });

   let pageTitle;
   let content;
   let sidebar;
   if (error) {
      pageTitle = 'Unavailable Category';
      content = <Error error={error} />;
      sidebar = <Sidebar key="error" />;
   }
   if (loading) {
      pageTitle = 'Loading Category';
      content = <LoadingRing />;
      sidebar = (
         <Sidebar
            extraColumnContent={<p>Loading Category...</p>}
            extraColumnTitle="Category"
            key="loading"
         />
      );
   } else if (data) {
      console.log(data);
      if (data.categoryByTitle != null) {
         pageTitle = data.categoryByTitle.title;
         const sortedThings = data.categoryByTitle.connectedThings.sort(
            (a, b) => {
               const aDate = new Date(a.createdAt);
               const bDate = new Date(b.createdAt);
               return bDate - aDate;
            }
         );
         content = (
            <Things
               things={sortedThings}
               displayType="grid"
               cardSize="regular"
            />
         );
         sidebar = (
            <Sidebar
               extraColumnContent={
                  <TaxSidebar context={CategoryContext} canEdit={canEdit} />
               }
               extraColumnTitle="Category"
               key="catData"
            />
         );
      } else {
         pageTitle = "Couldn't find category";
         content = <p>Category not found.</p>;
         sidebar = <Sidebar key="missingCategory" />;
      }
   }

   return (
      <CategoryContext.Provider
         value={loading || error || data.categoryByTitle}
      >
         <StyledPageWithSidebar>
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            {sidebar}
            <div className="mainSection">{content}</div>
         </StyledPageWithSidebar>
      </CategoryContext.Provider>
   );
};
category.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
   }).isRequired
};
category.getInitialProps = async ctx => ({ query: ctx.query });

export default category;
