import { useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import Things from './Things';

const MyFriendsThings = () => {
   const {
      me: { friends }
   } = useContext(MemberContext);
   const friendsThings = [];
   friends.forEach(friend => {
      if (friend.createdThings) {
         friend.createdThings.forEach(thing => friendsThings.push(thing));
      }
   });
   friendsThings.sort((a, b) => a.id < b.id);

   if (friendsThings.length === 0) {
      return (
         <p className="emptyThings">
            Your friends haven't made any things yet.
         </p>
      );
   }
   return <Things things={friendsThings} displayType="list" cardSize="small" />;
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
