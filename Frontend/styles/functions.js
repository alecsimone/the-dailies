import { pxToInt } from '../lib/TextHandling';

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

const dynamicallyResizeElement = el => {
   if (el == null) {
      return;
   }
   const mainSection = document.querySelector('.mainSection');
   const oldScrollTop = mainSection.scrollTop;
   el.style.height = '0';
   el.style.height = `${el.scrollHeight + 2}px`;
   mainSection.scrollTop = oldScrollTop;
};
export { dynamicallyResizeElement };
