import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const DefaultAvatar = ({ onClick, className, id }) => {
   const { mainText, lowContrastGrey } = useContext(ThemeContext);
   return (
      <svg
         id={id == null ? 'a9920ca9-7f4e-4d7c-88c9-8defa11e18b3' : id}
         className={
            className == null ? 'defaultAvatar' : `defaultAvatar ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <rect width="200" height="200" fill={lowContrastGrey} />
         <path
            d="M139,113.5h-7.35a49.94,49.94,0,0,1-66.1,0H62a42,42,0,0,0-42,42v45H181v-45A42,42,0,0,0,139,113.5Z"
            fill={mainText}
         />
         <circle cx="98.75" cy="68" r="50" fill={mainText} />
      </svg>
   );
};
export default DefaultAvatar;
