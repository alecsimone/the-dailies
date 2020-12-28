import styled from 'styled-components';
import { useState } from 'react';
import PropTypes from 'prop-types';
import RichText from '../RichText';
import ArrowIcon from '../Icons/Arrow';

const StyledTruncCont = styled.div`
   white-space: pre-wrap;
   svg.arrow.truncContArrow {
      width: ${props => props.theme.smallHead};
      display: block;
      margin: auto;
      opacity: 0.7;
      &:hover {
         opacity: 1;
      }
   }
`;

const TruncCont = ({ cont: contObj, limit }) => {
   const [expanded, setExpanded] = useState(false);

   if (contObj == null) {
      return <div />;
   }

   let cont = contObj.content || contObj; // If contObj.content is undefined, let's assume they gave us a string

   if (typeof cont !== 'string') return <div />; // If they didn't give us a string in either of those two ways, gtfo

   if (!expanded) {
      if (cont.length > limit && !expanded) {
         cont = `${cont.substring(0, limit).trim()}...`;
      }
   }

   return (
      <StyledTruncCont className="truncCont">
         <RichText text={cont} key={cont} />
         {cont.length > limit && (
            <ArrowIcon
               pointing={expanded ? 'up' : 'down'}
               onClick={() => setExpanded(!expanded)}
               className="truncContArrow"
            />
         )}
      </StyledTruncCont>
   );
};
TruncCont.propTypes = {
   cont: PropTypes.shape({
      content: PropTypes.string.isRequired
   }),
   limit: PropTypes.number.isRequired
};

export default TruncCont;
