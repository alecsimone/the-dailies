import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { MEMBER_PAGE_QUERY } from '../../pages/member';

const SEND_FRIEND_REQUEST_MUTATION = gql`
   mutation SEND_FRIEND_REQUEST_MUTATION($id: ID!) {
      sendFriendRequest(id: $id) {
         __typename
         id
         friendRequests {
            __typename
            id
         }
      }
   }
`;

const AddFriendButton = ({
   isMe,
   confirmFriendRequest,
   id,
   me,
   friendRequests
}) => {
   const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST_MUTATION);

   let wereFriends = false;
   let outgoingFriendRequest = false;
   let incomingFriendRequest = false;
   if (me && !isMe) {
      me.friends.forEach(myFriend => {
         if (myFriend.id === id) {
            wereFriends = true;
         }
      });
      me.friendRequests.forEach(requestedFriend => {
         if (requestedFriend.id === id) {
            incomingFriendRequest = true;
         }
      });
      if (friendRequests) {
         friendRequests.forEach(requestedFriend => {
            if (requestedFriend.id === me.id) {
               outgoingFriendRequest = true;
            }
         });
      }
   }

   if (!isMe && wereFriends) {
      return <div className="friendsDisplay">Your Friend</div>;
   }

   let friendRequestButton;
   if (outgoingFriendRequest) {
      friendRequestButton = (
         <button className="inactive">Friendship Requested</button>
      );
   } else if (incomingFriendRequest) {
      friendRequestButton = (
         <button
            className="active"
            onClick={() => {
               const newFriendRequests = friendRequests.filter(
                  requester => requester.id !== id
               );
               confirmFriendRequest({
                  variables: {
                     id
                  },
                  optimisticResponse: {
                     confirmFriendRequest: {
                        ...me,
                        friends: [...me.friends, { __typename: 'Member', id }],
                        friendRequests: newFriendRequests
                     }
                  },
                  refetchQueries: [
                     {
                        query: MEMBER_PAGE_QUERY,
                        variables: {
                           id
                        }
                     }
                  ]
               });
            }}
         >
            Confirm Friend
         </button>
      );
   } else if (me != null) {
      friendRequestButton = (
         <button
            className="active"
            onClick={() => {
               sendFriendRequest({
                  variables: {
                     id
                  },
                  optimisticResponse: {
                     __typename: 'Mutation',
                     sendFriendRequest: {
                        __typename: 'Member',
                        id,
                        friendRequests: [
                           ...friendRequests,
                           { __typename: 'Member', id: me.id }
                        ]
                     }
                  }
               });
            }}
         >
            Add Friend
         </button>
      );
   }

   if (!isMe && !wereFriends) {
      return <div className="friendButtonWrapper">{friendRequestButton}</div>;
   }
   return null;
};
export default AddFriendButton;
