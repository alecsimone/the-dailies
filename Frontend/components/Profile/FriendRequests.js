import FriendRequest from './FriendRequest';

const FriendRequests = ({ me, isMe, confirmFriendRequest }) => {
   let friendRequestElements = [];
   if (me && isMe) {
      if (me.friendRequests && me.friendRequests.length > 0) {
         me.friendRequests.forEach(requester => {
            const shouldBeIgnored = me.ignoredFriendRequests.filter(
               ignoredPerson => ignoredPerson.id === requester.id
            );
            if (shouldBeIgnored && shouldBeIgnored.length > 0) {
               return null;
            }
            friendRequestElements.push(<FriendRequest requester={requester} />);
         });
      }
   }
   if (friendRequestElements.length === 0) {
      friendRequestElements = (
         <div className="friendRequest">No pending friend requests</div>
      );
   }
   return (
      <div className="friendRequests">
         Friend Requests (
         {friendRequestElements.length ? friendRequestElements.length : 0})
         {friendRequestElements}
      </div>
   );
};
export default FriendRequests;
