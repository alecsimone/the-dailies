import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Things from './Things';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import { useInfiniteScroll } from '../../lib/ThingHandling';
import useMe from '../Account/useMe';

const MY_FRIENDS_THINGS_QUERY = gql`
   query MY_FRIENDS_THINGS_QUERY {
      myFriendsThings {
         ${smallThingCardFields}
      }
   }
`;

const MyFriendsThings = () => {
   const {
      loggedInUserID,
      memberFields: { friends }
   } = useMe('MyFriendsThings', 'friends');
   const { data, loading, error, fetchMore } = useQuery(
      MY_FRIENDS_THINGS_QUERY,
      {
         ssr: false
      }
   );

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'myFriendsThings');

   if (error) {
      return <ErrorMessage error={error} />;
   }

   if (data) {
      const friendsThings = data.myFriendsThings;

      if (friendsThings == null || friendsThings.length === 0) {
         return (
            <p className="emptyThings">
               Your friends haven't made any things yet.
            </p>
         );
      }

      friendsThings.sort((a, b) => (a.id < b.id ? 1 : -1));

      return (
         <Things things={friendsThings} displayType="list" cardSize="small" />
      );
   }

   if (loggedInUserID == null || friends == null) {
      return <LoadingRing />;
   }
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
