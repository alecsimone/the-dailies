import styled from 'styled-components';
import { useContext } from 'react';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import { setAlpha } from '../../styles/functions';

const StyledFullThing = styled.article`
   padding: 0;
   margin-top: 1rem;
   border-radius: 8px;
   max-width: 1200px;
   position: absolute;
   top: 2rem;
   left: 4%;
   width: 100%;
   max-height: 100%;
   /* background: ${props => setAlpha(props.theme.majorColorGlass, 0.03)}; */
   /* border: 1px solid hsla(0, 0%, 0%, 0.25); */
`;

const FullThing = props => {
   const { id } = useContext(ThingContext);
   return (
      <StyledFullThing className="fullThing">
         <FeaturedImage context={ThingContext} key={`${id}-FeaturedImage`} />
         <ThingMeta key={`${id}-ThingMeta`} />
         <Content key={`${id}-Content`} />
         <TagBox key={`${id}-TagBox`} />
      </StyledFullThing>
   );
};

export default FullThing;
