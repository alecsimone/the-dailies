import PropTypes from 'prop-types';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const StylishText = ({ text }) => {
   const theme = useContext(ThemeContext);
   if (
      text == null ||
      typeof text !== 'string' ||
      text === '' ||
      !process.browser
   ) {
      return text;
   }
   const styleTagSearchString = /(?:(?<style><style="(?<styleObjectRaw>.+)">(?<styleTextContent>.+)<\/style>)|(?<stars>\*\*(?<starsTextContent>[^*]*(?:\*[^*]+)*)\*\*)|(?<bars>__(?<barsTextContent>[^_]*(?:\_[^_]+)*)__)|(?<pounds>##(?<poundsTextContent>[^#]*(?:#[^#]+)*)##)|(?<slashes>\/\/(?<slashesTextContent>[^/]*(?:\/[^/]+)*)\/\/))/gi;
   // const styleTagRegexp = new RegExp(
   //    '<style="(?<named>.+)">(.+)<\\/style>',
   //    'gi'
   // );
   const simpleTagSearch = text.match(styleTagSearchString);
   if (simpleTagSearch == null) {
      return <>{text}</>;
   }
   const tags = text.matchAll(styleTagSearchString);
   const elementsArray = [];
   let stoppedAtIndex = 0;
   for (const tag of tags) {
      const startingText = text.substring(stoppedAtIndex, tag.index);
      elementsArray.push(startingText);

      if (tag.groups.style != null) {
         const splitTag = tag.groups.styleObjectRaw.split(/[:;]/gi);
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
               <StylishText text={tag.groups.styleTextContent} />
            </span>
         );
         elementsArray.push(tagElement);
      }

      if (tag.groups.stars != null) {
         elementsArray.push(
            <span style={{ fontWeight: 700, color: 'white' }}>
               <StylishText text={tag.groups.starsTextContent} />
            </span>
         );
      }

      if (tag.groups.bars != null) {
         elementsArray.push(
            <span style={{ textDecoration: 'underline' }}>
               <StylishText text={tag.groups.barsTextContent} />
            </span>
         );
      }

      if (tag.groups.slashes != null) {
         elementsArray.push(
            <span style={{ fontStyle: 'italic' }}>
               <StylishText text={tag.groups.slashesTextContent} />
            </span>
         );
      }

      if (tag.groups.pounds != null) {
         elementsArray.push(
            <span style={{ fontSize: theme.smallHead, fontWeight: '700' }}>
               <StylishText text={tag.groups.poundsTextContent} />
            </span>
         );
      }

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
