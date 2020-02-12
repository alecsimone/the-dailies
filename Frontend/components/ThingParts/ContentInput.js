import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { pxToInt } from '../../lib/ThingHandling';

const ContentInput = ({
   currentContent,
   updateContent,
   postContent,
   setEditable,
   id
}) => {
   useEffect(() => {
      console.log(id);
      const inputs = document.querySelectorAll(`#${id}`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            input.style.height = `${input.scrollHeight + 2}px`;
         });
      }
   }, [id]);

   const handleKeyDown = e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
         postContent();
      }
      if (e.key === 'Escape' && setEditable) {
         setEditable(false);
      }
   };

   const resizeForm = el => {};

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
            name="content"
            value={currentContent}
            onChange={e => {
               updateContent(e.target.value);
               if (pxToInt(e.target.style.height) < e.target.scrollHeight) {
                  e.target.style.height = '0';
                  e.target.style.height = `${e.target.scrollHeight + 2}px`;
               }
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
