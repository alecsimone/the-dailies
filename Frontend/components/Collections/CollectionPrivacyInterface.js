import styled from 'styled-components';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState } from 'react';
import useMe from '../Account/useMe';
import { GET_PRIVACY_OPTIONS_QUERY } from '../ThingParts/PrivacyDropdown';
import MetaOption from '../ThingParts/MetaOption';

const SET_COLLECTION_PRIVACY = gql`
   mutation SET_COLLECTION_PRIVACY(
      $collectionID: ID!
      $privacy: PrivacySetting!
   ) {
      setCollectionPrivacy(collectionID: $collectionID, privacy: $privacy) {
         __typename
         id
         privacy
      }
   }
`;

const CollectionPrivacyInterface = ({
   collectionID,
   initialPrivacy,
   viewers,
   editors
}) => {
   const { loggedInUserID } = useMe();

   const [viewersInput, setViewersInput] = useState('');
   const [editorsInput, setEditorsInput] = useState('');

   let privacyOptions;
   const {
      loading: privacyOptionsLoading,
      error: privacyOptionsError,
      data: privacyOptionsData
   } = useQuery(GET_PRIVACY_OPTIONS_QUERY);

   const [setCollectionPrivacy] = useMutation(SET_COLLECTION_PRIVACY, {
      onError: err => alert(err.message)
   });

   if (privacyOptionsLoading) {
      privacyOptions = <MetaOption name={initialPrivacy} />;
   } else {
      privacyOptions = privacyOptionsData.__type.enumValues.map(option => (
         <MetaOption name={option.name} key={option.name} />
      ));
   }

   const selectPrivacy = e => {
      const {
         target: { value }
      } = e;

      setCollectionPrivacy({
         variables: {
            collectionID,
            privacy: value
         },
         optimisticResponse: {
            __typename: 'Mutation',
            setCollectionPrivacy: {
               __typename: 'Collection',
               id: collectionID,
               privacy: value
            }
         }
      });
   };

   return (
      <div className="privacyInterface">
         <div className="privacySelectorGroup">
            <span>Privacy</span>
            <select value={initialPrivacy} onChange={selectPrivacy}>
               {privacyOptions}
            </select>
         </div>
         {initialPrivacy !== 'Public' && (
            <input
               type="text"
               placeholder="Add Viewers"
               value={viewersInput}
               onChange={e => setViewersInput(e.target.value)}
            />
         )}
         <input
            type="text"
            placeholder="Add Editors"
            value={editorsInput}
            onChange={e => setEditorsInput(e.target.value)}
         />
      </div>
   );
};

export default CollectionPrivacyInterface;
