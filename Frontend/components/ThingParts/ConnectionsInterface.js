import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { fullThingFields } from '../../lib/CardInterfaces';
import useMe from '../Account/useMe';
import X from '../Icons/X';
import Connection from './Connection';
import ThingSearchInput from './ThingSearchInput';

const ADD_CONNECTION_MUTATION = gql`
   mutation ADD_CONNECTION_MUTATION(
      $subjectID: ID!
      $objectID: ID!
      $relationship: String!
   ) {
      addConnection(
         subjectID: $subjectID
         objectID: $objectID
         relationship: $relationship
      ) {
         __typename
         id
         subjectConnections {
            id
            subject {
               id
            }
            object {
               id
            }
            relationship
            strength
            createdAt
         }
         objectConnections {
            id
            subject {
               id
            }
            object {
               id
            }
            relationship
            strength
            createdAt
         }
      }
   }
`;

const StyledConnectionsInterface = styled.div`
   padding-bottom: 2rem;
   .existingConnections {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-wrap: wrap;
      > * {
         flex-grow: 1;
         margin: 1rem;
         svg.x {
            opacity: 0.4;
            &:hover {
               opacity: 0.6;
            }
         }
         &:only-child {
            margin: 0 auto;
         }
      }
   }
   form.addConnection {
      padding: 2rem 0;
      .formBody {
         display: flex;
         justify-content: space-around;
         align-items: flex-start;
         flex-wrap: wrap;
         ${props => props.theme.mobileBreakpoint} {
            margin-top: 2rem;
         }
         > * {
            margin: 2rem 0;
            width: 100%;
            ${props => props.theme.mobileBreakpoint} {
               margin: 0 1rem;
               max-width: 40rem;
            }
            flex-grow: 1;
            text-align: center;
         }
         .thingInput {
            position: relative;
            .thingSearchInput {
               position: absolute;
               width: 100%;
               z-index: 2;
               .topline {
                  margin-bottom: 1rem;
               }
               .postSearchResults {
                  margin-top: 5rem;
                  article {
                     max-width: 100%;
                  }
               }
            }
         }
         input {
            text-align: center;
            font-size: ${props => props.theme.smallText};
            &[type='radio'] {
               -webkit-appearance: none;
               -moz-appearance: none;
               appearance: none;
               padding: 0;
               width: ${props => props.theme.miniText};
               height: ${props => props.theme.miniText};
               border-radius: 100%;
               background: ${props => props.theme.lowContrastGrey};
               border: 2px solid ${props => props.theme.mainText};
               transition: all 0s;
               &:checked {
                  background: ${props => props.theme.majorColor};
               }
            }
         }
         .radioBlock {
            margin-top: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 3;
         }
         label {
            cursor: pointer;
         }
      }
      .formFooter button {
         display: block;
         margin: auto;
         margin-top: 2rem;
         padding: 0.6rem;
         font-size: ${props => props.theme.smallText};
         font-weight: 500;
         background: ${props => props.theme.majorColor};
      }
      &.loading {
         input,
         button {
            background: ${props => props.theme.lowContrastGrey};
         }
      }
   }
   svg.x {
      opacity: 0.7;
      cursor: pointer;
      &:hover {
         opacity: 0.9;
      }
      width: ${props => props.theme.smallText};
      transform: rotate(45deg);
      display: block;
      margin: 2rem auto;
      &.collapse {
         transform: rotate(0);
      }
   }
`;

const useConnectionsData = thingID => {
   const connectionsData = {};
   connectionsData.thingTitle = useSelector(
      state => state.stuff[`Thing:${thingID}`].title
   );
   connectionsData.subjectConnections = useSelector(
      state => state.stuff[`Thing:${thingID}`].subjectConnections
   );
   connectionsData.objectConnections = useSelector(
      state => state.stuff[`Thing:${thingID}`].objectConnections
   );
   return connectionsData;
};

