import styled from 'styled-components';
import { useContext } from 'react';
import { ThingContext } from '../../pages/thing';
import { makeTransparent } from '../../styles/functions';

const StyledTitleBar = styled.h2`
   font-size: ${props => props.theme.smallHead};
   font-weight: 600;
   color: ${props => makeTransparent(props.theme.mainText, 1)};
   border-bottom: 1px solid
      ${props => makeTransparent(props.theme.mainText, 0.4)};
   padding: 1rem 0;
   margin: 1rem 0;
`;

const TitleBar = () => {
   const { title } = useContext(ThingContext);
   return <StyledTitleBar>{title}</StyledTitleBar>;
};

export default TitleBar;
