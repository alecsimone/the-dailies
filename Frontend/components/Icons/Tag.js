import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const TagIcon = ({ onClick, className, color = 'lowContrastGrey' }) => {
   const theme = useContext(ThemeContext);
   let computedColor;
   if (theme[color] != null) {
      computedColor = theme[color];
   } else {
      computedColor = color;
   }
   return (
      <svg
         id="f964c0e5-369d-4384-af55-c6c327964466"
         className={className == null ? 'tagIcon' : `tagIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 214.76 130.08"
         onClick={onClick}
      >
         <polygon
            points="12.26 65.04 64.07 9 205.76 9 205.76 121.08 64.07 121.08 12.26 65.04"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="18"
         />
         <circle
            cx="69.76"
            cy="63.58"
            r="16.5"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
         <line
            x1="102.76"
            y1="41.58"
            x2="187.76"
            y2="41.58"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
         <line
            x1="102.76"
            y1="64.58"
            x2="187.76"
            y2="64.58"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
         <line
            x1="102.76"
            y1="86.58"
            x2="187.76"
            y2="86.58"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
      </svg>
   );
};

export default TagIcon;
