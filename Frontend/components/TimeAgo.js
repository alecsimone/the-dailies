import { useState } from 'react';

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

const TimeAgo = ({ time, toggleable }) => {
   const [showFullTime, setShowFullTime] = useState(false);

   const fullTimeRaw = new Date(time);
   const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
   ];
   let dateOrdinal;
   if (
      fullTimeRaw.getDate() === 1 ||
      fullTimeRaw.getDate() === 21 ||
      fullTimeRaw.getDate() === 31
   ) {
      dateOrdinal = 'st';
   } else if (fullTimeRaw.getDate() === 2 || fullTimeRaw.getDate() === 22) {
      dateOrdinal = 'nd';
   } else if (fullTimeRaw.getDate() === 3 || fullTimeRaw.getDate() === 23) {
      dateOrdinal = 'rd';
   } else {
      dateOrdinal = 'th';
   }
   const date = `${
      monthsArray[fullTimeRaw.getMonth()]
   } ${fullTimeRaw.getDate()}${dateOrdinal}`;
   const year = fullTimeRaw.getFullYear().toString();

   const hours =
      fullTimeRaw.getHours() > 12
         ? fullTimeRaw.getHours() - 11
         : fullTimeRaw.getHours();

   const fullTime = `${hours}:${fullTimeRaw.getMinutes()}${
      fullTimeRaw.getHours() > 12 ? 'PM' : 'AM'
   } on ${date}, ${year}`;
   const agoTime = convertISOtoAgo(time);

   const displayTime = showFullTime ? fullTime : `${agoTime} ago`;
   const titleTime = showFullTime ? agoTime : fullTime;

   const styleObject = {};
   let onClick;
   if (toggleable === true) {
      styleObject.cursor = 'pointer';
      onClick = () => setShowFullTime(!showFullTime);
   }

   return (
      <span style={styleObject} title={titleTime} onClick={onClick}>
         {displayTime}
      </span>
   );
};

export default TimeAgo;
