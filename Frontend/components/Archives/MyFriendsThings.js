import { useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import Things from './Things';
import LoadingRing from '../LoadingRing';
import { sidebarPerPage } from '../../config';

const MyFriendsThings = () => {
   const { me } = useContext(MemberContext);

   if (me == null || me.friends == null) {
      return <LoadingRing />;
   }

   const { friends } = me;

   const friendsThings = [];
   friends.forEach(friend => {
      if (friend.createdThings) {
         friend.createdThings.forEach(thing => friendsThings.push(thing));
      }
   });
   friendsThings.sort((a, b) => (a.id < b.id ? 1 : -1));

   if (friendsThings.length === 0) {
      return (
         <p className="emptyThings">
            Your friends haven't made any things yet.
         </p>
      );
   }
   return (
      <Things
         things={friendsThings}
         displayType="list"
         cardSize="small"
         scrollingParentSelector=".sidebar"
         perPage={sidebarPerPage}
      />
   );
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
