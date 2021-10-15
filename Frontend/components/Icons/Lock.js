import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const LockIcon = ({
   onClick,
   className,
   color = 'lowContrastGrey',
   privacy
}) => {
   const theme = useContext(ThemeContext);
   const { majorColor, midBlack } = theme;
   let computedColor;
   if (theme[color] != null) {
      computedColor = theme[color];
   } else {
      computedColor = color;
   }

   let privacyLevel = 0;
   let properPrivacyName = 'Public';
   if (privacy === 'FriendsOfFriends') {
      privacyLevel = 1;
      properPrivacyName = 'Friends of Friends';
   }
   if (privacy === 'Friends') {
      privacyLevel = 2;
      properPrivacyName = 'Friends';
   }
   if (privacy === 'Private') {
      privacyLevel = 3;
      properPrivacyName = 'Private';
   }

   return (
      <svg
         id="f964c0e5-369d-4384-af55-c6c327964466"
         className={className == null ? 'lockIcon' : `lockIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 160 200"
         onClick={onClick}
      >
         <title>{properPrivacyName}</title>
         <path
            className="lockBody"
            d="M161,81H40A18.05,18.05,0,0,0,22,99v82a18.05,18.05,0,0,0,18,18H161a18.05,18.05,0,0,0,18-18V99A18.05,18.05,0,0,0,161,81Zm-20,88H59a9,9,0,0,1,0-18h82a9,9,0,0,1,0,18Zm0-40H59a9,9,0,0,1,0-18h82a9,9,0,0,1,0,18Z"
            transform="translate(-22 -1)"
            fill={computedColor}
         />
         {privacyLevel > 0 && (
            <path
               d="M61,83V45c3.31-19.73,20.49-34.15,40-34a40.61,40.61,0,0,1,39,32V84a61.4,61.4,0,0,1,2,7"
               transform="translate(-22 -1)"
               fill="none"
               stroke={computedColor}
               strokeMiterlimit="10"
               strokeWidth="20"
            />
         )}
         {privacyLevel === 0 && (
            <path
               d="M61,47.44V45c3.31-19.73,20.49-34.15,40-34a40.6,40.6,0,0,1,39,32V84c.47,1.32.95,2.81,1.39,4.45"
               transform="translate(-22 -1)"
               fill="none"
               stroke={computedColor}
               strokeMiterlimit="10"
               strokeWidth="20"
            />
         )}
         {privacyLevel === 3 && (
            <rect
               className="privacyOne privacyIndicator"
               x="28"
               y="110"
               width="100"
               height="18"
               rx="9"
               fill={majorColor}
            />
         )}
         {privacyLevel >= 2 && (
            <rect
               className="privacyTwo privacyIndicator"
               x="28"
               y="150"
               width="100"
               height="18"
               rx="9"
               fill={majorColor}
            />
         )}
      </svg>
   );
};

export default LockIcon;
