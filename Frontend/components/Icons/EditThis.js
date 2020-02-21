import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { setLightness } from '../../styles/functions';

const EditThis = ({ onClick, className, onMouseDown }) => {
   const { majorColor } = useContext(ThemeContext);
   return (
      <svg
         id="f3c2c8ac-488f-4df8-9095-6d31dc4af612"
         className={className == null ? 'editThis' : `editThis ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         onClick={onClick}
         onMouseDown={onMouseDown}
      >
         {/* Tip */}
         <path
            d="M4.79,198.43l46.92-7.12a3,3,0,0,0,1.67-5.09L13.59,146.44a3,3,0,0,0-5.09,1.67L1.38,195A3,3,0,0,0,4.79,198.43Z"
            fill={setLightness(majorColor, 60)}
         />
         {/* Middle */}
         <rect
            x="56.25"
            y="45.37"
            width="65"
            height="132"
            rx="1"
            transform="translate(72.6 252.88) rotate(-135)"
            fill={setLightness(majorColor, 60)}
         />
         {/* Eraser */}
         <path
            d="M129,17.69h63a1,1,0,0,1,1,1V55.25a8,8,0,0,1-8,8H136a8,8,0,0,1-8-8V18.69a1,1,0,0,1,1-1Z"
            transform="translate(245.42 182.6) rotate(-135)"
            fill={setLightness(majorColor, 60)}
         />
      </svg>
   );
};
export default EditThis;
