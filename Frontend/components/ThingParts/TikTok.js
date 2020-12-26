import { useEffect, useRef } from 'react';
import { getTikTokIDFromLink } from '../../lib/UrlHandling';

const TikTok = ({ url }) => {
   const containerRef = useRef(null);
   useEffect(() => {
      const thisTikTok = containerRef.current;
      const thisTikTokRect = thisTikTok.getBoundingClientRect();
      let thisTikTokWidth = thisTikTokRect.width;

      let tikTokMaxWidth = 542; // Right now, the tiktok iframe puts this max width its contents
      let tikTokAspectRatio = 1.344; // Right now, this is the aspect ratio of what tiktok renders in its iframe;
      if (thisTikTokWidth < tikTokMaxWidth) {
         // When the embed space is less than that width though, it switches to a thinner player with this max width and aspect ratio
         tikTokMaxWidth = 325;
         tikTokAspectRatio = 2.33;
      }

      if (thisTikTokWidth > tikTokMaxWidth) {
         thisTikTokWidth = tikTokMaxWidth;
      }

      const thisTikTokHeight = thisTikTokWidth * tikTokAspectRatio;
      thisTikTok.style.width = `${thisTikTokWidth}px`;
      thisTikTok.style.height = `${thisTikTokHeight}px`;

      const thisIframe = thisTikTok.querySelector('iframe');
      thisIframe.style.height = '100%';
      thisIframe.style.borderRadius = '9px';
   }, []);

   const tiktokID = getTikTokIDFromLink(url.toLowerCase());
   return (
      <div className="tiktokContainer" ref={containerRef}>
         <iframe
            src={`https://www.tiktok.com/embed/v2/${tiktokID}?lang=en-US`}
            frameBorder="0"
            allowFullScreen
         />
      </div>
   );
};

export default TikTok;
