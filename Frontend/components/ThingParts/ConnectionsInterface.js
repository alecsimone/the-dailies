import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { homeNoHTTP } from '../../config';
import { fullThingFields } from '../../lib/CardInterfaces';
import { getThingIdFromLink, urlFinder } from '../../lib/UrlHandling';
import useQueryAndStoreIt from '../../stuffStore/useQueryAndStoreIt';
import useMe from '../Account/useMe';
import { bracketCheck } from '../ExplodingLink';
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

const GET_RELATIONS_QUERY = gql`
   query GET_RELATIONS_QUERY($thingID: ID!, $totalCount: Int) {
      getRelationsForThing(thingID: $thingID, totalCount: $totalCount) {
         __typename
         id
         subject {
            ${fullThingFields}
         }
         object {
            ${fullThingFields}
         }
         relationship
         strength
         createdAt
      }
   }
`;

const StyledConnectionsInterface = styled.div`
   padding-bottom: 2rem;
   margin: 2rem 0;
   .existingConnections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(42rem, 1fr));
      gap: 2rem;
      /* align-items: center; */
      /* justify-content: space-around; */
      > * {
         /* margin: 1rem; */
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

const getLinksFromContent = contentArray => {
   // If there's no content, we don't need to do anything
   if (contentArray == null || contentArray.length === 0) return [];

   // If we're not in a browser (ie, we're in a server side render), let's get out, because the matchAll won't work
   if (!process.browser) return [];

   // First we're going to make a giant string out of all the content in all the content pieces
   let giantContentString = '';
   contentArray.forEach(piece => (giantContentString += piece.content));

   const linkedThingIDs = []; // Our array for holding the ids of any linked things we find

   // Then we're going to check it for links to a thing
   const linkMatches = giantContentString.matchAll(urlFinder);
   for (const linkMatch of linkMatches) {
      const link = linkMatch[0];
      const lowerCaseURL = link.toLowerCase();
      if (link != null) {
         const bracketMatchCheck = link.match(bracketCheck);
         if (bracketMatchCheck != null) {
            const bracketMatch = link.matchAll(bracketCheck);
            for (const match of bracketMatch) {
               const { href } = match.groups;

               // First, support for a legacy link system we did, where you could use a few codes to insert a link to a thing
               const cleanText = match.groups.text.trim().toLowerCase();

               if (
                  cleanText.toLowerCase().startsWith('c:') ||
                  cleanText.toLowerCase().startsWith('p:') ||
                  cleanText.toLowerCase().startsWith('t:')
               ) {
                  linkedThingIDs.push(href);
               }

               const linkCheck = href.match(urlFinder);
               if (linkCheck == null) {
                  // if the link is not a link, that probably means it's just the id of a thing
                  linkedThingIDs.push(href);
               }

               if (href.includes(homeNoHTTP)) {
                  linkedThingIDs.push(getThingIdFromLink(href));
               }
            }
         }

         if (
            lowerCaseURL.includes(`${homeNoHTTP}/thing?id=`) &&
            bracketMatchCheck == null
         ) {
            linkedThingIDs.push(getThingIdFromLink(link));
         }
      }
   }
   return linkedThingIDs;
};

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
   connectionsData.fullContent = useSelector(state => {
      const { content } = state.stuff[`Thing:${thingID}`];
      const { copiedInContent } = state.stuff[`Thing:${thingID}`];

      const fullContent = content.concat(copiedInContent);
      return fullContent;
   });
   connectionsData.copiedInContent = useSelector(
      state => state.stuff[`Thing:${thingID}`].copiedInContent
   );
   return connectionsData;
};

const ConnectionsInterface = ({ thingID }) => {
   const {
      thingTitle,
      subjectConnections,
      objectConnections,
      fullContent
   } = useConnectionsData(thingID);

   // const allThingData = useSelector(state => state.stuff[`Thing:${thingID}`]);

   const loggedInUserID = useMe();

   const { loading, error, data } = useQueryAndStoreIt(GET_RELATIONS_QUERY, {
      variables: { thingID }
      // onCompleted: data => console.log(data)
   });
   let relations = [];
   if (data != null) {
      relations = data.getRelationsForThing;
   }

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

   // const [showingForm, setShowingForm] = useState(
   //    subjectConnections.length === 0 && objectConnections.length === 0
   // );
   const [showingForm, setShowingForm] = useState(false);

   const [addConnection, { loading: addConnectionLoading }] = useMutation(
      ADD_CONNECTION_MUTATION,
      {
         onError: err => alert(err.message)
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

   const contentLinkIDs = getLinksFromContent(fullContent);

   const unfilteredLinkConnections = contentLinkIDs.map(id => {
      const [isAlreadySubject] = subjectConnections.filter(
         connection => connection.id === id
      );
      const [isAlreadyObject] = objectConnections.filter(
         connection => connection.id === id
      );

      if (isAlreadySubject) return isAlreadySubject;
      if (isAlreadyObject) return isAlreadyObject;

      return {
         id: 'new',
         subject: {
            id: thingID
         },
         object: {
            id
         },
         relationship: 'links to',
         strength: 0
      };
   });

   let allConnections = subjectConnections.concat(objectConnections);

   const linkConnections = unfilteredLinkConnections.filter(
      (relation, index) => {
         // If the relation is to the thing we're currently viewing, we don't want it
         if (relation.object.id === thingID) return false;

         // If the relation is to a thing that we already have a manual connection for, we don't want it
         allConnections.forEach(existingConnection => {
            if (existingConnection.subject.id === relation.object.id)
               return false;
            if (existingConnection.object.id === relation.object.id)
               return false;
         });

         // If this is the second time this relation has appeared in our array, we don't want it
         const dupeIndexCheck = unfilteredLinkConnections.findIndex(
            item => item.object.id === relation.object.id
         );
         if (dupeIndexCheck !== index) return false;

         return true;
      }
   );

   allConnections = allConnections.concat(linkConnections, relations);

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
