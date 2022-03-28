import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const SearchIcon = ({
   onClick,
   className,
   color = 'lowContrastGrey',
   titleText
}) => {
   const theme = useContext(ThemeContext);
   let computedColor;
   if (theme[color] != null) {
      computedColor = theme[color];
   } else {
      computedColor = color;
   }
   return (
      <svg
         id="ba52d3af-b0c3-43f0-a708-6d72ae426c6b"
         className={
            className == null ? 'searchIcon' : `searchIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         {titleText != null ? (
            <title>{titleText}</title>
         ) : (
            <title>Search</title>
         )}
         <circle
            cx="80.39"
            cy="80.89"
            r="70.39"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="18"
         />
         <path
            d="M116.56,141.54h71a17.32,17.32,0,0,1,17.32,17.32v4.69a17.32,17.32,0,0,1-17.32,17.32h-71a0,0,0,0,1,0,0V141.54a0,0,0,0,1,0,0Z"
            transform="translate(161.06 -66.42) rotate(45)"
            fill={computedColor}
         />
      </svg>
   );
};

export default SearchIcon;
