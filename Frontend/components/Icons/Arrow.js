import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const ArrowIcon = ({ onClick, className, pointing = 'down', titleText }) => {
   const { mainText } = useContext(ThemeContext);
   const style = {
      transition: 'all .3s',
      cursor: 'pointer'
   };
   switch (pointing.toLowerCase()) {
      case 'down':
         style.transform = `rotateX(0deg)`;
         break;
      case 'left':
         style.transform = `rotate(-90deg) rotateX(180deg)`;
         break;
      case 'up':
         style.transform = `rotateX(180deg)`;
         break;
      case 'right':
         style.transform = `rotate(-90deg) rotateX(0deg)`;
         break;
   }

   return (
      <svg
         id="ArrowIcon"
         className={className == null ? 'arrow' : `arrow ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
         style={style}
      >
         {titleText != null && <title>{titleText}</title>}
         <rect
            x="45.11"
            y="35.05"
            width="33.33"
            height="141.41"
            transform="translate(-56.68 74.66) rotate(-45)"
            fill={mainText}
         />
         <rect
            x="68"
            y="89.14"
            width="140.9"
            height="33.21"
            transform="translate(-34.22 128.87) rotate(-45)"
            fill={mainText}
         />
      </svg>
   );

   // Old way with space around it
   return (
      <svg
         id="ArrowIcon"
         className={className == null ? 'arrow' : `arrow ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
         style={style}
      >
         {titleText != null && <title>{titleText}</title>}
         <rect
            x="70.35"
            y="67.57"
            width="18"
            height="76.37"
            transform="translate(-51.54 87.08) rotate(-45)"
            fill={mainText}
         />
         <rect
            x="111.63"
            y="67.57"
            width="18"
            height="76.37"
            transform="translate(131.15 265.82) rotate(-135)"
            fill={mainText}
         />
      </svg>
   );
};
export default ArrowIcon;
