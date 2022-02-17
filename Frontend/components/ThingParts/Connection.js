import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState } from 'react';
import styled from 'styled-components';
import { setAlpha, setLightness, setSaturation } from '../../styles/functions';
import X from '../Icons/X';
import CardGenerator from '../ThingCards/CardGenerator';
import { ADD_CONNECTION_MUTATION } from './ConnectionsInterface';

const DELETE_CONNECTION_MUTATION = gql`
   mutation DELETE_CONNECTION_MUTATION($connectionID: ID!) {
      deleteConnection(connectionID: $connectionID) {
         __typename
         id
         subjectConnections {
            __typename
            id
         }
         objectConnections {
            __typename
            id
         }
      }
   }
`;

const STRENGTHEN_CONNECTION_MUTATION = gql`
   mutation STRENGTHEN_CONNECTION_MUTATION($connectionID: ID!) {
      strengthenConnection(connectionID: $connectionID) {
         __typename
         id
         strength
      }
   }
`;

const StyledConnection = styled.div`
   background: ${props => setAlpha(props.theme.midBlack, 0.75)};
   min-width: 42rem;
   max-width: 60rem;
   padding: 1.6rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
   border-radius: 0.75rem;
   display: flex;
   justify-content: stretch;
   align-items: center;
   .flexWrapper {
      width: 100%;
   }
   .relationship {
      text-align: center;
      font-weight: 300;
      font-size: ${props => props.theme.miniText};
      position: relative;
      padding-right: calc(1em + 1rem);
      padding-bottom: 0.5rem;
      padding-top: 0.5rem;
      line-height: 1.6;
      color: ${props => setAlpha(props.theme.mainText, 0.8)};
      /* background: ${props => props.theme.lightBlack}; */
      background: ${props =>
         setLightness(setSaturation(props.theme.majorColor, 66), 8)};
      border: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
      &.object {
         border-top: none;
      }
      &.subject {
         border-bottom: none;
      }
      svg.x {
         transform: rotate(0);
         position: absolute;
         width: 1em;
         top: calc(
            1em * 0.3 + 0.5rem
         ); /* this is to make up for the line-height padding on the relationship line */
         right: 1rem;
         margin: 0;
         &.loading {
            ${props => props.theme.spin};
         }
      }
   }
   article.flexibleThingCard {
      margin: 0;
      margin-top: 0;
      max-width: 100%;
   }
`;

const Connection = ({
   connectionID,
   subjectID,
   objectID,
   parentThingID,
   relationship
}) => {
   const [deleteConnection, { loading: deleteConnectionLoading }] = useMutation(
      DELETE_CONNECTION_MUTATION,
      {
         variables: {
            connectionID
         },
         onError: err => alert(err.message)
      }
   );

   const [strengthenConnection] = useMutation(STRENGTHEN_CONNECTION_MUTATION, {
      variables: {
         connectionID
      },
      onError: err => alert(err.message),
      onCompleted: data => console.log(data)
   });

   const [addConnection] = useMutation(ADD_CONNECTION_MUTATION, {
      variables: {
         subjectID,
         objectID,
         relationship,
         strength: 1
      },
      onError: err => alert(err.message)
   });

   const [alreadyLoggedConnections, setAlreadyLoggedConnections] = useState([]);

   const logConnectionClick = (e, id) => {
      // We only want to run this once per connection per pageload
      if (alreadyLoggedConnections.includes(id)) return;
      setAlreadyLoggedConnections(prev => [...prev, id]);

      if (connectionID.startsWith('new')) {
         addConnection();
         return;
      }

      strengthenConnection();
   };

   let modifiedRelationship = `${relationship}`;
   if (subjectID !== parentThingID) {
      if (relationship === 'links to') {
         modifiedRelationship = 'linked to';
      }
   }

   return (
      <StyledConnection>
         <div className="flexWrapper">
            {subjectID !== parentThingID && (
               <div
                  className="subject"
                  onClick={e => logConnectionClick(e, subjectID)}
               >
                  <CardGenerator id={subjectID} cardType="small" />
               </div>
            )}
            <div
               className={`relationship ${
                  subjectID !== parentThingID ? 'object' : 'subject'
               }`}
            >
               {modifiedRelationship}
               <X
                  className={`deleteConnection${
                     deleteConnectionLoading ? ' loading' : ''
                  }`}
                  onClick={() => {
                     if (deleteConnectionLoading) return;
                     if (relationship === 'links to') {
                        if (
                           !confirm(
                              'Are you sure you would like to block that link connection? This cannot be undone, but if you change your mind you can always manually create a new connection to the other thing, although it will have to have a different relationship.'
                           )
                        ) {
                           return;
                        }
                     }
                     deleteConnection();
                  }}
               />
            </div>
            {objectID !== parentThingID && (
               <div
                  className="object"
                  onClick={e => logConnectionClick(e, objectID)}
               >
                  <CardGenerator id={objectID} cardType="small" />
               </div>
            )}
         </div>
      </StyledConnection>
   );
};

export default Connection;
