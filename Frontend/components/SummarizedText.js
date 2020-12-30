import { useState } from 'react';
import styled from 'styled-components';
import RichText from './RichText';
import ArrowIcon from './Icons/Arrow';
import { setAlpha } from '../styles/functions';

const StyledSummarizedText = styled.div`
   cursor: pointer;
   margin: 1rem 0;
   &.expanded,
   &.collapsed {
      border: 1px solid ${props => props.theme.lowContrastGrey};
      border-radius: 3px;
   }
   &.expanded {
      background: ${props => setAlpha(props.theme.lightBlack, 0.75)};
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
   .topline {
      border-bottom: 1px solid ${props => props.theme.lowContrastGrey};
      padding: 1rem;
   }
   .summarizedText {
      padding: 1rem;
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
         onClick={e => {
            // If the summary is collapsed, they can click on any part of it to expand it. But if they're clicking a link, we don't want to do that
            if (expanded) return;
            if (e.target.closest('a') != null) return;
            setExpanded(true);
         }}
         className={
            expanded ? 'summarizedText expanded' : 'summarizedText collapsed'
         }
      >
         <div className="topline" onClick={() => setExpanded(!expanded)}>
            <ArrowIcon
               className="expansionArrow"
               pointing={expanded ? 'down' : 'right'}
            />
            <span className="summary">
               <RichText text={summary} />
            </span>
         </div>
         {expanded && (
            <div className="summarizedText">
               <RichText text={summarizedText} />
            </div>
         )}
      </StyledSummarizedText>
   );
};

export default SummarizedText;
