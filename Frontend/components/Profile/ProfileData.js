import PotentiallyEditableField from './PotentiallyEditableField';

const ProfileData = ({
   editedValues,
   editable,
   makeEditable,
   unMakeEditable,
   canEdit,
   handleEditing,
   handleKeyDown,
   member: {
      displayName,
      role,
      rep,
      points,
      giveableRep,
      email,
      twitchName,
      twitterUserName
   }
}) => {
   const toggleEditability = fieldName => {
      if (editable.includes(fieldName)) {
         unMakeEditable(fieldName);
      } else {
         makeEditable(fieldName);
      }
   };

   return (
      <div className="profileData">
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
         {canEdit && (
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
         )}
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
      </div>
   );
};
export default ProfileData;
