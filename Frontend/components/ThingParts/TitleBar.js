import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import { setAlpha } from '../../styles/functions';

const SET_THING_TITLE_MUTATION = gql`
   mutation SET_THING_TITLE_MUTATION($title: String!, $thingID: ID!) {
      setThingTitle(title: $title, thingID: $thingID) {
         __typename
         id
         title
      }
   }
`;

const StyledTitleBar = styled.div`
   h3,
   input {
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => setAlpha(props.theme.mainText, 1)};
      padding: 0 1rem;
      margin: 0 0 1rem 0;
      line-height: 1.1;
      width: 100%;
      border: none;
   }
   input {
      background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
   }
`;

const TitleBar = props => {
   const { context, limit } = props;
   const { title, id: thingID } = useContext(context);
   const [editable, setEditable] = useState(false);
   const [editedTitle, setEditedTitle] = useState(title);
   const [setThingTitle, { data }] = useMutation(SET_THING_TITLE_MUTATION);

   const killEditability = e => {
      if (
         e.key === 'Escape' ||
         (e.target.id !== 'titleBar' && e.target.id !== 'titleInput')
      ) {
         setEditable(false);
         removeEventListener('keydown', killEditability);
         removeEventListener('click', killEditability);
      }
   };

   const editabilityHandler = () => {
      setEditable(true);
      addEventListener('click', killEditability);
      addEventListener('keydown', killEditability);
   };

   const submitTitle = () => {
      setEditable(false);
      removeEventListener('keydown', killEditability);
      removeEventListener('click', killEditability);
      setThingTitle({
         variables: {
            title: editedTitle,
            thingID
         },
         optimisticResponse: {
            __typename: 'Mutation',
            setThingTitle: {
               __typename: 'Thing',
               id: thingID,
               title: editedTitle
            }
         }
      });
   };

   let titleElement;
   if (editable) {
      titleElement = (
         <form onSubmit={submitTitle}>
            <input
               id="titleInput"
               value={editedTitle}
               onChange={e => setEditedTitle(e.target.value)}
            />
         </form>
      );
   } else {
      titleElement = (
         <h3 className="titleBar" id="titleBar" onClick={editabilityHandler}>
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

export default TitleBar;
