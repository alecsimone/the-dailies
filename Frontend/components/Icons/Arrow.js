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
