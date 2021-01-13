const { getRedirectStatus } = require('next/dist/lib/load-custom-routes');

module.exports = {
   async getRedirectStatus() {
      return [
         {
            source: 'http://*',
            destination: 'https://*',
            permanent: true
         }
      ];
   }
};
