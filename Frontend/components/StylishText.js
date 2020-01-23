import PropTypes from 'prop-types';

const StylishText = ({ text }) => {
   if (text == null || typeof text !== 'string' || text === '') {
      return text;
   }
   const searchString = /<style="(.+)">(.+)<\/style>/gi;
   const simpleTagSearch = text.match(searchString);
   if (simpleTagSearch == null) {
      return <>{text}</>;
   }
   const tags = text.matchAll(searchString);
   const elementsArray = [];
   let stoppedAtIndex = 0;
   for (const tag of tags) {
      const startingText = text.substring(stoppedAtIndex, tag.index);
      elementsArray.push(startingText);

      const splitTag = tag[1].split(/[:;]/gi);
      const styleObject = {};
      splitTag.forEach((tagPiece, index) => {
         if (index % 2 === 1) {
            return;
         }
         styleObject[splitTag[index].trim()] = splitTag[index + 1].trim();
      });
      // styleObject = { [splitTag[0]]: splitTag[1].trim() };

      const tagElement = (
         <span style={styleObject} key={stoppedAtIndex}>
            {tag[2]}
         </span>
      );
      elementsArray.push(tagElement);

      stoppedAtIndex = tag.index + tag[0].length;
   }
   const endingText = text.substring(stoppedAtIndex);
   elementsArray.push(endingText);
   return <>{elementsArray}</>;
};
StylishText.propTypes = {
   text: PropTypes.string.isRequired
};

export default StylishText;
