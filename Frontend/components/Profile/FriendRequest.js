import { useContext } from 'react';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { MemberContext } from '../Account/MemberProvider';
import MemberCard from '../MemberCard';
import { CONFIRM_FRIEND_REQUEST_MUTATION } from './ProfileSidebar';
import { setAlpha } from '../../styles/functions';

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

const StyledFriendRequest = styled.div`
   padding: 3rem 0;
   display: flex;
   justify-content: space-around;
   font-size: ${props => props.theme.smallText};
   font-weight: 400;
   width: 100%;
   text-align: left;
   border-bottom: 1px solid
      ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
   &:last-child {
      border-bottom: none;
   }
   article {
      flex-grow: 1;
   }
   .requestOptions {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 2rem;
      padding: 0.25rem;
      img.requestOption {
         width: 2.5rem;
         height: 2.5rem;
         cursor: pointer;
         opacity: 0.4;
         &:hover {
            opacity: 0.8;
         }
      }
   }
`;

const FriendRequest = ({ requester }) => {
   const { me } = useContext(MemberContext);

   const [ignoreFriendRequest] = useMutation(IGNORE_FRIEND_REQUEST_MUTATION);

   const [confirmFriendRequest] = useMutation(CONFIRM_FRIEND_REQUEST_MUTATION);

   if (me.friends.some(friend => friend.id === requester.id)) {
      return null;
   }
   return (
      <StyledFriendRequest className="friendRequest">
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
               alt="reject friend request"
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
      </StyledFriendRequest>
   );
};

export default FriendRequest;
