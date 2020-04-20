import PropTypes from 'prop-types';
import RichText from '../RichText';

const TruncCont = props => {
   const { cont: contObj, limit } = props;

   if (contObj == null) {
      return <div />;
   }

   let cont = contObj.content;

   if (cont.length > limit) {
      cont = `${cont.substring(0, limit).trim()}...`;
   }
   return (
      <p className="truncCont">
         <RichText text={cont} key={cont} />
      </p>
   );
};
TruncCont.propTypes = {
   cont: PropTypes.shape({
      content: PropTypes.string.isRequired
   }),
   limit: PropTypes.number.isRequired
};

export default TruncCont;
