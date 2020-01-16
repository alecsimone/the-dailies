import { useContext } from 'react';
import PropTypes from 'prop-types';
import FeaturedImage from './ThingParts/FeaturedImage';
import Content from './ThingParts/Content';
import TaxMeta from './TaxMeta';
import Comments from './ThingParts/Comments';

const TaxSidebar = props => {
   const { context, canEdit } = props;
   const { title } = useContext(context);

   return (
      <div>
         <FeaturedImage
            context={context}
            key={`${title}-FeaturedImage`}
            canEdit={canEdit}
         />
         <TaxMeta context={context} key={`${title}-Meta`} canEdit={canEdit} />
         <Content
            context={context}
            key={`${title}-Content`}
            canEdit={canEdit}
         />
         <Comments context={context} key={`${title}-Comments`} />
      </div>
   );
};
TaxSidebar.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired,
   canEdit: PropTypes.bool
};

export default TaxSidebar;
