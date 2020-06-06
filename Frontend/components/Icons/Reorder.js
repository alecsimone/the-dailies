import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ReorderIcon = ({ onClick, className }) => {
   const { mainText } = useContext(ThemeContext);
   return (
      <svg
         id="af9b09fc-44ac-4ec1-8ae5-5f06680feea2"
         className={
            className == null ? 'reorderIcon' : `reorderIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         fill={mainText}
         onClick={onClick}
      >
         <path d="M102.75,196.13l42.57-33.34a4.92,4.92,0,0,0-3-8.79H57.15a4.92,4.92,0,0,0-3,8.79l42.57,33.34A4.92,4.92,0,0,0,102.75,196.13Z" />
         <path d="M96.69,4.54,54.12,37.88a4.92,4.92,0,0,0,3,8.79h85.13a4.92,4.92,0,0,0,3-8.79L102.75,4.54A4.92,4.92,0,0,0,96.69,4.54Z" />
         <rect x="4.22" y="60" width="191" height="16" rx="5.5" />
         <rect x="4.22" y="92" width="191" height="16" rx="5.5" />
         <rect x="4.22" y="124" width="191" height="16" rx="5.5" />
      </svg>
   );
};
export default ReorderIcon;
