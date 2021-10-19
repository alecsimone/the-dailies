import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const TrashIcon = ({ onClick, className, onMouseDown, titleText }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <svg
         id="f480651e-4780-4752-9245-6b9771882308"
         className={className == null ? 'trashIcon' : `trashIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
         onMouseDown={onMouseDown}
      >
         <path
            d="M38.22,49.44H162.08a0,0,0,0,1,0,0v129.7a10,10,0,0,1-10,10H48.22a10,10,0,0,1-10-10V49.44A0,0,0,0,1,38.22,49.44Z"
            fill="none"
            stroke={lowContrastGrey}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
         {titleText != null && <title>{titleText}</title>}
         <rect
            x="12.3"
            y="35.04"
            width="175.7"
            height="17.28"
            rx="4.24"
            fill={lowContrastGrey}
         />
         <path
            d="M64.15,40.8V35S67,12,72.79,12h53.28c5.76,0,8.64,23,8.64,23V40.8"
            fill="none"
            stroke={lowContrastGrey}
            strokeMiterlimit="10"
            strokeWidth="12"
         />
         <rect
            x="59.83"
            y="76.81"
            width="17.28"
            height="80.65"
            rx="3.2"
            fill={lowContrastGrey}
         />
         <rect
            x="91.51"
            y="76.81"
            width="17.28"
            height="80.65"
            rx="3.2"
            fill={lowContrastGrey}
         />
         <rect
            x="123.19"
            y="76.81"
            width="17.28"
            height="80.65"
            rx="3.2"
            fill={lowContrastGrey}
         />
      </svg>
   );
};
export default TrashIcon;
