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
);
export default Avatar;
