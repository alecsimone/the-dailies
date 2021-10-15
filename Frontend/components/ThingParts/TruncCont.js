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

const TruncCont = ({
   cont: contObj,
   limit,
   truncContExpanded = true,
   setTruncContExpanded
}) => {
   // const [expanded, setExpanded] = useState(truncContExpanded);

   if (contObj == null) {
      return <div />;
   }

   const cont = contObj.content || contObj; // If contObj.content is undefined, let's assume they gave us a string

   if (typeof cont !== 'string') return <div />; // If they didn't give us a string in either of those two ways, gtfo

   let newLimit = limit;
   if (process.browser) {
      // If there's a summary in this text, we want to make sure we get the whole summary tag inside our limit so it will show up collapsed instead of getting truncated halfway through and showing up as plain text
      const summaryRegex = /(?<summary>>>(?<summarizedText>.+)<<(\((?<summaryText>.+)\))?)/gis;
      const allMatches = cont.matchAll(summaryRegex);
      let i = 0;
      for (const match of allMatches) {
         if (i > 0) return;
         const summarizedTextPos = cont.indexOf(match.groups.summarizedText);
         if (summarizedTextPos < limit) {
            newLimit = summarizedTextPos + match.groups.summary.length - 2; // The -2 is for the 2 characters that start the summary tag
         }
         i += 1;
      }
   }

   let truncCont = cont;
   if (!truncContExpanded) {
      if (cont.length > newLimit) {
         truncCont = `${cont.substring(0, newLimit).trim()}${
            newLimit === limit ? '...' : ''
         }`;
      }
   }

   return (
      <StyledTruncCont className="truncCont">
         <RichText text={truncCont} key={truncCont} />
         {cont.length > newLimit && (
            <ArrowIcon
               pointing={truncContExpanded ? 'up' : 'down'}
               onClick={() => {
                  if (setTruncContExpanded != null) {
                     setTruncContExpanded(!truncContExpanded);
                  }
               }}
               className="truncContArrow"
            />
         )}
      </StyledTruncCont>
   );
};
TruncCont.propTypes = {
   cont: PropTypes.oneOfType([
      PropTypes.shape({
         content: PropTypes.string.isRequired
      }),
      PropTypes.string
   ]),
   limit: PropTypes.number.isRequired
};

export default TruncCont;
