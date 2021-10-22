const PlaceholderThing = ({ borderSide, contentType, expanded }) => {
   console.log(expanded);
   return (
      <article
         className={`placeholderThing${
            expanded ? '' : ' small'
         } border${borderSide}`}
      >
         <div className="placeholderHeader">
            <div className="placeholderTitle backgroundGradient" />
            <div className="placeholderToolbar">
               <div className="toolbarLeft backgroundGradient" />
               <div className="toolbarRight backgroundGradient" />
            </div>
            {expanded && (
               <div className="placeholderVotebar backgroundGradient" />
            )}
         </div>
         {expanded && (
            <div className="placeholderFeaturedImage backgroundGradient" />
         )}
         {expanded && (
            <div className="placeholderContent">
               <div className="placeholderActualContent backgroundGradient" />
               <div className="placeholderContentButtons backgroundGradient" />
               <div className="placeholderContentSlider backgroundGradient" />
            </div>
         )}
      </article>
   );
};

export default PlaceholderThing;
