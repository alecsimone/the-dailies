import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { setAlpha } from '../../styles/functions';

const EDIT_PROFILE_MUTATION = gql`
   mutation EDIT_PROFILE_MUTATION(
      $id: ID!
      $avatar: String
      $displayName: String
      $email: String
      $twitchName: String
   ) {
      editProfile(
         id: $id
         avatar: $avatar
         displayName: $displayName
         email: $email
         twitchName: $twitchName
      ) {
         __typename
         id
         avatar
         displayName
         email
         twitchName
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
         <div className="field">Role: {role}</div>
      </StyledProfileSidebar>
   );
};
ProfileSidebar.propTypes = {
   member: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      rep: PropTypes.array.isRequired,
      points: PropTypes.array.isRequired,
      giveableRep: PropTypes.array.isRequired,
      email: PropTypes.string.isRequired,
      twitchName: PropTypes.string,
      twitterName: PropTypes.string,
      role: PropTypes.string.isRequired
   })
};

export default ProfileSidebar;
