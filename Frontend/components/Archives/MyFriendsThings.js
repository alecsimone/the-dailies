import { useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import Things from './Things';

const MyFriendsThings = () => {
   const {
      me: { friends }
   } = useContext(MemberContext);
   const friendsThings = [];
   friends.forEach(friend => {
      friend.createdThings.forEach(thing => friendsThings.push(thing));
   });
   friendsThings.sort((a, b) => a.id < b.id);

   return <Things things={friendsThings} displayType="list" cardSize="small" />;
};
MyFriendsThings.propTypes = {};

export default MyFriendsThings;
