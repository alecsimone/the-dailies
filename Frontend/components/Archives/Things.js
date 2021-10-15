import styled from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import SmallThingCard from '../ThingCards/SmallThingCard';
import ThingCard from '../ThingCards/ThingCard';
import { setAlpha } from '../../styles/functions';
import FlexibleThingCard from '../ThingCards/FlexibleThingCard';
import MemberProvider, { MemberContext } from '../Account/MemberProvider';

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
            margin-bottom: 0;
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
         &.big {
            &:first-child {
               margin-top: 0;
            }
         }
      }
      .flexibleThingCard.big {
         margin: 2rem auto;
      }
   }
`;

const Things = ({ things, displayType, cardSize, noPic, borderSide }) => {
   const {
      mobileBPWidthRaw,
      desktopBPWidthRaw,
      bigScreenBPWidthRaw,
      massiveScreenBPWidthRaw
   } = useContext(ThemeContext);

   const { me } = useContext(MemberContext);

   const thingCards = things.map(thing => {
      let canEdit = false;
      if (me && thing.author.id === me.id) {
         canEdit = true;
      }
      if (me && ['Admin', 'Editor', 'Moderator'].includes(me.role)) {
         canEdit = true;
      }
      return (
         <FlexibleThingCard
            key={thing.id}
            expanded={cardSize === 'regular'}
            thingData={thing}
            contentType="single"
            canEdit={canEdit}
            titleLink
            borderSide={borderSide}
            noPic={noPic}
         />
      );
      // if (cardSize === 'regular') {
      //    return (
      //       <ThingCard data={thing} key={thing.id} borderSide={borderSide} />
      //    );
      // }
      // return (
      //    <SmallThingCard
      //       data={thing}
      //       key={thing.id}
      //       noPic={noPic}
      //       borderSide={borderSide}
      //    />
      // );
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
   noPic: PropTypes.bool
};

export default Things;
