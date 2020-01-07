import styled from 'styled-components';
import { useContext } from 'react';
import { ThingContext } from '../../pages/thing';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import FeaturedImage from './FeaturedImage';
import { makeTransparent } from '../../styles/functions';

const StyledFullThing = styled.article`
   padding: 0;
   margin-top: 1rem;
   border-radius: 8px;
   max-width: 1200px;
   /* background: ${props =>
      makeTransparent(props.theme.majorColorGlass, 0.03)}; */
   /* border: 1px solid hsla(0, 0%, 0%, 0.25); */
`;

const FullThing = props => {
   const { id } = useContext(ThingContext);
   return (
      <StyledFullThing>
         <FeaturedImage key={`${id}-FeaturedImage`} />
         <ThingMeta key={`${id}-ThingMeta`} />
         <Content key={`${id}-Content`} />
         <TagBox key={`${id}-TagBox`} />
      </StyledFullThing>
   );
};

export default FullThing;
