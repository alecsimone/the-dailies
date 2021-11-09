import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const HashtagIcon = ({
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
            className == null ? 'hashtagIcon' : `hashtagIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <title>{titleText != null ? titleText : 'Hashtags'}</title>
         <path
            d="M91.65.81h0C85.79-1,79.65,2.91,78,9.52L34.68,183.88c-1.64,6.61,1.81,13.49,7.67,15.31h0c5.86,1.82,12-2.1,13.64-8.71L99.32,16.12C101,9.51,97.51,2.63,91.65.81Z"
            fill={computedColor}
         />
         <path
            d="M157.05,0h0c-5.91-1.66-11.94,2.41-13.41,9.06L104.88,184.53c-1.46,6.64,2.17,13.44,8.07,15.1h0c5.91,1.66,11.94-2.42,13.41-9.06L165.12,15.13C166.58,8.48,163,1.69,157.05,0Z"
            fill={computedColor}
         />
         <rect y="123" width="178" height="22" rx="11" fill={computedColor} />
         <rect
            x="22"
            y="55"
            width="178"
            height="22"
            rx="11"
            fill={computedColor}
         />
      </svg>
   );
};

export default HashtagIcon;
