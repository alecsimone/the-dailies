import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import Things from './Things';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { sidebarPerPage } from '../../config';
import { smallThingCardFields } from '../../lib/CardInterfaces';

const MY_FRIENDS_THINGS_QUERY = gql`
   query MY_FRIENDS_THINGS_QUERY {
      myFriendsThings {
         ${smallThingCardFields}
      }
   }
`;

const MyFriendsThings = () => {
   const { me } = useContext(MemberContext);
   const { data, loading, error } = useQuery(MY_FRIENDS_THINGS_QUERY, {
      ssr: false
   });

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
         <Things
            things={friendsThings}
            displayType="list"
            cardSize="small"
            scrollingParentSelector=".sidebar"
            perPage={sidebarPerPage}
         />
      );
   }

   if (me == null || me.friends == null) {
      return <LoadingRing />;
   }
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
