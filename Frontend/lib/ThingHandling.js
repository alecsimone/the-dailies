const convertISOtoAgo = function(isoTime) {
   const seconds = Math.floor((new Date() - new Date(isoTime)) / 1000);

   let interval = Math.floor(seconds / (60 * 60 * 24 * 365));

   if (interval >= 1) {
      return `${interval}y`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 30));
   if (interval >= 1) {
      return `${interval}mo`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 7));
   if (interval >= 1) {
      return `${interval}w`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24));
   if (interval >= 1) {
      return `${interval}d`;
   }
   interval = Math.floor(seconds / (60 * 60));
   if (interval >= 1) {
      return `${interval}h`;
   }
   interval = Math.floor(seconds / 60);
   if (interval >= 1) {
      return `${interval}m`;
   }
   return `${Math.floor(seconds)}s`;
};

export { convertISOtoAgo };

const disabledCodewords = ['disabled', 'disable', 'false', 'no', 'off', 'x'];
export { disabledCodewords };
