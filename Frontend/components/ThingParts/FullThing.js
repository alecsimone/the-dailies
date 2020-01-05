import styled from 'styled-components';
import TitleBar from './TitleBar';
import Content from './Content';
import TagBox from './TagBox';
import ThingMeta from './ThingMeta';
import { makeTransparent } from '../../styles/functions';

const StyledFullThing = styled.article`
   /* background: ${props =>
      makeTransparent(props.theme.majorColorGlass, 0.03)}; */
   padding: 3rem;
   padding-top: 0;
   border-radius: 8px;
   border: 1px solid hsla(0, 0%, 0%, 0.25);
`;

const FullThing = () => (
   <StyledFullThing>
      <TitleBar />
      <ThingMeta />
      <Content />
      <TagBox />
   </StyledFullThing>
);

export default FullThing;
