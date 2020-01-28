import PropTypes from 'prop-types';

const ContentInput = props => {
   const { currentContent, updateContent, postContent, setEditable } = props;

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postContent();
      }
      if (e.key === 'Escape' && setEditable) {
         setEditable(false);
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
   postContent: PropTypes.func.isRequired,
   setEditable: PropTypes.func
};

export default ContentInput;
