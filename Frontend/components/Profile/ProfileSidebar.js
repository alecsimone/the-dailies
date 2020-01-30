import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import DefaultSelects from './DefaultSelects';
import { setAlpha, setLightness } from '../../styles/functions';
import member from '../../pages/member';
import MemberCard from '../MemberCard';
import { MEMBER_PAGE_QUERY } from '../../pages/member';
import { CURRENT_MEMBER_QUERY } from '../Account/MemberProvider';

const EDIT_PROFILE_MUTATION = gql`
   mutation EDIT_PROFILE_MUTATION(
      $id: ID!
      $avatar: String
      $displayName: String
      $email: String
      $twitchName: String
      $defaultCategory: String
      $defaultPrivacy: String
   ) {
      editProfile(
         id: $id
         avatar: $avatar
         displayName: $displayName
         email: $email
         twitchName: $twitchName
         defaultCategory: $defaultCategory
         defaultPrivacy: $defaultPrivacy
      ) {
         __typename
         id
         avatar
         displayName
         email
         twitchName
         defaultCategory {
            __typename
            id
            title
         }
         defaultPrivacy
      }
   }
`;

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

const CONFIRM_FRIEND_REQUEST_MUTATION = gql`
   mutation CONFIRM_FRIEND_REQUEST_MUTATION($id: ID!) {
      confirmFriendRequest(id: $id) {
         __typename
         id
         friends {
            __typename
            id
         }
         friendRequests {
            __typename
            id
         }
      }
   }
`;

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

const StyledProfileSidebar = styled.div`
   padding: 0 2rem;
   .avatarWrapper {
      position: relative;
      .avatarCover {
         position: absolute;
         left: calc(50% - 15rem);
         width: 30rem;
         top: 0;
         height: 100%;
         background: ${props => setAlpha(props.theme.black, 0.75)};
         display: flex;
         align-items: center;
         justify-content: stretch;
         clip-path: circle(calc(15rem + 2px) at center);
         opacity: 0;
         img {
            cursor: pointer;
         }
         &.editable {
            opacity: 0.9;
         }
         img.edit {
            width: 4rem;
            margin: auto;
         }
         .avatarInputWrapper {
            display: flex;
            align-items: center;
            width: 28rem;
            margin: auto;
            input {
               background: ${props => props.theme.black};
               height: 3.5rem;
               font-size: 1.5rem;
               flex-grow: 1;
            }
            img.cancel {
               width: ${props => props.theme.smallText};
               margin-left: 1rem;
               opacity: 1;
               filter: saturate(50%);
            }
         }
         &:hover {
            opacity: 0.9;
         }
      }
      img.avatar {
         display: block;
         width: 30rem;
         height: 30rem;
         object-fit: cover;
         max-width: 100%;
         border-radius: 100%;
         margin: auto;
      }
   }
   .friendsDisplay {
      font-size: ${props => props.theme.bigText};
      text-align: center;
   }
   .friendButtonWrapper {
      text-align: center;
      margin: 2rem 0;
      button {
         padding: 1rem 2rem;
         font-size: ${props => props.theme.smallText};
         background: ${props => props.theme.majorColor};
         &.active {
            &:hover {
               background: ${props => setLightness(props.theme.majorColor, 30)};
            }
         }
      }
   }
   .field {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      input {
         font-size: ${props => props.theme.smallText};
      }
      img.edit,
      img.cancel {
         width: ${props => props.theme.smallText};
         margin-left: 1rem;
         opacity: 0.4;
         cursor: pointer;
         &:hover {
            opacity: 0.8;
         }
      }
   }
   .friendRequests {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      border-top: 1px solid ${props => props.theme.lowContrastGrey};
      .pending {
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
      }
   }
`;

const PotentiallyEditableField = ({
   label,
   name,
   value,
   propValue,
   editable,
   toggleEditability,
   canEdit,
   handleEditing,
   handleKeyDown
}) => (
   <div className={`field ${editable.includes(name) ? ' editable' : ''}`}>
      {label}:{' '}
      {editable.includes(name) ? (
         <input
            type="text"
            size={value != null ? value.length : 12}
            placeholder={label}
            name={name}
            value={value}
            onChange={handleEditing}
            onKeyDown={handleKeyDown}
         />
      ) : (
         propValue || 'Not Set'
      )}{' '}
      {canEdit && (
         <img
            className={editable.includes(name) ? 'cancel' : 'edit'}
            src={editable.includes(name) ? '/red-x.png' : '/edit-this.png'}
            alt={`edit ${label}`}
            onClick={() => toggleEditability(name)}
         />
      )}
   </div>
);

