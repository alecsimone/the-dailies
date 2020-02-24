import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ResetIcon = ({ onClick, className }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <svg
         id="ad22c6b9-2e17-48d5-907e-495e07a23fb4"
         className={className == null ? 'resetIcon' : `resetIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <path
            d="M30.56,133.69A79.19,79.19,0,1,0,102.25,21C77.88,21,55.54,33.75,41,51L35,69"
            fill="none"
            stroke={lowContrastGrey}
            strokeMiterlimit="10"
            strokeWidth="24"
         />
         <polygon points="4 35 23 92 82 67 4 35" fill={lowContrastGrey} />
      </svg>
   );
};
export default ResetIcon;
