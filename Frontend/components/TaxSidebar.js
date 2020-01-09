import { useContext } from 'react';
import FeaturedImage from './ThingParts/FeaturedImage';
import Content from './ThingParts/Content';
import TaxMeta from './TaxMeta';

const TaxSidebar = props => {
   const { context } = props;
   const { title } = useContext(context);

   return (
      <div>
         <FeaturedImage context={context} key={`${title}-FeaturedImage`} />
         <TaxMeta context={context} key={`${title}-Meta`} />
         <Content context={context} key={`${title}-Content`} />
      </div>
   );
};

export default TaxSidebar;
