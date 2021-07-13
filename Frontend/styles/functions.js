import { pxToInt } from '../lib/TextHandling';
import { getCursorXY } from '../lib/RichTextHandling';

function setSaturation(baseColor, saturation) {
   if (isHSL(baseColor)) {
      return replaceNthValue(baseColor, saturation, 2);
   }
   return baseColor;
}
export { setSaturation };

function setLightness(baseColor, lightness) {
   if (isHSL(baseColor)) {
      return replaceNthValue(baseColor, lightness, 3);
   }
   return baseColor;
}
export { setLightness };

function setAlpha(baseColor, opacity) {
   if (isHSL(baseColor)) {
      return replaceNthValue(baseColor, opacity, 4);
   }
   return baseColor;
}
export { setAlpha };

function isHSL(baseColor) {
   const hslCheck = baseColor.substring(0, 3);
   if (hslCheck.toLowerCase() === 'hsl') {
      return true;
   }
   return false;
}

function countCommas(string) {
   return (string.match(/\,/g) || []).length;
}

function getNthPositionOfSubstring(string, subString, n) {
   return string.split(subString, n).join(subString).length;
}

function replaceNthValue(string, replacementValue, n) {
   const commaCount = countCommas(string);
   if (commaCount === 2 && n === 4) {
      const firstParenIndex = string.indexOf('(');
      const startingString = string.substring(
         firstParenIndex,
         string.length - 1
      );
      return `hsla${startingString}, ${replacementValue})`;
   }

   const startingComma = getNthPositionOfSubstring(string, ',', n - 1);
   const startingString = string.substring(0, startingComma + 1);

   if (commaCount < n) {
      const endingString = n === 4 ? ')' : '%)';
      return `${startingString} ${replacementValue}${endingString}`;
   }

   const endingComma = getNthPositionOfSubstring(string, ',', n);
   const endingString = string.substring(endingComma);

   return `${startingString} ${replacementValue}%${endingString}`;
}

const getOneRem = () =>
   parseFloat(getComputedStyle(document.documentElement).fontSize);
export { getOneRem };

const dynamicallyResizeElement = el => {
   if (el == null) {
   }
   const mainSection = document.querySelector('.mainSection');
   const oldScrollTop = mainSection.scrollTop;
   el.style.height = '0';
   const oneRem = getOneRem();
   el.style.height = `${el.scrollHeight + oneRem}px`;

   let newScrollTop = oldScrollTop;
   if (
      el === document.activeElement &&
      el.closest('.theActualContent') != null
   ) {
      const cursorPosition = el.selectionEnd;
      const cursorXY = getCursorXY(el, cursorPosition);
      const cursorDepth = cursorXY.y - el.offsetTop + 3 * oneRem + 1; // getCursorXY includes the offset of the element, so we're removing it here. I don't really know where the 3 rem comes from, but the 1px I think is for the border

      const parentBlock = el.closest('.contentBlock');
      const stickyButtons = parentBlock.querySelector('.newcontentButtons');

      const textAreaRect = el.getBoundingClientRect();
      const stickyButtonsRect = stickyButtons.getBoundingClientRect();

      const totalCursorDepth = textAreaRect.top + cursorDepth;

      if (stickyButtonsRect.top < totalCursorDepth) {
         const scrollAdjustment =
            stickyButtonsRect.top - (totalCursorDepth + 0.5 * oneRem); // Adding the 0.5rem just for some breathing room beneath the cursor
         newScrollTop = oldScrollTop - scrollAdjustment;
      }
   }
   window.setTimeout(() => {
      if (oldScrollTop !== newScrollTop) {
         mainSection.scrollTop = newScrollTop;
      }
   }, 1);
};
export { dynamicallyResizeElement };

const midScreenBreakpointPx = 1440;
export { midScreenBreakpointPx };
