const HeartIcon = ({ onClick, className }) => (
   <svg
      id="e13935fa-6252-4ace-a206-a6d1c1d4c8b6"
      className={className == null ? 'heartIcon' : `heartIcon ${className}`}
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 30"
      onClick={onClick}
   >
      <path d="M22.8,2.21c-3,0-5.62,2.4-6.78,5-1.16-2.59-3.74-5-6.77-5A7.53,7.53,0,0,0,1.76,9.7c0,8.38,8.47,10.61,14.26,18.9,5.44-8.29,14.27-10.79,14.27-18.9A7.53,7.53,0,0,0,22.8,2.21Z" />
   </svg>
);
export default HeartIcon;
