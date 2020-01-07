import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import Head from 'next/head';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import { fullThingFields } from '../lib/CardInterfaces';
import FullThing from '../components/ThingParts/FullThing';

const SINGLE_THING_QUERY = gql`
   query SINGLE_THING_QUERY($id: ID!) {
      thing(where: { id: $id }) {
         ${fullThingFields}
      }
   }
`;

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
   justify-content: flex-start;
   padding: 2rem 2.5rem;
   position: absolute;
   height: 100%;
   width: 100%;
   overflow-y: scroll;
   scrollbar-color: #262626 black;
   scrollbar-width: thin;
`;

const ThingContext = React.createContext();

const SingleThing = props => {
   const { loading, error, data } = useQuery(SINGLE_THING_QUERY, {
      variables: { id: props.query.id }
   });

   const {
      data: subscriptionData,
      loading: subscriptionLoading
   } = useSubscription(SINGLE_THING_SUBSCRIPTION, {
      variables: { id: props.query.id }
   });

   if (error) return <Error error={error} />;

   if (data)
      return (
         <ThingContext.Provider value={data.thing}>
            <SingleThingContainer>
               <Head>
                  <title>{data.thing.title} - OurDailies</title>
               </Head>
               <FullThing id={props.query.id} />
            </SingleThingContainer>
         </ThingContext.Provider>
      );

   if (loading) return <LoadingRing />;
};

export { ThingContext };
export default SingleThing;
