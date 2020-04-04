import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { setAlpha, dynamicallyResizeElement } from '../../styles/functions';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';
import { setFullThingToLoading } from './FullThing';

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

const StyledTitleBar = styled.div`
   padding: 0 0.5rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
   }
   h3,
   textarea {
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => setAlpha(props.theme.mainText, 1)};
      padding: 0;
      margin: 2rem 0;
      line-height: 1.4;
      width: 100%;
      border: none;
   }
   textarea {
      height: 3rem;
      resize: none;
      &:focus {
         border: none;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      }
   }
`;

const TitleBar = ({ context, limit, canEdit = true }) => {
   const { __typename: type, title, id } = useContext(context);
   const [editedTitle, setEditedTitleState] = useState(title);
   const editedTitleRef = useRef(editedTitle);

   const setEditedTitle = data => {
      setEditedTitleState(data);
      editedTitleRef.current = data;
   };

   const [setStuffTitle] = useMutation(SET_TITLE_MUTATION, {
      onCompleted: data => {
         checkForNewThingRedirect(id, 'setStuffTitle', data);
         if (type === 'Tag' || type === 'Stack') {
            const href = `/${type.toLowerCase()}?title=${
               data.setStuffTitle.title
            }`;
            const as = href;
            Router.replace(href, as, { shallow: true });
         }
      }
   });

   useEffect(() => {
      const inputs = document.querySelectorAll(`.titleInput`);
      if (inputs.length > 0) {
         inputs.forEach(input => {
            dynamicallyResizeElement(input);
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
      setFullThingToLoading(id);
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
         titleInput.spellcheck = false;
      }
   };

   let titleElement;
   if (canEdit) {
      titleElement = (
         <form onSubmit={submitTitle}>
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
                  dynamicallyResizeElement(e.target);
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

export default TitleBar;
