import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const SidebarHeaderIcon = ({ onClick, className, icon }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   let contents;
   if (icon.toLowerCase() === 'you') {
      contents = [
         <circle key="youCircle1" cx="200" cy="58.5" r="49" />,
         <path
            key="youPath1"
            d="M109.23,200c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76"
         />
      ];
   } else if (icon.toLowerCase() === 'friends') {
      contents = [
         <circle key="friendsCircle1" cx="109" cy="59" r="49" />,
         <path
            key="friendsPath1"
            d="M18.23,200.38c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76"
         />,
         <circle key="friendsCircle2" cx="291" cy="59" r="49" />,
         <path
            key="friendsPath2"
            d="M200.23,200.38c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76"
         />
      ];
   } else if (icon.toLowerCase() === 'public') {
      contents = [
         <circle key="publicCircle1" cx="96.12" cy="66.61" r="46.36" />,
         <path
            key="publicPath1"
            d="M10.23,200.38c0-47.95,38.46-86.83,85.89-86.83S182,152.43,182,200.38"
         />,
         <circle key="publicCircle2" cx="303.88" cy="66.61" r="46.36" />,
         <path
            key="publicPath2"
            d="M218,200.38c0-47.95,38.45-86.83,85.88-86.83s85.89,38.88,85.89,86.83"
         />,
         <circle
            key="publicCircle3"
            cx="200.32"
            cy="50.92"
            r="28.92"
            strokeWidth="12"
         />,
         <path
            key="publicPath3"
            d="M146.74,134.38c0-29.91,24-54.17,53.58-54.17s53.58,24.26,53.58,54.17"
            strokeWidth="12"
         />
      ];
   } else if (icon.toLowerCase() === 'tag') {
      contents = [
         <polygon
            key="tagPolygon1"
            points="102.5 100.46 154.31 44.42 296 44.42 296 156.5 154.31 156.5 102.5 100.46"
         />,
         <circle key="tagCircle1" cx="160" cy="99" r="16.5" strokeWidth="12" />,
         <line
            key="tagLine1"
            x1="193"
            y1="77"
            x2="278"
            y2="77"
            strokeWidth="12"
         />,
         <line
            key="tagLine2"
            x1="193"
            y1="100"
            x2="278"
            y2="100"
            strokeWidth="12"
         />,
         <line
            key="tagLine3"
            x1="193"
            y1="122"
            x2="278"
            y2="122"
            strokeWidth="12"
         />
      ];
   } else if (icon.toLowerCase() === 'stack') {
      contents = [
         <path
            key="stackPath1"
            d="M198.57,148.24,140,121.2,96.87,141.3a.89.89,0,0,0,0,1.65l101.69,47a1.08,1.08,0,0,0,.88,0l103.67-47a.89.89,0,0,0,0-1.65L259.58,121l-60.13,27.24A1.08,1.08,0,0,1,198.57,148.24Z"
            strokeMiterlimit="10"
            strokeWidth="12"
         />,
         <path
            key="stackPath2"
            d="M303.13,99.63l-43.55-20.3-60.13,27.24a1,1,0,0,1-.88,0L140,79.53,96.87,99.63a.89.89,0,0,0,0,1.65L140,121.2l58.56,27a1.08,1.08,0,0,0,.88,0L259.58,121l43.54-19.72A.89.89,0,0,0,303.13,99.63Z"
            strokeMiterlimit="10"
            strokeWidth="12"
         />,
         <path
            key="stackPath3"
            d="M198.57,106.57a1,1,0,0,0,.88,0l60.13-27.24,43.54-19.72a.89.89,0,0,0,0-1.65L200.46,10.1a1.09,1.09,0,0,0-.9,0L96.87,58a.89.89,0,0,0,0,1.65L140,79.53Z"
            strokeMiterlimit="10"
            strokeWidth="12"
         />
      ];
   } else if (icon.toLowerCase() === 'tweets') {
      contents = [
         <path
            key="tweetsPath"
            d="M320.19,26.05a98.81,98.81,0,0,1-28.32,7.76A49.49,49.49,0,0,0,313.55,6.52a98.46,98.46,0,0,1-31.32,12,49.34,49.34,0,0,0-85.3,33.77,50.12,50.12,0,0,0,1.27,11.22A140,140,0,0,1,96.55,11.94a49.38,49.38,0,0,0,15.27,65.84,49.08,49.08,0,0,1-22.34-6.17v.64A49.34,49.34,0,0,0,129,120.61a50.08,50.08,0,0,1-22.27.84,49.32,49.32,0,0,0,46.07,34.24,99,99,0,0,1-61.25,21.12,99.76,99.76,0,0,1-11.78-.69,139.46,139.46,0,0,0,75.59,22.16c90.72,0,140.32-75.14,140.32-140.31,0-2.12-.05-4.26-.15-6.38a99.9,99.9,0,0,0,24.59-25.51Z"
            stroke="none"
            fill={lowContrastGrey}
         />
      ];
   }
   return (
      <svg
         id="sidebarHeaderIcon"
         className={
            className == null
               ? `sidebarHeaderIcon ${icon}`
               : `sidebarHeaderIcon ${className} ${icon}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 400 200"
         onClick={onClick}
         fill="none"
         stroke={lowContrastGrey}
         strokeMiterlimit="10"
         strokeWidth="18"
      >
         {contents}
      </svg>
   );
};

export default SidebarHeaderIcon;
