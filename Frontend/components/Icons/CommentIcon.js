import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const CommentIcon = ({ onClick, className }) => {
   const { lowContrastGrey } = useContext(ThemeContext);
   return (
      <svg
         id="f8f13fd4-4c89-40e1-bbc2-4e46f1ac30b5"
         className={
            className == null ? 'commentIcon' : `commentIcon ${className}`
         }
         data-name="Comment Icon"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <rect
            className="cls-1"
            x="1"
            y="2.25"
            width="198"
            height="151.04"
            rx="30"
            fill={lowContrastGrey}
         />
         <polygon
            className="cls-1"
            points="100 197.75 139 151.29 61 151.29 100 197.75"
            fill={lowContrastGrey}
         />
      </svg>
   );
};
export default CommentIcon;
