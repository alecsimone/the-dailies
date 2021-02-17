import RichTextArea from '../RichTextArea';
import RichText from '../RichText';

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
      // Note, I'm not updating this RichTextArea to have an uncontrolled input because we don't use this component anymore. However, if you're here because you're thinking about putting it in somewhere, you'll need to add an inputRef prop and use that input ref to get the value of the text for the postText function
      summaryElement = (
         <RichTextArea
            text={summary}
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
