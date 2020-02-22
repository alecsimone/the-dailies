import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const SidebarHeaderIcon = ({ onClick, className, icon }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   let contents;
   if (icon === 'You') {
      contents = [
         <circle cx="200" cy="58.5" r="49" />,
         <path d="M109.23,200c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76" />
      ];
   } else if (icon === 'Friends') {
      contents = [
         <circle cx="109" cy="59" r="49" />,
         <path d="M18.23,200.38c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76" />,
         <circle cx="291" cy="59" r="49" />,
         <path d="M200.23,200.38c0-50.68,40.64-91.76,90.77-91.76s90.77,41.08,90.77,91.76" />
      ];
   } else if (icon === 'Public') {
      contents = [
         <circle cx="96.12" cy="66.61" r="46.36" />,
         <path d="M10.23,200.38c0-47.95,38.46-86.83,85.89-86.83S182,152.43,182,200.38" />,
         <circle cx="303.88" cy="66.61" r="46.36" />,
         <path d="M218,200.38c0-47.95,38.45-86.83,85.88-86.83s85.89,38.88,85.89,86.83" />,
         <circle cx="200.32" cy="50.92" r="28.92" strokeWidth="12" />,
         <path
            d="M146.74,134.38c0-29.91,24-54.17,53.58-54.17s53.58,24.26,53.58,54.17"
            strokeWidth="12"
         />
      ];
   } else if (icon === 'Tag') {
      contents = [
         <polygon points="102.5 100.46 154.31 44.42 296 44.42 296 156.5 154.31 156.5 102.5 100.46" />,
         <circle cx="160" cy="99" r="16.5" strokeWidth="12" />,
         <line x1="193" y1="77" x2="278" y2="77" strokeWidth="12" />,
         <line x1="193" y1="100" x2="278" y2="100" strokeWidth="12" />,
         <line x1="193" y1="122" x2="278" y2="122" strokeWidth="12" />
      ];
   } else if (icon === 'Category') {
      contents = [
         <path d="M198.57,148.24,140,121.2,96.87,141.3a.89.89,0,0,0,0,1.65l101.69,47a1.08,1.08,0,0,0,.88,0l103.67-47a.89.89,0,0,0,0-1.65L259.58,121l-60.13,27.24A1.08,1.08,0,0,1,198.57,148.24Z" />,
         <path d="M303.13,99.63l-43.55-20.3-60.13,27.24a1,1,0,0,1-.88,0L140,79.53,96.87,99.63a.89.89,0,0,0,0,1.65L140,121.2l58.56,27a1.08,1.08,0,0,0,.88,0L259.58,121l43.54-19.72A.89.89,0,0,0,303.13,99.63Z" />,
         <path d="M198.57,106.57a1,1,0,0,0,.88,0l60.13-27.24,43.54-19.72a.89.89,0,0,0,0-1.65L200.46,10.1a1.09,1.09,0,0,0-.9,0L96.87,58a.89.89,0,0,0,0,1.65L140,79.53Z" />
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
