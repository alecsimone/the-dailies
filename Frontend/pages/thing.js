import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useEffect, useContext } from 'react';
import Head from 'next/head';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { MemberContext } from '../components/Account/MemberProvider';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import { fullThingFields } from '../lib/CardInterfaces';
import FullThing from '../components/ThingParts/FullThing';
import Sidebar from '../components/Sidebar';

const SINGLE_THING_QUERY = gql`
   query SINGLE_THING_QUERY($id: ID!) {
      thing(where: { id: $id }) {
         ${fullThingFields}
      }
   }
`;
export { SINGLE_THING_QUERY };

const SINGLE_THING_SUBSCRIPTION = gql`
   subscription SINGLE_THING_SUBSCRIPTION($id: ID!) {
      thing(id: $id) {
         node {
            ${fullThingFields}
         }
      }
   }
`;

const ThingContext = React.createContext();
export { ThingContext };

const SingleThing = props => {
   const { loading, error, data } = useQuery(SINGLE_THING_QUERY, {
      variables: { id: props.query.id },
      skip: props.query.id === 'new'
   });

   const { me } = useContext(MemberContext);

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our thing container scroll to the top when we route to a new thing, but wesbos's eslint rules don't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      const containerArray = document.getElementsByClassName(
         'fullThingContainer'
      );
      if (containerArray.length >= 1) {
         containerArray[0].scrollTo(0, 0);
      }
   }, [props.query.id]);
   /* eslint-enable */

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_THING_SUBSCRIPTION, {
      variables: { id: props.query.id },
      skip: props.query.id === 'new'
   });

   let content;
   let pageTitle;
   let thing;
   if (error) {
      content = <Error error={error} />;
      pageTitle = 'Unavailable Thing';
   }
   if (loading) {
      content = <LoadingRing />;
      pageTitle = 'Loading Thing';
   } else if (props.query.id === 'new') {
      content = <FullThing id="new" key="new" canEdit />;
      pageTitle = 'New Thing';
   } else if (data) {
      if (data.thing != null) {
         let canEdit = false;
         if (data && me) {
            if (data.thing.author.id === me.id) {
               canEdit = true;
            }
            if (['Admin', 'Editor', 'Moderator'].includes(me.role)) {
               canEdit = true;
            }
         }

         content = (
            <FullThing
               id={props.query.id}
               key={props.query.id}
               canEdit={canEdit}
            />
         );
      } else {
         content = <p>Thing not found.</p>;
      }
      pageTitle = data.thing == null ? "Couldn't find thing" : data.thing.title;
   }

   let dataForContext;
   if (loading) {
      dataForContext = loading;
   } else if (error) {
      dataForContext = error;
   } else if (props.query.id === 'new') {
      dataForContext = {
         id: 'new'
      };
   } else {
      dataForContext = data.thing;
   }

   return (
      <ThingContext.Provider value={dataForContext}>
         <StyledPageWithSidebar>
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            <Sidebar />
            <div className="mainSection">{content}</div>
         </StyledPageWithSidebar>
      </ThingContext.Provider>
   );
};

export default SingleThing;
