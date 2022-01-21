import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState } from 'react';
import styled from 'styled-components';
import { setAlpha } from '../../styles/functions';
import X from '../Icons/X';
import CardGenerator from '../ThingCards/CardGenerator';

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

const StyledConnection = styled.div`
   background: ${props => setAlpha(props.theme.midBlack, 0.6)};
   min-width: 42rem;
   max-width: 60rem;
   padding: 1rem 2rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
   border-radius: 0.75rem;
   box-shadow: 0 4px 4px ${props => setAlpha(props.theme.deepBlack, 0.2)};
   .relationship {
      text-align: center;
      font-weight: 300;
      font-size: ${props => props.theme.miniText};
      position: relative;
      padding-right: calc(1em + 1rem);
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      line-height: 1.6;
      color: ${props => setAlpha(props.theme.mainText, 0.8)};
      svg.x {
         transform: rotate(0);
         position: absolute;
         width: 1em;
         top: calc(
            1em * 0.3 + 0.5rem
         ); /* this is to make up for the line-height padding on the relationship line */
         right: 0;
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

   const [alreadyLoggedConnections, setAlreadyLoggedConnections] = useState([]);

   const logConnectionClick = (e, id) => {
      // We only want to run this once per connection per pageload
      if (alreadyLoggedConnections.includes(id)) return;
      setAlreadyLoggedConnections(prev => [...prev, id]);

      if (connectionID === 'new') {
         console.log('we need to add a new connection with strength 1');
         return;
      }

      console.log(`we need to strengthen connection ${connectionID}`);
   };

   return (
      <StyledConnection>
         {subjectID !== parentThingID && (
            <div
               className="subject"
               onClick={e => logConnectionClick(e, subjectID)}
            >
               <CardGenerator id={subjectID} cardType="small" />
            </div>
         )}
         <div className="relationship">
            {relationship}
            <X
               className={`deleteConnection${
                  deleteConnectionLoading ? ' loading' : ''
               }`}
               onClick={() => {
                  if (deleteConnectionLoading) return;
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
      </StyledConnection>
   );
};

export default Connection;
