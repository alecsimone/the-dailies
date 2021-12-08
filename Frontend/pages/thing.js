import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Error from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import { fullThingFields } from '../lib/CardInterfaces';
import BroadcastThing from '../components/ThingCards/BroadcastThing';
import { home } from '../config';
import FlexibleThingCard from '../components/ThingCards/FlexibleThingCard';
import useMe from '../components/Account/useMe';
import PlaceholderThings from '../components/PlaceholderThings';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';

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

const StyledSingleThing = styled.section`
   position: relative;
   padding: 0;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0 1rem;
   }
   article,
   article.placeholderThing {
      max-width: 1920px;
      width: 100%;
      margin: 0 auto 6rem;
      ${props => props.theme.mobileBreakpoint} {
         margin: 3rem auto 6rem;
      }
      &:first-child {
         ${props => props.theme.mobileBreakpoint} {
            margin-top: 3rem;
         }
      }
   }
   article.placeholderThing .placeholderFeaturedImage {
      height: 75rem;
   }
   .noThing {
      margin: 3rem auto;
      text-align: center;
      font-size: ${props => props.theme.bigText};
   }
`;

const useSingleThingData = id => {
   const singleThingData = {};

   singleThingData.hasData = useSelector(
      state => state.stuff[`Thing:${id}`] != null
   );
   singleThingData.title = useSelector(
      state => state.stuff[`Thing:${id}`]?.title
   );
   singleThingData.summary = useSelector(
      state => state.stuff[`Thing:${id}`]?.summary
   );
   singleThingData.authorName = useSelector(
      state => state.stuff[`Thing:${id}`]?.author?.displayName
   );
   singleThingData.score = useSelector(
      state => state.stuff[`Thing:${id}`]?.score
   );

   return singleThingData;
};

const SingleThing = ({ query }) => {
   const { hasData, title, summary, authorName, score } = useSingleThingData(
      query.id
   );

   const { loading, error, data } = useQueryAndStoreIt(SINGLE_THING_QUERY, {
      variables: { id: query.id },
      skip: query.id === 'new' || hasData
   });

   let compiledData;
   if (hasData) {
      compiledData = {
         id: query.id,
         title,
         summary,
         author: {
            displayName: authorName
         },
         score
      };
   } else if (data != null && data.thing != null) {
      compiledData = data.thing;
   }

   const { loggedInUserID, memberLoading } = useMe();

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our thing container scroll to the top when we route to a new thing, but wesbos's eslint rules don't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      const containerArray = document.getElementsByClassName('mainSection');
      if (containerArray.length >= 1) {
         containerArray[0].scrollTo(0, 0);
      }
   }, [query.id]);
   /* eslint-enable */

   const displayProps = {
      expanded: true,
      contentType: 'full'
   };

   let content;
   let pageTitle;
   if (error) {
      content = <Error error={error} />;
      pageTitle = 'Unavailable Thing';
   } else if (loading || memberLoading) {
      content = <PlaceholderThings count={1} {...displayProps} />;
      pageTitle = 'Loading Thing';
   } else if (compiledData) {
      if (loggedInUserID?.broadcastView) {
         content = (
            <BroadcastThing
               id={query.id}
               linkedPiece={query.piece}
               key={query.id}
            />
         );
      } else {
         content = (
            <FlexibleThingCard
               key={`flexibleCard-${query.id}`}
               thingID={query.id}
               linkedPiece={query.piece}
               linkedComment={query.comment}
               {...displayProps}
            />
         );
      }
      pageTitle = compiledData.title;
   }

   if (data && data.thing == null) {
      content = <p>Thing not found.</p>;
      pageTitle = "Couldn't find thing";
   }

   if ((data == null || data.thing == null) && !loading && !hasData) {
      return (
         <StyledSingleThing>
            <div className="noThing">No thing found for that ID</div>
         </StyledSingleThing>
      );
   }

   let ogDescription = 'A Thing you might find interesting';
   if ((data && data.thing) || hasData) {
      if (compiledData.summary != null && compiledData.summary !== '') {
         ogDescription = compiledData.summary;
      } else {
         ogDescription = `A Thing by ${compiledData.author.displayName} with ${
            compiledData.score
         } votes`;
      }
   }

   return (
      <StyledSingleThing className="thingPage">
         <Head>
            <title>{pageTitle} - Ouryou</title>
            <meta property="og:type" content="article" key="ogType" />
            <meta property="og:url" content={`${home}/thing?id=${query.id}`} />
            <meta
               property="og:description"
               content={ogDescription}
               key="ogDescription"
            />
            <meta
               property="og:title"
               content={compiledData != null ? compiledData.title : 'Ouryou'}
            />
         </Head>
         {content}
      </StyledSingleThing>
   );
};

SingleThing.getInitialProps = async ctx => ({ query: ctx.query });

export default SingleThing;
