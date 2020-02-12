import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { dynamicallyResizeElement } from '../../styles/functions';

const ContentInput = ({
   currentContent,
   updateContent,
   postContent,
   setEditable,
   id
}) => {
   useEffect(() => {
      const inputs = document.querySelectorAll(`.contentInput`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            dynamicallyResizeElement(input);
         });
      }
      if (false) {
         // forcing eslint to include currentContent in the dependencies
         console.log(currentContent);
      }
   }, [currentContent]);

   const handleKeyDown = async e => {
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
            id={id}
            className="contentInput"
            name="content"
            value={currentContent}
            onChange={e => {
               updateContent(e.target.value);
            }}
            onKeyDown={e => handleKeyDown(e)}
            placeholder="Add content"
         />
         <div className="postButtonWrapper">
            <button type="submit" className="post">
               add
            </button>
         </div>
      </form>
   );
};
ContentInput.propTypes = {
   currentContent: PropTypes.string.isRequired,
   updateContent: PropTypes.func.isRequired,
   postContent: PropTypes.func.isRequired,
   setEditable: PropTypes.func,
   id: PropTypes.string.isRequired
};

export default ContentInput;
