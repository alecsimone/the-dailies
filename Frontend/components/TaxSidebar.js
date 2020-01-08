import { useContext } from 'react';
import { TagContext } from '../pages/tag';
import FeaturedImage from './ThingParts/FeaturedImage';

const TaxSidebar = props => {
   const { title } = useContext(TagContext);
   return <FeaturedImage context={TagContext} key={`${title}-FeaturedImage`} />;
};

export default TaxSidebar;
