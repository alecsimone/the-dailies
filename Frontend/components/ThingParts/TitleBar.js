import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { useSelector } from 'react-redux';
import { setAlpha, dynamicallyResizeElement } from '../../styles/functions';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';

const SET_TITLE_MUTATION = gql`
   mutation SET_TITLE_MUTATION($title: String!, $id: ID!, $type: String!) {
      setStuffTitle(title: $title, id: $id, type: $type) {
         ... on Thing {
            __typename
            id
            title
         }
         ... on Tag {
            __typename
            id
            title
         }
         ... on Stack {
            __typename
            id
            title
         }
      }
   }
`;
export { SET_TITLE_MUTATION };

const useTitleBarData = (thingID, type) => {
   const titleBarData = {};
   titleBarData.title = useSelector(
      state => state.stuff[`${type}:${thingID}`].title
   );
   titleBarData.score = useSelector(
      state => state.stuff[`${type}:${thingID}`].score
   );
   return titleBarData;
};

const StyledTitleBar = styled.div`
   padding: 0 0.5rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
   }
   form {
      display: flex;
      align-items: center;
      textarea {
         flex-grow: 1;
      }
      span.score {
         width: auto;
         color: ${props => props.theme.secondaryAccent};
      }
   }
   h3,
   textarea {
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => setAlpha(props.theme.mainText, 1)};
      padding: 0;
      margin: 0;
      line-height: 1.4;
      width: 100%;
      border: none;
   }
   textarea {
      height: 3rem;
      resize: none;
      display: inline;
      &:focus {
         border: none;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      }
   }
`;

const TitleBar = ({ limit, canEdit = true, type, id, showingScore }) => {
   const { title, score } = useTitleBarData(id, type);

   const [editedTitle, setEditedTitleState] = useState(title);
   const editedTitleRef = useRef(editedTitle);

   const setEditedTitle = data => {
      setEditedTitleState(data);
      editedTitleRef.current = data;
   };

   /* eslint-disable react-hooks/exhaustive-deps */
   useEffect(() => {
      setEditedTitle(title); // This is to handle changes coming in from context. We display the data from state, which was initialized from context, but we need this effect to keep state in line with context
   }, [title]);
   /* eslint-enable */

   const [setStuffTitle] = useMutation(SET_TITLE_MUTATION, {
      onError: err => alert(err.message)
   });

   useEffect(() => {
      const inputs = document.querySelectorAll(`.titleInput`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            dynamicallyResizeElement(input, false);
         });
      }
   });

   const handleKeydown = e => {
      if (e.key === 'Escape') {
         setEditedTitle(title);
         e.target.blur();
      } else if (e.key === 'Enter') {
         submitTitle();
         e.target.blur();
      }
   };

   const submitTitle = async () => {
      // setFullThingToLoading(id);
      setStuffTitle({
         variables: {
            title: editedTitleRef.current,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            setStuffTitle: {
               __typename: type,
               id,
               title: editedTitleRef.current
            }
         }
      });
   };

   const clickOutsideDetector = e => {
      if (e.target.id !== 'titleInput') {
         if (title !== editedTitleRef.current) {
            submitTitle();
         }
         window.removeEventListener('click', clickOutsideDetector);
         const titleInput = document.querySelector('#titleInput');
         if (titleInput == null) return;
         titleInput.spellcheck = false;
      }
   };

   const scoreText = `(+${score}) `;

   let titleElement;
   if (canEdit) {
      titleElement = (
         <form onSubmit={submitTitle}>
            {showingScore && <span className="score">{scoreText}</span>}
            <textarea
               id="titleInput"
               spellCheck={false}
               className="titleInput"
               maxLength={280}
               value={editedTitle}
               placeholder={title ? 'Title' : 'New Thing'}
               onKeyDown={handleKeydown}
               onChange={e => {
                  setEditedTitle(e.target.value);
                  dynamicallyResizeElement(e.target, false);
               }}
               onFocus={e => {
                  e.target.spellcheck = true;
                  window.addEventListener('click', clickOutsideDetector);
               }}
            />
         </form>
      );
   } else {
      titleElement = (
         <h3 className="titleBar" id="titleBar">
            {showingScore && <span className="score">{scoreText}</span>}
            {limit == null || limit >= title.length
               ? title
               : `${title.substring(0, limit).trim()}...`}
         </h3>
      );
   }

   return (
      <StyledTitleBar className="titleBarContainer">
         {titleElement}
      </StyledTitleBar>
   );
};
TitleBar.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }),
   limit: PropTypes.number,
   canEdit: PropTypes.bool
};

export default React.memo(TitleBar);
