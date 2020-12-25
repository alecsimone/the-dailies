import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled, { ThemeContext } from 'styled-components';
import { useState, useContext } from 'react';
import ArrowIcon from '../Icons/Arrow';
import { setLightness } from '../../styles/functions';

const SET_COLOR_MUTATION = gql`
   mutation SET_COLOR_MUTATION($color: String!, $id: ID!, $type: String!) {
      setColor(color: $color, id: $id, type: $type) {
         ... on Tag {
            __typename
            id
            color
         }
         ... on Stack {
            __typename
            id
            color
         }
         ... on Thing {
            __typename
            id
            color
         }
      }
   }
`;

const StyledColorSelector = styled.div`
   position: relative;
   font-size: ${props => props.theme.smallText};
   z-index: 3;
   .colorInput {
      padding: calc(0.25rem + 1px) 3rem;
      font-size: ${props => props.theme.smallText};
      color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
      border-radius: 0;
   }
   .arrowPadding {
      width: 3rem;
      height: 3rem;
      position: absolute;
      right: 0;
      bottom: 0;
      cursor: pointer;
      .arrow rect {
         fill: ${props => props.theme.lowContrastGrey};
      }
   }
   svg {
      width: 100%;
   }
   .suggestions {
      position: absolute;
      width: 100%;
      left: 0;
      top: calc(100% - 1px);
      background: ${props => props.theme.deepBlack};
      padding: 0;
      border: 1px solid ${props => props.theme.mainText};
      cursor: pointer;
      .colorSuggestion {
         position: relative;
         padding-left: calc(3rem - 1px);
         background: black;
         &.selected {
            background: ${props => props.theme.majorColor};
            color: ${props => props.theme.mainText};
         }
         &:hover {
            background: ${props => props.theme.majorColor};
            color: ${props => props.theme.mainText};
         }
         .colorDisplay {
            left: calc(0.5rem - 1px);
         }
      }
   }
`;

const ColorSelector = ({ initialColor, type, id }) => {
   const [showingSuggestions, setShowingSuggestions] = useState(false);
   const [currentColor, setCurrentColor] = useState(initialColor);

   const { majorColor, lowContrastGrey } = useContext(ThemeContext);

   const [setColor] = useMutation(SET_COLOR_MUTATION);

   const sendColorUpdate = async color => {
      const match = color.match(
         /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/i
      );
      if (match == null) {
         alert(
            "Please enter a valid CSS color value. Named colors aren't supported yet"
         );
         return;
      }
      setCurrentColor(color);
      hideSuggestions();
      await setColor({
         variables: {
            id,
            type,
            color
         },
         optimisticResponse: {
            __typename: 'Mutation',
            setColor: {
               __typename: type,
               id,
               color
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   const toggleSuggestions = () => {
      if (showingSuggestions) {
         hideSuggestions();
      } else {
         showSuggestions();
      }
   };

   const clickOutsideDetector = e => {
      if (
         !e.target.classList.contains('colorSuggestion') &&
         e.target.closest('.colorSelector') == null
      ) {
         hideSuggestions();
      }
   };

   const escapeDetector = e => {
      if (e.key === 'Escape') {
         hideSuggestions();
      }
   };

   const showSuggestions = () => {
      setShowingSuggestions(true);
      window.addEventListener('click', clickOutsideDetector);
      window.addEventListener('keydown', escapeDetector);
   };

   const hideSuggestions = () => {
      window.removeEventListener('click', clickOutsideDetector);
      window.removeEventListener('keydown', escapeDetector);
      setShowingSuggestions(false);
   };

   const handleKeyDown = e => {
      if (e.key === 'Escape') {
         setCurrentColor(initialColor);
      } else if (e.key === 'Enter') {
         sendColorUpdate(currentColor);
      }
   };

   const defaultColor = lowContrastGrey;
   const colorsArray = [
      [majorColor, 'Blue'],
      ['hsla(270, 70%, 30%, .9)', 'Purple'],
      ['hsla(130, 90%, 20%, .9)', 'Green'],
      ['hsla(50, 70%, 30%, .9)', 'Orange'],
      ['hsla(180, 90%, 25%, .9)', 'Teal'],
      ['hsla(0, 75%, 35%, .8)', 'Red'],
      ['hsla(0, 100%, 15%, .9)', 'Blood'],
      ['hsla(270, 40%, 60%, .8)', 'Light Purple'],
      [defaultColor, 'Grey']
   ];
   const suggestions = colorsArray.map(colorArray => (
      <div
         className={
            (initialColor == null && colorArray[0] === defaultColor) ||
            initialColor === colorArray[0]
               ? 'colorSuggestion selected'
               : 'colorSuggestion'
         }
         onClick={() => sendColorUpdate(colorArray[0])}
      >
         <div className="colorDisplay" style={{ background: colorArray[0] }} />
         {colorArray[1]}
      </div>
   ));

   return (
      <StyledColorSelector className="colorSelector">
         <div
            className="colorDisplay"
            style={{
               background: initialColor == null ? 'transparent' : initialColor
            }}
         />
         <input
            type="text"
            name="color"
            size={
               initialColor == null
                  ? defaultColor.length * 0.75
                  : initialColor.length * 0.75
            }
            maxLength={25}
            className="colorInput"
            value={currentColor == null ? defaultColor : currentColor}
            onChange={e => setCurrentColor(e.target.value)}
            onKeyDown={handleKeyDown}
         />
         <div className="arrowPadding" onClick={toggleSuggestions}>
            <ArrowIcon pointing="down" />
         </div>
         {showingSuggestions && (
            <div className="suggestions">{suggestions}</div>
         )}
      </StyledColorSelector>
   );
};
export default ColorSelector;
