import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import DefaultAvatar from '../Icons/DefaultAvatar';

const Avatar = ({
   canEdit,
   avatar,
   editable,
   editedValues,
   handleEditing,
   handleKeyDown,
   unMakeEditable,
   makeEditable
}) => (
   <div className="avatarWrapper field">
      {avatar != null ? (
         <img src={avatar} alt="avatar" className="avatar" />
      ) : (
         <DefaultAvatar className="avatar" />
      )}
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
                  <X
                     className="cancel"
                     onClick={() => unMakeEditable('avatar')}
                  />
               </div>
            ) : (
               <EditThis onClick={() => makeEditable('avatar')} />
            )}
         </div>
      )}
   </div>
);
export default Avatar;
