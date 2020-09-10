import styled from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';
import { setAlpha } from '../../styles/functions';

const StyledThings = styled.div`
   margin: auto;
   &.grid {
      .masonryContainer {
         display: flex;
         margin-left: -4rem; /* gutter offset, negative */
         width: auto;
      }
      .column {
         padding-left: 4rem; /* gutter offset, positive */
         background-clip: padding-box;
         .thingCard {
            margin-bottom: 2rem;
            ${props => props.theme.mobileBreakpoint} {
               margin-bottom: 4rem;
            }
         }
      }
   }
   &.list {
      article {
         margin: 0;
         border: none;
         box-shadow: none;
         border-bottom: 2px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         &:first-child {
            margin-top: 0;
         }
      }
      .regularThingCard {
         margin: 2rem auto;
      }
   }
`;

const Things = ({
   things,
   displayType,
   cardSize,
   noPic,
   scrollingParentSelector,
   perPage
}) => {
   const {
      mobileBPWidthRaw,
      desktopBPWidthRaw,
      bigScreenBPWidthRaw,
      massiveScreenBPWidthRaw
   } = useContext(ThemeContext);

   const [visibleThingCount, setVisibleThingCount] = useState(
      perPage != null ? perPage : things.length
   );

   const scrollHandler = e => {
      const scroller = e.target;
      const maxScroll = scroller.scrollHeight - scroller.offsetHeight;
      if (
         scroller.scrollTop > maxScroll - 500 &&
         visibleThingCount < things.length
      ) {
         setVisibleThingCount(visibleThingCount + perPage);
      }
   };

   useEffect(() => {
      const scroller = document.querySelector(scrollingParentSelector);
      if (scroller == null) return;
      scroller.addEventListener('scroll', scrollHandler);

      // On mobile, the element that scrolls is the whole page, which has the class styledPageWithSidebar
      const page = document.querySelector('.styledPageWithSidebar');
      if (page != null) {
         page.addEventListener('scroll', scrollHandler);
      }

      return () => {
         scroller.removeEventListener('scroll', scrollHandler);
         if (page != null) {
            page.removeEventListener('scroll', scrollHandler);
         }
      };
   }, [scrollHandler, scrollingParentSelector]);

   const truncatedThingList = things.slice(0, visibleThingCount);

   const thingCards = truncatedThingList.map(thing => {
      if (cardSize === 'regular') {
         return <ThingCard data={thing} key={thing.id} />;
      }
      return <SmallThingCard data={thing} key={thing.id} noPic={noPic} />;
   });
   if (displayType === 'grid') {
      return (
         <StyledThings className={`things ${displayType}`}>
            <Masonry
               breakpointCols={{
                  default: 1,
                  9999: 3,
                  [bigScreenBPWidthRaw]: 2,
                  [desktopBPWidthRaw]: 1
               }}
               className="masonryContainer"
               columnClassName="column"
            >
               {thingCards}
            </Masonry>
         </StyledThings>
      );
   }
   return (
      <StyledThings className={`things ${displayType}`}>
         {thingCards}
      </StyledThings>
   );
};
Things.propTypes = {
   things: PropTypes.array.isRequired,
   displayType: PropTypes.oneOf(['list', 'grid']),
   cardSize: PropTypes.oneOf(['regular', 'small']),
   noPic: PropTypes.bool,
   perPage: PropTypes.number
};

export default Things;
