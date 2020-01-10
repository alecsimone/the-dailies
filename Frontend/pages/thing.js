import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import Head from 'next/head';
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

const SingleThingContainer = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 25%;
   }
   .fullThingContainer {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
   }
`;

const ThingContext = React.createContext();
export { ThingContext };

const SingleThing = props => {
   const { loading, error, data } = useQuery(SINGLE_THING_QUERY, {
      variables: { id: props.query.id }
   });

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
      variables: { id: props.query.id }
   });

   if (error) return <Error error={error} />;

   let content;
   let pageTitle;
   let thing;
   if (data) {
      if (data.thing != null) {
         thing = <FullThing id={props.query.id} key={props.query.id} />;
      } else {
         thing = <p>Thing not found.</p>;
      }
      content = (
         <>
            <Sidebar />
            <div className="fullThingContainer">{thing}</div>
         </>
      );
      pageTitle = data.thing == null ? "Couldn't find thing" : data.thing.title;
   } else if (loading) {
      content = <LoadingRing />;
      pageTitle = 'Loading Thing';
   }

   return (
      <ThingContext.Provider value={loading || data.thing}>
         <SingleThingContainer>
            <Head>
               <title>{pageTitle} - OurDailies</title>
            </Head>
            {content}
         </SingleThingContainer>
      </ThingContext.Provider>
   );
};

export default SingleThing;
