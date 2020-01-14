import PropTypes from 'prop-types';

const MetaOption = props => (
   <option value={props.name} key={props.name}>
      {props.name}
   </option>
);
MetaOption.propTypes = {
   name: PropTypes.string.isRequired
};

export default MetaOption;
