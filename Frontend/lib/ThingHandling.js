import Router from 'next/router';

const disabledCodewords = ['disabled', 'disable', 'false', 'no', 'off', 'x'];
export { disabledCodewords };

const checkForNewThingRedirect = (thingID, mutationName, data) => {
   if (thingID === 'new') {
      Router.push({
         pathname: '/thing',
         query: { id: data[mutationName].id }
      });
   }
};
export { checkForNewThingRedirect };

const pxToInt = pxString => {
   if (pxString === '') {
      return 0;
   }
   const lowerCasedString = pxString.toLowerCase();
   const pxPos = lowerCasedString.indexOf('px');
   const newString = pxString.substring(0, pxPos);
   return parseInt(newString);
};
export { pxToInt };
