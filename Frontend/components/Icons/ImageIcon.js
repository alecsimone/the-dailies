import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ImageIcon = ({
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
         id="f964c0e5-369d-4384-af55-c6c327964466"
         className={className == null ? 'imageIcon' : `imageIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <title>{titleText != null ? titleText : 'Featured Image'}</title>
         <polygon
            points="32 154 32 135.37 62.74 103.7 78.58 119.53 127.94 70.16 168 110.22 168 154 32 154"
            fill={computedColor}
         />
         <rect
            x="9"
            y="9"
            width="182"
            height="182"
            rx="18"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="24"
         />
         <circle cx="56.5" cy="67.5" r="18.5" fill={computedColor} />
      </svg>
   );
};

export default ImageIcon;
