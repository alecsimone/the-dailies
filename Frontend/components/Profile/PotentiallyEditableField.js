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

export default PotentiallyEditableField;
