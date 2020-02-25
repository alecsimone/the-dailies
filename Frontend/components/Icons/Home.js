import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const HomeIcon = ({ onClick, className }) => {
   const { mainText } = useContext(ThemeContext);
   return (
      <svg
         id="af9b09fc-44ac-4ec1-8ae5-5f06680feea2"
         className={className == null ? 'homeIcon' : `homeIcon ${className}`}
         data-name="Layer 1"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 200 200"
         fill={mainText}
         onClick={onClick}
      >
         <path d="M185.1,77,102.5,3.64a4.36,4.36,0,0,0-5.78,0L14.11,77h0V199H75.74V147.29a11.94,11.94,0,0,1,11.94-11.93h23.86a11.93,11.93,0,0,1,11.93,11.93V199h61.66V77Z" />
      </svg>
   );
};
export default HomeIcon;
