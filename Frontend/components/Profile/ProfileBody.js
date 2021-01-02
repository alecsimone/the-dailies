import gql from 'graphql-tag';
import { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import Avatar from './Avatar';
import AddFriendButton from './AddFriendButton';
import DefaultSelects from './DefaultSelects';
import ProfileData from './ProfileData';

const EDIT_PROFILE_MUTATION = gql`
   mutation EDIT_PROFILE_MUTATION(
      $id: ID!
      $avatar: String
      $displayName: String
      $email: String
      $twitchName: String
      $defaultPrivacy: String
      $defaultExpansion: String
   ) {
      editProfile(
         id: $id
         avatar: $avatar
         displayName: $displayName
         email: $email
         twitchName: $twitchName
         defaultPrivacy: $defaultPrivacy
         defaultExpansion: $defaultExpansion
      ) {
         __typename
         id
         avatar
         displayName
         email
         twitchName
         defaultPrivacy
         defaultExpansion
      }
   }
`;

const ProfileBody = ({ member, me, isMe, canEdit, confirmFriendRequest }) => {
   const [editable, setEditable] = useState([]);
   const [editedValues, setEditedValues] = useState(member);

   const [editProfile] = useMutation(EDIT_PROFILE_MUTATION, {
      onError: err => alert(err.message)
   });

   const makeEditable = fieldName =>
      setEditable(oldEditable => [...oldEditable, fieldName]);
   const unMakeEditable = fieldName =>
      setEditable(oldEditable =>
         oldEditable.filter(field => field !== fieldName)
      );

   const handleKeyDown = e => {
      if (e.key === 'Enter') {
         editProfile({
            variables: {
               id: member.id,
               [e.target.name]: e.target.value
            },
            optimisticResponse: {
               __typename: 'Mutation',
               editProfile: {
                  __typename: 'Member',
                  id: member.id,
                  [e.target.name]: e.target.value
               }
            }
         });
         unMakeEditable(e.target.name);
      } else if (e.key === 'Escape') {
         unMakeEditable(e.target.name);
      }
   };

   const handleEditing = e => {
      setEditedValues({
         ...editedValues,
         [e.target.name]: e.target.value
      });
   };

   let defaultExpansion;
   if (member.defaultExpansion == null) {
      defaultExpansion = false;
   } else {
      defaultExpansion = member.defaultExpansion;
   }

   return (
      <div className="profileBody">
         <Avatar
            canEdit={canEdit}
            avatar={member.avatar}
            editable={editable}
            editedValues={editedValues}
            handleEditing={handleEditing}
            handleKeyDown={handleKeyDown}
            unMakeEditable={unMakeEditable}
            makeEditable={makeEditable}
         />
         <AddFriendButton
            isMe={isMe}
            confirmFriendRequest={confirmFriendRequest}
            id={member.id}
            me={me}
            friendRequests={member.friendRequests}
         />
         {canEdit && (
            <DefaultSelects
               initialPrivacy={
                  member.defaultPrivacy == null
                     ? 'Private'
                     : member.defaultPrivacy
               }
               initialExpansion={defaultExpansion}
               editProfile={editProfile}
               id={member.id}
            />
         )}
         <ProfileData
            editedValues={editedValues}
            editable={editable}
            makeEditable={makeEditable}
            unMakeEditable={unMakeEditable}
            canEdit={canEdit}
            handleEditing={handleEditing}
            handleKeyDown={handleKeyDown}
            member={member}
         />
      </div>
   );
};
export default ProfileBody;
