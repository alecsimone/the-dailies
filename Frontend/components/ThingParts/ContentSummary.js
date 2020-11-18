import { useMutation } from 'react';
import RichTextArea from '../RichTextArea';
import RichText from '../RichText';
import { EDIT_SUMMARY_MUTATION } from './ThingSummary';

const ContentSummary = ({
   summary,
   setSummary,
   postText,
   setEditable,
   id,
   thingID,
   editable
}) => {
   let summaryElement;
   if (editable) {
      summaryElement = (
         <RichTextArea
            text={summary}
            setText={setSummary}
            postText={postText}
            setEditable={setEditable}
            key={`${id}-summary`}
            buttonText={summary == null || summary == '' ? 'add' : 'edit'}
            placeholder="Add summary. Use the edit button above to submit."
            hideStyleGuideLink
            hideButton
            id={id}
         />
      );
   } else if (summary != null && summary !== '') {
      summaryElement = (
         <div className="contentSummary">
            TL;DR:{' '}
            <span className="summaryText">
               <RichText text={summary} key={`${id}-summary`} />
            </span>
         </div>
      );
   } else {
      return <div />;
   }
   return <div className="summaryComponentWrapper">{summaryElement}</div>;
};

export default ContentSummary;
