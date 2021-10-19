import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ContentIcon = ({
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
         className={
            className == null ? 'contentIcon' : `contentIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <title>{titleText != null ? titleText : 'Content'}</title>
         <rect
            x="12"
            y="12"
            width="176"
            height="176"
            rx="12"
            stroke={computedColor}
            strokeMiterlimit="10"
            strokeWidth="24"
         />
         <rect
            x="40"
            y="77.3"
            width="120"
            height="12"
            rx="6"
            fill={computedColor}
         />
         <rect
            x="40"
            y="44"
            width="120"
            height="12"
            rx="6"
            fill={computedColor}
         />
         <rect
            x="40"
            y="110.6"
            width="120"
            height="12"
            rx="6"
            fill={computedColor}
         />
         <rect
            x="40"
            y="144"
            width="120"
            height="12"
            rx="6"
            fill={computedColor}
         />
      </svg>
   );
};

export default ContentIcon;
