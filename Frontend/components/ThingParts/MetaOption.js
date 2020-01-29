import PropTypes from 'prop-types';

const MetaOption = ({ name }) => (
   <option value={name} key={name}>
      {name}
   </option>
);
MetaOption.propTypes = {
   name: PropTypes.string.isRequired
};

export default MetaOption;
