const getYoutubeVideoIdFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   if (lowerCaseURL.includes('youtube.com/watch?v=')) {
      const idStartPos = url.indexOf('youtube.com/watch?v=') + 20;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   if (lowerCaseURL.includes('youtu.be')) {
      const idStartPos = url.indexOf('youtu.be/') + 9;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   return false;
};
export { getYoutubeVideoIdFromLink };

const getGfycatSlugFromLink = url => {
   let gfyCode;
   if (url.indexOf('/detail/') > -1) {
      const gfyCodePosition = url.indexOf('/detail/') + 8;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   } else {
      const gfyCodePosition = url.indexOf('gfycat.com/') + 11;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('.mp4') > -1) {
         const gfyCodeEndPosition = url.indexOf('.mp4');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('-') > -1) {
         const gfyCodeEndPosition = url.indexOf('-');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   }
   return gfyCode;
};
export { getGfycatSlugFromLink };

const getTweetIDFromLink = url => {
   const lowerCaseURL = url.toLowerCase();
   const statusPos = url.indexOf('/status/') + 8;
   const parametersPos = url.indexOf('?', statusPos);
   if (parametersPos > -1) {
      return url.substring(statusPos, parametersPos);
   }
   return url.substring(statusPos);
};
export { getTweetIDFromLink };

const urlFinder = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
export { urlFinder };
