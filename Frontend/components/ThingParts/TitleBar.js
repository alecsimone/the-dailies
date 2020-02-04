import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { setAlpha } from '../../styles/functions';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';

const SET_THING_TITLE_MUTATION = gql`
   mutation SET_THING_TITLE_MUTATION($title: String!, $thingID: ID!) {
      setThingTitle(title: $title, thingID: $thingID) {
         __typename
         id
         title
      }
   }
`;
export { SET_THING_TITLE_MUTATION };

const StyledTitleBar = styled.div`
   padding: 0 0.5rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
   }
   margin-top: 1rem;
   h3,
   input {
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => setAlpha(props.theme.mainText, 1)};
      padding: 0;
      margin: 0;
      line-height: 1.1;
      width: 100%;
      border: none;
   }
   input {
      background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
   }
`;

const TitleBar = props => {
   const { context, limit, canEdit = true } = props;
   const { title, id: thingID } = useContext(context);
   const [editable, setEditable] = useState(thingID === 'new');
   const [editedTitle, setEditedTitle] = useState(title);

   const [setThingTitle] = useMutation(SET_THING_TITLE_MUTATION, {
      onCompleted: data =>
         checkForNewThingRedirect(thingID, 'setThingTitle', data)
   });

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
      if (!canEdit) {
         return;
      }
      setEditable(true);
      addEventListener('click', killEditability);
      addEventListener('keydown', killEditability);
   };

   const submitTitle = async () => {
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
               placeholder={title || 'New Thing'}
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
TitleBar.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }),
   limit: PropTypes.number,
   canEdit: PropTypes.bool
};

export default TitleBar;
