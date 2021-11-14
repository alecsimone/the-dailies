import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ConnectionsIcon = ({
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

   const circleStrokeWidth = '18';
   const lineStrokeWidth = '12';
   const strokeMiterLimit = '10';
   return (
      <svg
         id="f964c0e5-369d-4384-af55-c6c327964466"
         className={
            className == null
               ? 'connectionsIcon'
               : `connectionsIcon ${className}`
         }
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
      >
         <title>{titleText != null ? titleText : 'Connections'}</title>
         <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={circleStrokeWidth}
         />
         <circle
            cx="162"
            cy="40"
            r="20"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={circleStrokeWidth}
         />
         <circle
            cx="40"
            cy="162"
            r="20"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={circleStrokeWidth}
         />
         <circle
            cx="147"
            cy="147"
            r="20"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={circleStrokeWidth}
         />
         <line
            x1="73.5"
            y1="40.5"
            x2="153.5"
            y2="41.5"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={lineStrokeWidth}
         />
         <line
            x1="39.5"
            y1="152.5"
            x2="39.5"
            y2="73.5"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={lineStrokeWidth}
         />
         <line
            x1="64.5"
            y1="63.5"
            x2="131.5"
            y2="133.5"
            fill="none"
            stroke={computedColor}
            strokeMiterlimit={strokeMiterLimit}
            strokeWidth={lineStrokeWidth}
         />
      </svg>
   );
};

export default ConnectionsIcon;
