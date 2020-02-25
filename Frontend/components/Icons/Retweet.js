import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const RetweetIcon = ({ onClick, className }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <svg
         id="fc51dd48-ee6b-4d58-bcb0-ace7e00b7fff"
         className={
            className == null ? 'retweetIcon' : `retweetIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <path
            d="M76.33,63.24h73A3.64,3.64,0,0,1,153,66.87v58.24H178.7V66.87A29.4,29.4,0,0,0,149.33,37.5H53.88Z"
            fill={lowContrastGrey}
         />
         <path
            d="M121.94,135.51H49.67a3.63,3.63,0,0,1-3.62-3.63V75.61H20.31v56.27a29.4,29.4,0,0,0,29.36,29.37h94.72Z"
            fill={lowContrastGrey}
         />
         <polygon
            points="34.16 37.99 1 75.61 67.33 75.61 34.16 37.99"
            fill={lowContrastGrey}
         />
         <polygon
            points="165.84 162.41 199 124.78 132.67 124.78 165.84 162.41"
            fill={lowContrastGrey}
         />
      </svg>
   );
};
export default RetweetIcon;