const ProfileSidebar = props => {
   const {
      member: {
         id,
         avatar,
         defaultCategory,
         defaultPrivacy,
         friends,
         friendRequests,
         ignoredFriendRequests,
         displayName,
         rep,
         points,
         giveableRep,
         email,
         twitchName,
         twitterUserName,
         role
      },
      canEdit
   } = props;

   const { me } = useContext(MemberContext);

   const isMe = me && me.id === id;
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

   const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST_MUTATION);

   const [confirmFriendRequest] = useMutation(CONFIRM_FRIEND_REQUEST_MUTATION);

   const [ignoreFriendRequest] = useMutation(IGNORE_FRIEND_REQUEST_MUTATION, {
      onCompleted: data => console.log(data)
   });

   const [editable, setEditable] = useState([]);
   const [editedValues, setEditedValues] = useState(props.member);

   const [editProfile] = useMutation(EDIT_PROFILE_MUTATION);

   const handleKeyDown = e => {
      if (e.key === 'Enter') {
         editProfile({
            variables: {
               id,
               [e.target.name]: e.target.value
            },
            optimisticResponse: {
               __typename: 'Mutation',
               editProfile: {
                  __typename: 'Member',
                  id,
                  [e.target.name]: e.target.value
               }
            }
         });
         unMakeEditable(e.target.name);
      } else if (e.key === 'Escape') {
         unMakeEditable(e.target.name);
      }
   };

   const handleSelect = (e, categoryID) => {
      const optimisticResponse = {
         __typename: 'Mutation',
         editProfile: {
            __typename: 'Member',
            id,
            [e.target.name]: e.target.value
         }
      };
      if (e.target.name === 'defaultCategory') {
         optimisticResponse.editProfile.defaultCategory = {
            __typename: 'Category',
            id: categoryID,
            title: e.target.value
         };
      }

      editProfile({
         variables: {
            id,
            [e.target.name]: e.target.value
         },
         optimisticResponse
      });
   };

   const makeEditable = fieldName =>
      setEditable(oldEditable => [...oldEditable, fieldName]);
   const unMakeEditable = fieldName =>
      setEditable(oldEditable =>
         oldEditable.filter(field => field !== fieldName)
      );

   const toggleEditability = fieldName => {
      if (editable.includes(fieldName)) {
         unMakeEditable(fieldName);
      } else {
         makeEditable(fieldName);
      }
   };

   const handleEditing = e => {
      setEditedValues({
         ...editedValues,
         [e.target.name]: e.target.value
      });
   };

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
                        className="requestOption"
                        src="/red-x.png"
                        onClick={() =>
                           ignoreFriendRequest({
                              variables: {
                                 id: requester.id
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

   let friendRequestButton;
   if (outgoingFriendRequest) {
      friendRequestButton = (
         <button className="inactive">Friendship Requested</button>
      );
   } else if (incomingFriendRequest) {
      friendRequestButton = (
         <button
            className="active"
            onClick={() =>
               confirmFriendRequest({
                  variables: {
                     id
                  },
                  refetchQueries: [
                     {
                        query: MEMBER_PAGE_QUERY,
                        variables: {
                           id
                        }
                     }
                  ]
               })
            }
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

   return (
      <StyledProfileSidebar>
         <div className="avatarWrapper field">
            <img
               src={avatar || '/defaultAvatar.jpg'}
               alt="avatar"
               className="avatar"
            />
            {canEdit && (
               <div
                  className={`avatarCover${
                     editable.includes('avatar') ? ' editable' : ''
                  }`}
               >
                  {editable.includes('avatar') ? (
                     <div className="avatarInputWrapper">
                        <input
                           type="url"
                           name="avatar"
                           value={editedValues.avatar}
                           placeholder="Set Avatar"
                           onChange={handleEditing}
                           onKeyDown={handleKeyDown}
                        />
                        <img
                           src="/red-x.png"
                           className="cancel"
                           onClick={() => unMakeEditable('avatar')}
                        />
                     </div>
                  ) : (
                     <img
                        className="edit"
                        src="/edit-this.png"
                        alt="edit avatar"
                        onClick={() => makeEditable('avatar')}
                     />
                  )}
               </div>
            )}
         </div>
         {!isMe && wereFriends && (
            <div className="friendsDisplay">Your Friend</div>
         )}
         {!isMe && !wereFriends && (
            <div className="friendButtonWrapper">{friendRequestButton}</div>
         )}
         {canEdit && (
            <DefaultSelects
               initialCategory={
                  defaultCategory == null ? 'Misc' : defaultCategory.title
               }
               initialPrivacy={
                  defaultPrivacy == null ? 'Private' : defaultPrivacy
               }
               handleSelect={handleSelect}
            />
         )}
         <PotentiallyEditableField
            label="Display Name"
            name="displayName"
            value={editedValues.displayName}
            propValue={displayName}
            editable={editable}
            toggleEditability={toggleEditability}
            canEdit={canEdit}
            handleEditing={handleEditing}
            handleKeyDown={handleKeyDown}
         />
         <div className="field">Role: {role}</div>
         <div className="field">Rep: {rep}</div>
         <div className="field">Points: {points}</div>
         <div className="field">Giveable Rep: {giveableRep}</div>
         <PotentiallyEditableField
            label="Email"
            name="email"
            value={editedValues.email}
            propValue={email}
            editable={editable}
            toggleEditability={toggleEditability}
            canEdit={canEdit}
            handleEditing={handleEditing}
            handleKeyDown={handleKeyDown}
         />
         <PotentiallyEditableField
            label="Twitch Name"
            name="twitchName"
            value={editedValues.twitchName}
            propValue={twitchName}
            editable={editable}
            toggleEditability={toggleEditability}
            canEdit={canEdit}
            handleEditing={handleEditing}
            handleKeyDown={handleKeyDown}
         />
         <div className="field">
            Twitter Name: {twitterUserName || 'Not set'}
         </div>
         {isMe && (
            <div className="friendRequests">
               Friend Requests ({friendRequestElements.length})
               {friendRequestElements}
            </div>
         )}
      </StyledProfileSidebar>
   );
};
ProfileSidebar.propTypes = {
   member: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      rep: PropTypes.number.isRequired,
      points: PropTypes.array.isRequired,
      giveableRep: PropTypes.array.isRequired,
      email: PropTypes.string.isRequired,
      twitchName: PropTypes.string,
      twitterName: PropTypes.string,
      role: PropTypes.string.isRequired
   })
};

export default ProfileSidebar;
