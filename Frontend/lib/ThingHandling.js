const convertISOtoAgo = function(isoTime) {
   const seconds = Math.floor((new Date() - new Date(isoTime)) / 1000);

   let interval = Math.floor(seconds / (60 * 60 * 24 * 365));

   if (interval >= 1) {
      return `${interval} YEAR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 30));
   if (interval >= 1) {
      return `${interval} MONTH${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 7));
   if (interval >= 1) {
      return `${interval} WEEK${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24));
   if (interval >= 1) {
      return `${interval} DAY${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60));
   if (interval >= 1) {
      return `${interval} HOUR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 60);
   if (interval >= 1) {
      return `${interval} MINUTE${interval === 1 ? '' : 'S'}`;
   }
   return `${Math.floor(seconds)} SECOND${seconds === 1 ? '' : 'S'}`;
};

export { convertISOtoAgo };
