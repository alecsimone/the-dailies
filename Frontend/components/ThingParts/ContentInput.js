const ContentInput = props => {
   const { currentContent, updateContent, postContent } = props;

   const handleKeyDown = e => {
      if (e.key === 'Enter' && e.ctrlKey) {
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

export default ContentInput;
