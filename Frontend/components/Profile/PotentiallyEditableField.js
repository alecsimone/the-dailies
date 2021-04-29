import EditThis from '../Icons/EditThis';
import X from '../Icons/X';

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
      {canEdit &&
         (editable.includes(name) ? (
            <X className="cancel" onClick={() => toggleEditability(name)} />
         ) : (
            <EditThis onClick={() => toggleEditability(name)} />
         ))}
   </div>
);

export default PotentiallyEditableField;
