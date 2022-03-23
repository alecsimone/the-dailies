import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const HamburgerIcon = ({
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
            className == null ? 'hamburgerIcon' : `hamburgerIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <title>{titleText != null ? titleText : 'Menu'}</title>
         <rect y="160" width="200" height="40" rx="15" fill={computedColor} />
         <rect y="80" width="200" height="40" rx="15" fill={computedColor} />
         <rect y="0" width="200" height="40" rx="15" fill={computedColor} />
      </svg>
   );
};

export default HamburgerIcon;
