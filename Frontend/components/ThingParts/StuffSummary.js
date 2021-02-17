import gql from 'graphql-tag';
import styled from 'styled-components';
import { useState, useRef } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { setAlpha } from '../../styles/functions';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import EditThis from '../Icons/EditThis';
import X from '../Icons/X';
import { contentPieceFields } from '../../lib/CardInterfaces';

const EDIT_SUMMARY_MUTATION = gql`
   mutation EDIT_SUMMARY_MUTATION($summary: String!, $id: ID!, $type: String!) {
      editSummary(summary: $summary, id: $id, type: $type) {
         ... on Thing {
            __typename
            id
            summary
            content {
               ${contentPieceFields}
            }
         }
         ... on Tag {
            __typename
            id
            summary
            content {
               ${contentPieceFields}
            }
         }
      }
   }
`;

const StyledSummary = styled.section`
   position: relative;
   background: ${props => props.theme.deepBlack};
   margin-bottom: 3rem;
   padding: 1rem calc(${props => props.theme.bigText} + 2.5rem) 1rem 1rem; /* the right value is bigText for the width of the editThis icon, then 1rem for it's right positioning, and 1.5rem for the margin between the box and it */
   ${props => props.theme.mobileBreakpoint} {
      margin-bottom: 0;
      padding: 2rem calc(${props => props.theme.bigText} + 3.5rem);
   }
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   .summaryElement {
      max-width: 1200px;
      margin: auto;
      text-align: center;
   }
   .addSummaryPrompt {
      cursor: pointer;
      display: flex;
      align-items: center;
      &:hover {
         svg.x {
            width: ${props => props.theme.smallText};
            transition: all 0.25s;
         }
      }
      svg.x {
         transition: all 0.25s;
         transform: rotate(45deg);
         width: ${props => props.theme.miniText};
         margin-right: 1rem;
         rect {
            fill: ${props => props.theme.mainText};
         }
      }
   }
   form.richTextArea {
      width: 100%;
      ${props => props.theme.mobileBreakpoint} {
         max-width: 900px;
         margin: auto;
      }
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
      top: 1.25rem;
      right: 1rem;
      ${props => props.theme.mobileBreakpoint} {
         top: 2.25rem;
         right: 2rem;
      }
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

const StuffSummary = ({
   summary: inheritedSummary,
   stuffID,
   canEdit,
   type
}) => {
   const [editing, setEditing] = useState(false);

   const summaryInputRef = useRef(null);

   const [editSummary] = useMutation(EDIT_SUMMARY_MUTATION, {
      onError: err => alert(err.message)
   });

   // If there's no summary and the user can't edit this summary, we don't show anything
   if ((inheritedSummary == null || inheritedSummary === '') && !canEdit)
      return null;

   const updateSummary = () => {
      const inputElement = summaryInputRef.current;
      const summary = inputElement.value;

      if (summary.trim() === '') {
         alert("You can't have a blank summary, please write something first.");
         return;
      }

      editSummary({
         variables: {
            summary,
            id: stuffID,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editSummary: {
               summary,
               __typename: type,
               id: stuffID
            }
         }
      });
      setEditing(false);
   };

   const clearSummary = () => {
      editSummary({
         variables: {
            summary: '',
            id: stuffID,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editSummary: {
               summary: '',
               __typename: type,
               id: stuffID
            }
         }
      });

      const inputElement = summaryInputRef.current;
      inputElement.value = '';
   };

   let summaryElement;
   if ((inheritedSummary == null || inheritedSummary === '') && !editing) {
      summaryElement = (
         <div className="addSummaryPrompt" onClick={() => setEditing(true)}>
            <X />
            Add Summary
         </div>
      );
   } else if (editing) {
      summaryElement = (
         <RichTextArea
            text={inheritedSummary == null ? '' : inheritedSummary}
            postText={updateSummary}
            setEditable={setEditing}
            placeholder="Add summary"
            buttonText={
               inheritedSummary == null || inheritedSummary == ''
                  ? 'add'
                  : 'edit'
            }
            id={stuffID}
            inputRef={summaryInputRef}
         />
      );
   } else {
      summaryElement = (
         <div className="summaryElement">
            <RichText text={inheritedSummary} />
         </div>
      );
   }
   return (
      <StyledSummary className="summaryBox">
         {summaryElement}
         {canEdit && (
            <div className="editButtonContainer">
               {(editing ||
                  !(inheritedSummary == null || inheritedSummary == '')) && (
                  <EditThis onClick={() => setEditing(!editing)} />
               )}
               {editing &&
                  !(
                     (inheritedSummary == null || inheritedSummary == '') &&
                     editing
                  ) && <X onClick={() => clearSummary()} />}
            </div>
         )}
      </StyledSummary>
   );
};

export default StuffSummary;
