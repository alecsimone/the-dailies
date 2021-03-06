import gql from 'graphql-tag';
import styled from 'styled-components';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import { useContext } from 'react';
import Link from 'next/link';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';
import Signup from '../Account/Signup';
import { sidebarPerPage } from '../../config';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import LoadMoreButton from '../LoadMoreButton';
import { useInfiniteScroll } from '../../lib/ThingHandling';

const StyledMyThings = styled.div`
   button.loadMore {
      display: block;
      padding: 1rem;
      font-size: ${props => props.theme.smallText};
      margin: 2rem auto;
   }
   div.loadMore {
      font-size: ${props => props.theme.bigText};
      text-align: center;
      margin: 1rem 0;
      font-weight: bold;
   }
`;

const MY_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String) {
      myThings(cursor: $cursor) {
         ${smallThingCardFields}
      }
   }
`;
export { MY_THINGS_QUERY };

const MY_THINGS_SUBSCRIPTION = gql`
   subscription MY_THINGS_SUBSCRIPTION {
      myThings {
         node {
            ${smallThingCardFields}
         }
         updatedFields
      }
   }
`;

const MyThings = ({ setShowingSidebar, scrollingSelector, borderSide }) => {
   const { me, loading: loadingMe } = useContext(MemberContext);
   const { setContent } = useContext(ModalContext);

   const { data, loading, error, fetchMore } = useQuery(MY_THINGS_QUERY, {
      ssr: false,
      skip: me == null && !loadingMe
   });

   useSubscription(MY_THINGS_SUBSCRIPTION, {
      ssr: false,
      skip: me == null && !loadingMe,
      onSubscriptionData: ({ client, subscriptionData }) => {
         // Get the current results for the myThings query
         const oldThings = client.readQuery({
            query: MY_THINGS_QUERY
         });

         // Check if the new thing already exists in myThings
         const [existingThing] = oldThings.myThings.filter(
            thing => thing.id === subscriptionData.data.myThings.node.id
         );

         let newThings;
         if (existingThing != null) {
            // If it does, check if we're being told to delete it
            if (
               subscriptionData.data.myThings.updatedFields.includes('delete')
            ) {
               newThings = oldThings.myThings.filter(
                  thing => thing.id !== subscriptionData.data.myThings.node.id
               );
            }

            // Or edit it
            if (subscriptionData.data.myThings.updatedFields.includes('edit')) {
               newThings = oldThings.myThings;
               const editedThingIndex = newThings.findIndex(
                  thing => thing.id === subscriptionData.data.myThings.node.id
               );
               newThings[editedThingIndex] =
                  subscriptionData.data.myThings.node;
            }
         } else if (
            subscriptionData.data.myThings.updatedFields.includes('delete')
         ) {
            // If it doesn't exist and we're deleting it, our work here is done
            return;
         } else {
            // If it doesn't exist already, add it
            newThings = [
               ...oldThings.myThings,
               subscriptionData.data.myThings.node
            ];
         }
         client.writeQuery({
            query: MY_THINGS_QUERY,
            data: {
               __typename: 'query',
               myThings: newThings
            }
         });
      }
   });

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'myThings');

   if (process.browser) {
      scrollerRef.current = document.querySelector(scrollingSelector);
   }

   if (error) {
      return <ErrorMessage error={error} />;
   }

   if (data) {
      if (data.myThings == null || data.myThings.length === 0) {
         return <p className="emptyThings">You haven't made any things yet.</p>;
      }
      if (me != null) {
         let { myThings } = data;
         myThings.sort((a, b) => {
            const aDate = new Date(a.updatedAt);
            const bDate = new Date(b.updatedAt);

            const aTimestamp = aDate.getTime();
            const bTimestamp = bDate.getTime();

            return bTimestamp - aTimestamp;
         });
         const lastThing = myThings[myThings.length - 1];
         cursorRef.current = lastThing.updatedAt;
         if (me.broadcastView) {
            myThings = myThings.filter(thing => thing.privacy !== 'Private');
         }

         return (
            <StyledMyThings
               onClick={e => {
                  if (e.target.closest('.regularThingCard') != null) return; // If they're interacting with an expanded thing card, we don't want to close the sidebar
                  if (setShowingSidebar != null) {
                     setShowingSidebar(false);
                  }
               }}
            >
               <Things
                  things={myThings}
                  displayType="list"
                  cardSize="small"
                  noPic
                  scrollingParentSelector={scrollingSelector}
                  perPage={sidebarPerPage}
                  borderSide={borderSide}
               />
               <LoadMoreButton
                  loading={loading || isFetchingMore}
                  noMore={noMoreToFetchRef.current}
                  fetchMore={fetchMoreHandler}
               />
            </StyledMyThings>
         );
      }
   }

   if (me == null && !loadingMe) {
      return (
         <p className="emptyThings">
            <Link href={{ pathname: '/login' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Login redirect={false} />);
                  }}
               >
                  Log in
               </a>
            </Link>{' '}
            or{' '}
            <Link href={{ pathname: '/signup' }}>
               <a
                  onClick={e => {
                     e.preventDefault();
                     setContent(<Signup />);
                  }}
               >
                  sign up
               </a>
            </Link>{' '}
            to start making things!
         </p>
      );
   }

   if (loading || loadingMe) {
      return <LoadingRing />;
   }
};
MyThings.propTypes = {};

export default MyThings;
