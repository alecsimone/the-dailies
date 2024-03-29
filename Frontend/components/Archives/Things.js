import styled, { ThemeContext } from 'styled-components';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useContext } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { setAlpha } from '../../styles/functions';
import useMe from '../Account/useMe';
import CardGenerator from '../ThingCards/CardGenerator';

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

const Things = ({
   things,
   displayType,
   cardSize = 'regular',
   contentType = 'single',
   noPic,
   borderSide,
   hideConnections,
   draggable = false,
   groupName = 'unnamed',
   showEmptyContent
}) => {
   const { desktopBPWidthRaw, bigScreenBPWidthRaw } = useContext(ThemeContext);

   const {
      loggedInUserID,
      memberFields: { role }
   } = useMe('Things', 'role');

   const thingCards = things.map((thing, index) => (
      <CardGenerator
         id={thing.id != null ? thing.id : thing}
         cardType={cardSize}
         hideConnections={hideConnections}
         contentType={contentType}
         noPic={noPic}
         borderSide={borderSide}
         draggable={draggable}
         groupName={groupName}
         index={index}
         showEmptyContent={showEmptyContent}
      />
   ));
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
   if (draggable) {
      return (
         <Droppable droppableId={groupName} type="card">
            {provided => (
               <StyledThings
                  className={`things ${displayType}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
               >
                  {thingCards}
               </StyledThings>
            )}
         </Droppable>
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
