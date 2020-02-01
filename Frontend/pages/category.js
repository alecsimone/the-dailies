import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import Head from 'next/head';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
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

const StyledCategoryPage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 100%;
      flex-wrap: wrap;
      ${props => props.theme.desktopBreakpoint} {
         flex-basis: 25%;
      }
   }
   .categoryContainer {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
      .things {
         position: absolute;
         top: 3rem;
         left: 3%;
         width: 94%;
         max-height: 100%;
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
         siidebar = <Sidebar key="missingCategory" />;
      }
   }

   return (
      <CategoryContext.Provider
         value={loading || error || data.categoryByTitle}
      >
         <StyledCategoryPage>
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            {sidebar}
            <div className="categoryContainer">{content}</div>
         </StyledCategoryPage>
      </CategoryContext.Provider>
   );
};
category.propTypes = {
   query: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
   }).isRequired
};

export default category;
