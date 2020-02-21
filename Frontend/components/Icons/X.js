import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const X = ({
   color = 'warning',
   rotation,
   onClick,
   className,
   onMouseDown
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
         id="a23f2002-ee4f-4033-aa76-7975350236a6"
         className={className == null ? 'x' : `x ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
         onMouseDown={onMouseDown}
      >
         <rect
            x="73.73"
            y="-15.06"
            width="52"
            height="230.58"
            transform="translate(-41.66 99.87) rotate(-45)"
            fill={computedColor}
         />
         <rect
            x="73.73"
            y="-15.06"
            width="52"
            height="230.58"
            transform="translate(99.37 241.62) rotate(-135)"
            fill={computedColor}
         />
      </svg>
   );
};
export default X;
