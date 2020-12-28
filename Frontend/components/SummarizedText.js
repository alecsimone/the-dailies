import { useState } from 'react';
import styled from 'styled-components';
import RichText from './RichText';
import ArrowIcon from './Icons/Arrow';

const StyledSummarizedText = styled.div`
   cursor: pointer;
   margin: 1rem 0;
   &.expanded,
   &.collapsed {
      border: 1px solid ${props => props.theme.lowContrastGrey};
      padding: 1rem;
   }
   &.expanded {
      background: ${props => props.theme.lightBlack};
   }
   svg#ArrowIcon {
      display: inline;
      height: calc(
         ${props => props.theme.smallText} * 1.4
      ); /* The 1.4 makes it approximately line up with text of the same font size as its height */
      width: auto;
      vertical-align: middle;
      position: relative;
      bottom: 3px;
   }
`;

const SummarizedText = ({ summarizedText, summaryText }) => {
   const [expanded, setExpanded] = useState(false);
   const minLength = 140;

   if (summaryText == null && summarizedText.length < minLength) {
      // If they didn't give us a summary, and their summarized text is real short, let's just spit it back out at them
      return summarizedText;
   }

   const summary =
      summaryText == null
         ? `${summarizedText.substr(0, minLength)}...`
         : summaryText;
   return (
      <StyledSummarizedText
         onClick={() => setExpanded(!expanded)}
         className={expanded ? 'expanded' : 'collapsed'}
      >
         <ArrowIcon
            className="expansionArrow"
            pointing={expanded ? 'down' : 'right'}
         />
         <span className="textContent">
            {expanded ? (
               <RichText text={summarizedText} />
            ) : (
               <RichText text={summary} />
            )}
         </span>
      </StyledSummarizedText>
   );
};

export default SummarizedText;
