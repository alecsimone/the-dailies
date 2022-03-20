import styled from 'styled-components';
import { setAlpha, setLightness } from '../styles/functions';
import PlaceholderThing from './ThingParts/PlaceholderThing';

const StyledPlaceholderThings = styled.section`
   .backgroundGradient {
      background: linear-gradient(
         270deg,
         ${props => setAlpha(props.theme.lowContrastGrey, 0.4)},
         ${props =>
            setAlpha(setLightness(props.theme.lowContrastGrey, 20), 0.4)}
      );
      background-size: 150% 150%;

      -webkit-animation: PlaceholderBackground 2.5s ease infinite;
      -moz-animation: PlaceholderBackground 2.5s ease infinite;
      animation: PlaceholderBackground 2.5s ease infinite;
   }

   @-webkit-keyframes PlaceholderBackground {
      0% {
         background-position: 0% 50%;
      }
      50% {
         background-position: 100% 50%;
      }
      100% {
         background-position: 0% 50%;
      }
   }
   @-moz-keyframes PlaceholderBackground {
      0% {
         background-position: 0% 50%;
      }
      50% {
         background-position: 100% 50%;
      }
      100% {
         background-position: 0% 50%;
      }
   }
   @keyframes PlaceholderBackground {
      0% {
         background-position: 0% 50%;
      }
      50% {
         background-position: 100% 50%;
      }
      100% {
         background-position: 0% 50%;
      }
   }

   article {
      ${props => props.theme.thingColors};
      margin: 3rem auto;
      width: 100%;
      max-width: 100%;
      padding: 0;
      border: none;
      border-radius: 4px;
      border-top: 0.5rem solid ${props => props.theme.lowContrastGrey};
      ${props => props.theme.mobileBreakpoint} {
         max-width: min(1200px, calc(100% - 1rem));
         padding: 1rem 2rem 1.5rem;
         ${props => props.theme.thingColors};
         border-top: 0.5rem solid ${props => props.theme.lowContrastGrey};
      }
      &.borderleft {
         border-top: none;
         border-left: 0.5rem solid ${props => props.theme.lowContrastGrey};
         ${props => props.theme.mobileBreakpoint} {
            border-top: none;
            border-left: 0.5rem solid ${props => props.theme.lowContrastGrey};
         }
      }
      &.small {
         margin: 0 auto;
         border-radius: 0;
         background: ${props => props.theme.deepBlack};
         ${props => props.theme.mobileBreakpoint} {
            background: ${props => props.theme.deepBlack};
         }
         padding: 1.5rem 1rem;
         .placeholderHeader {
            margin-bottom: 0;
            .placeholderTitle {
               margin-bottom: 3rem;
            }
            .placeholderToolbar {
               .toolbarLeft,
               .toolbarRight {
                  margin-bottom: 0;
               }
            }
         }
      }
      &:first-child {
         margin-top: 0;
      }
      > * {
         width: 100%;
         border-radius: 4px;
         > * {
            width: 100%;
            border-radius: 4px;
         }
      }
      .placeholderHeader {
         padding: 0 2rem;
         margin: 0 -2rem 2rem;
         width: calc(100% + 4rem);
         .placeholderTitle {
            height: 4rem;
            margin-bottom: 2rem;
         }
         .placeholderToolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .toolbarLeft,
            .toolbarRight {
               height: 2rem;
               margin-bottom: 1rem;
               border-radius: 4px;
            }
            .toolbarLeft {
               width: 11rem;
            }
            .toolbarRight {
               width: 30rem;
            }
         }
         .placeholderVotebar {
            height: 6rem;
         }
      }
      .placeholderFeaturedImage {
         height: 60rem;
         width: calc(100% + 4rem);
         margin-left: -2rem;
         margin-bottom: 3rem;
         border-radius: 0;
      }
      .placeholderContent {
         background: ${props => props.theme.deepBlack};
         padding: 1.5rem;
         .placeholderActualContent {
            height: 30rem;
            margin-bottom: 2rem;
         }
         .placeholderContentButtons {
            height: 5rem;
            margin-bottom: 1rem;
         }
         .placeholderContentSlider {
            height: 5rem;
         }
      }
   }
`;

const PlaceholderThings = ({
   count,
   cardSize,
   noPic,
   borderSide = 'top',
   contentType = 'full',
   expanded = false
}) => {
   const things = [];
   for (let i = 0; i < count; i += 1) {
      things.push(
         <PlaceholderThing
            noPic={noPic}
            borderSide={borderSide}
            contentType={contentType}
            expanded={expanded || cardSize === 'regular'}
         />
      );
   }
   return (
      <StyledPlaceholderThings className="placeholderThings">
         {things}
      </StyledPlaceholderThings>
   );
};
export default PlaceholderThings;
