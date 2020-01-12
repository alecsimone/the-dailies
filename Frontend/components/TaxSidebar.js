import { useContext } from 'react';
import PropTypes from 'prop-types';
import FeaturedImage from './ThingParts/FeaturedImage';
import Content from './ThingParts/Content';
import TaxMeta from './TaxMeta';
import Comments from './ThingParts/Comments';

const TaxSidebar = props => {
   const { context } = props;
   const { title } = useContext(context);

   return (
      <div>
         <FeaturedImage context={context} key={`${title}-FeaturedImage`} />
         <TaxMeta context={context} key={`${title}-Meta`} />
         <Content context={context} key={`${title}-Content`} />
         <Comments context={context} key={`${title}-Comments`} />
      </div>
   );
};
TaxSidebar.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired
};

export default TaxSidebar;
