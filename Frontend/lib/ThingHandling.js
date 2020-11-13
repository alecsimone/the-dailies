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
