import gql from 'graphql-tag';
import styled from 'styled-components';
import { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { setAlpha } from '../../styles/functions';
import RichTextArea from '../RichTextArea';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import { contentPieceFields } from '../../lib/CardInterfaces';

const EDIT_SUMMARY_MUTATION = gql`
   mutation EDIT_SUMMARY_MUTATION($summary: String!, $id: ID!, $type: String!) {
      editSummary(summary: $summary, id: $id, type: $type) {
         __typename
         id
         summary
         content {
            ${contentPieceFields}
         }
      }
   }
`;

const StyledSummary = styled.section`
   position: relative;
   background: ${props => props.theme.midBlack};
   padding: 2rem calc(${props => props.theme.bigText} + 3.5rem) 2rem 2rem; /* the right value is bigText for the width of the editThis icon, then 1rem for it's right positioning, and 1.5rem for the margin between the box and it */
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   span.summary {
      font-weight: bold;
      color: white;
   }
   form.richTextArea {
      width: 100%;
      max-width: 900px;
      textarea {
         width: 100%;
      }
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
         .styleGuideLink {
            opacity: 0.7;
            display: inline-block;
            font-size: ${props => props.theme.tinyText};
         }
      }
      button {
         margin: 1rem 0;
         padding: 0.6rem;
         font-size: ${props => props.theme.smallText};
         font-weight: 500;
         &.post {
            background: ${props => setAlpha(props.theme.majorColor, 0.8)};
            color: ${props => props.theme.mainText};
            &:hover {
               background: ${props => props.theme.majorColor};
               box-shadow: 0 0 6px
                  ${props => setAlpha(props.theme.majorColor, 0.6)};
            }
         }
      }
   }
   .editButtonContainer {
      position: absolute;
      right: 2rem;
      top: 1.25rem;
      width: ${props => props.theme.bigText};
      svg {
         width: 100%;
         opacity: 0.4;
         cursor: pointer;
         &:hover {
            opacity: 0.8;
         }
         &.x {
            margin-top: 1rem;
         }
      }
   }
`;

const ThingSummary = ({ summary: inheritedSummary, thingID, canEdit }) => {
   const [editing, setEditing] = useState(
      (inheritedSummary == null || inheritedSummary == '') && canEdit
   );
   const [summary, setSummary] = useState(
      inheritedSummary == null ? '' : inheritedSummary
   );

   const [editSummary] = useMutation(EDIT_SUMMARY_MUTATION);

   if ((inheritedSummary == null || inheritedSummary === '') && !canEdit)
      return;

   const updateSummary = () => {
      editSummary({
         variables: {
            summary,
            id: thingID,
            type: 'Thing'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editSummary: {
               summary,
               __typename: 'Thing',
               id: thingID
            }
         }
      });
      setEditing(false);
   };

   const clearSummary = () => {
      editSummary({
         variables: {
            summary: '',
            id: thingID,
            type: 'Thing'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editSummary: {
               summary: '',
               __typename: 'Thing',
               id: thingID
            }
         }
      });
      setSummary('');
   };

   let summaryElement;
   if (editing) {
      summaryElement = (
         <RichTextArea
            text={summary}
            setText={setSummary}
            postText={updateSummary}
            setEditable={setEditing}
            placeholder="Add summary"
            buttonText="edit"
            id={thingID}
         />
      );
   } else {
      summaryElement = (
         <div className="summaryElement">
            TL;DR: <span className="summary">{inheritedSummary}</span>
         </div>
      );
   }
   return (
      <StyledSummary className="summaryBox">
         {summaryElement}
         {canEdit &&
            !(
               (inheritedSummary == null || inheritedSummary == '') &&
               editing
            ) && (
               <div className="editButtonContainer">
                  <EditThis onClick={() => setEditing(!editing)} />
                  {editing && <X onClick={() => clearSummary()} />}
               </div>
            )}
      </StyledSummary>
   );
};

export default ThingSummary;
