function makeTransparent(baseColor, opacity) {
   if (baseColor.charAt(baseColor.length - 1) === ')') {
      const commaCount = (baseColor.match(/\,/g) || []).length;
      if (commaCount === 2) {
         let newColor = baseColor.substring(0, baseColor.length - 1);
         newColor += `, ${opacity})`;
         return newColor;
      }
      if (commaCount === 3) {
         const indexOfLastComma = baseColor.lastIndexOf(',');
         let newColor = baseColor.substring(0, indexOfLastComma);
         newColor += `, ${opacity})`;
         return newColor;
      }
   }
   return baseColor;
}

export { makeTransparent };
