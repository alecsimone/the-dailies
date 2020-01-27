import PropTypes from 'prop-types';

const ContentInput = props => {
   const { currentContent, updateContent, postContent } = props;

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postContent();
      }
   };

   return (
      <form
         onSubmit={async e => {
            e.preventDefault();
            postContent();
         }}
      >
         <textarea
            type="textarea"
            id="content"
            name="content"
            value={currentContent}
            onChange={e => updateContent(e.target.value)}
            onKeyDown={e => handleKeyDown(e)}
         />
         <button type="submit" className="post">
            add
         </button>
      </form>
   );
};
ContentInput.propTypes = {
   currentContent: PropTypes.string.isRequired,
   updateContent: PropTypes.func.isRequired,
   postContent: PropTypes.func.isRequired
};

export default ContentInput;