const ConnectionsInterface = ({ thingID }) => {
   const {
      thingTitle,
      subjectConnections,
      objectConnections
   } = useConnectionsData(thingID);

   const allThingData = useSelector(state => state.stuff[`Thing:${thingID}`]);

   const loggedInUserID = useMe();

   const defaultState = {
      subject: thingTitle,
      subjectID: thingID,
      relationship: '',
      object: '',
      objectID: '',
      thisThing: 'subject'
   };

   const [formData, setFormData] = useState(defaultState);

   const otherThingDataRef = useRef({});

   const [showingForm, setShowingForm] = useState(
      subjectConnections.length === 0 && objectConnections.length === 0
   );

   const [addConnection, { loading: addConnectionLoading }] = useMutation(
      ADD_CONNECTION_MUTATION,
      {
         onError: err => alert(err.message),
         onCompleted: data => console.log(data)
      }
   );

   const handleFormChange = e => {
      const input = e.target;
      if (input == null) return;
      if (input.type === 'text') {
         if (formData.thisThing === input.name) {
            alert(
               `The ${
                  input.name
               } is set to the current thing (${thingTitle}) and can't be edited. If you want to make a differen thing the ${
                  input.name
               }, you must set the ${
                  input.name === 'subject' ? 'object' : 'subject'
               } field to be equal to this thing.`
            );
            return;
         }
         setFormData(prev => ({
            ...prev,
            [input.name]: input.value,
            [`${input.name}ID`]: ''
         }));
      } else if (input.type === 'radio') {
         const otherField = input.value === 'subject' ? 'object' : 'subject';
         const otherIDField =
            input.value === 'subject' ? 'objectID' : 'subjectID';
         const thisIDField =
            input.value === 'subject' ? 'subjectID' : 'objectID';
         setFormData(prev => ({
            ...prev,
            [otherField]: prev[input.value],
            [otherIDField]: prev[thisIDField],
            [input.value]: thingTitle,
            [thisIDField]: thingID,
            thisThing: input.value
         }));
      }
   };

   const submitForm = e => {
      e.preventDefault();
      if (formData.subjectID == null || formData.subjectID.trim() === '') {
         alert(
            "You must choose a thing from the search results dropdown on the subject input. You can't just type in a title, as titles are not unique and we won't know which thing you meant."
         );
         return;
      }
      if (formData.objectID == null || formData.objectID.trim() === '') {
         alert(
            "You must choose a thing from the search results dropdown on the object input. You can't just type in a title, as titles are not unique and we won't know which thing you meant."
         );
         return;
      }
      if (
         formData.relationship == null ||
         formData.relationship.trim() === ''
      ) {
         alert(
            'The relationship field cannot be blank. Please describe the relationship between these two things.'
         );
         return;
      }
      if (formData.subjectID === formData.objectID) {
         alert("You can't connect a thing to itself");
      }
      const variables = {
         subjectID: formData.subjectID,
         objectID: formData.objectID,
         relationship: formData.relationship
      };

      const connectionData = {
         __typename: 'Connection',
         id: 'TemporaryID',
         creator: {
            __typename: 'Member',
            id: loggedInUserID
         },
         object: {
            __typename: 'Thing',
            id: formData.objectID
         },
         subject: {
            __typename: 'Thing',
            id: formData.subjectID
         },
         relationship: formData.relationship,
         strength: 0
      };

      addConnection({
         variables
      });
      setFormData(defaultState);
   };

   const chooseResult = (thingData, name) => {
      if (thingData == null) return;
      if (
         thingData.title == null ||
         thingData.title.trim() === '' ||
         thingData.id == null ||
         thingData.id.trim() === ''
      ) {
         alert('Invalid selection. Please refresh the page and try again.');
         return;
      }
      setFormData(prev => ({
         ...prev,
         [name]: thingData.title,
         [`${name}ID`]: thingData.id
      }));
      otherThingDataRef.current = thingData;
   };

   const allConnections = subjectConnections.concat(objectConnections);
   const connectionElements = allConnections.map(connection => (
      <Connection
         connectionID={connection.id}
         subjectID={connection.subject.id}
         objectID={connection.object.id}
         relationship={connection.relationship}
         parentThingID={thingID}
      />
   ));

   return (
      <StyledConnectionsInterface>
         {allConnections.length > 0 && (
            <div className="existingConnections">{connectionElements}</div>
         )}
         {showingForm && (
            <form
               className={`addConnection${
                  addConnectionLoading ? ' loading' : ''
               }`}
               onSubmit={submitForm}
            >
               <fieldset disabled={addConnectionLoading}>
                  <div className="formBody">
                     <div className="thingInput">
                        <ThingSearchInput
                           parentThingID={thingID}
                           placeholder="subject"
                           value={formData.subject}
                           skipSearchTerm={thingTitle}
                           setValue={handleFormChange}
                           name="subject"
                           onChosenResult={thingData => {
                              chooseResult(thingData, 'subject');
                           }}
                        />
                        <div className="radioBlock">
                           <input
                              type="radio"
                              name="thisThing"
                              value="subject"
                              id="subject"
                              checked={formData.thisThing === 'subject'}
                              onChange={handleFormChange}
                           />
                           <label htmlFor="subject">This Thing</label>
                        </div>
                     </div>
                     <input
                        type="text"
                        placeholder="relationship"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleFormChange}
                     />
                     <div className="thingInput">
                        <ThingSearchInput
                           parentThingID={thingID}
                           placeholder="object"
                           value={formData.object}
                           skipSearchTerm={thingTitle}
                           setValue={handleFormChange}
                           name="object"
                           onChosenResult={thingData => {
                              chooseResult(thingData, 'object');
                           }}
                        />
                        <div className="radioBlock">
                           <input
                              type="radio"
                              name="thisThing"
                              value="object"
                              id="object"
                              checked={formData.thisThing === 'object'}
                              onChange={handleFormChange}
                           />
                           <label htmlFor="object">This Thing</label>
                        </div>
                     </div>
                  </div>
                  <div className="formFooter">
                     <button type="submit">add</button>
                  </div>
               </fieldset>
            </form>
         )}
         <X
            onClick={() => setShowingForm(!showingForm)}
            className={`showConnectionsForm ${
               showingForm ? 'collapse' : 'expand'
            }`}
            color="mainText"
         />
      </StyledConnectionsInterface>
   );
};

export default ConnectionsInterface;
