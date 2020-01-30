import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import MemberCard from '../MemberCard';

const IGNORE_FRIEND_REQUEST_MUTATION = gql`
   mutation IGNORE_FRIEND_REQUEST_MUTATION($id: ID!) {
      ignoreFriendRequest(id: $id) {
         __typename
         id
         ignoredFriendRequests {
            __typename
            id
         }
      }
   }
`;

const FriendRequests = ({ me, isMe, confirmFriendRequest }) => {
   const [ignoreFriendRequest] = useMutation(IGNORE_FRIEND_REQUEST_MUTATION, {
      onCompleted: data => console.log(data)
   });

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
            friendRequestElements.push(
               <div className="pending">
                  <MemberCard member={requester} />
                  <div className="requestOptions">
                     <img
                        alt="confirm friend request"
                        className="requestOption"
                        src="/green-plus.png"
                        onClick={e => {
                           const newFriendRequests = me.friendRequests.filter(
                              oldRequester => oldRequester.id !== requester.id
                           );
                           confirmFriendRequest({
                              variables: {
                                 id: requester.id
                              },
                              optimisticResponse: {
                                 confirmFriendRequest: {
                                    ...me,
                                    friendRequests: newFriendRequests
                                 }
                              }
                           });
                        }}
                     />
                     <img
                        alt="reject friend frequest"
                        className="requestOption"
                        src="/red-x.png"
                        onClick={() =>
                           ignoreFriendRequest({
                              variables: {
                                 id: requester.id
                              },
                              optimisticResponse: {
                                 ignoreFriendRequest: {
                                    ...me,
                                    ignoredFriendRequests: [
                                       ...me.ignoredFriendRequests,
                                       {
                                          __typename: 'Member',
                                          ...requester
                                       }
                                    ]
                                 }
                              }
                           })
                        }
                     />
                  </div>
               </div>
            );
         });
      }
   }
   if (friendRequestElements.length === 0) {
      friendRequestElements = (
         <div className="pending">No pending friend requests</div>
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
