import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import useMe from '../Account/useMe';
import LockIcon from '../Icons/Lock';
import HamburgerIcon from '../Icons/Hamburger';
import AddCollectionButton from './AddCollectionButton';
import CollectionPrivacyInterface from './CollectionPrivacyInterface';
import {
   DELETE_COLLECTION_MUTATION,
   RENAME_COLLECTION_MUTATION
} from './queriesAndMutations';
import TrashIcon from '../Icons/Trash';
import { StyledCollectionHeader } from './styles';

const CollectionsHeader = ({
   setActiveCollection,
   allCollections,
   activeCollection,
   canEdit
}) => {
   const [collectionTitle, setCollectionTitle] = useState(
      activeCollection.title
   );
   const [showingOptions, setShowingOptions] = useState(false);

   const [showingPrivacyInterface, setShowingPrivacyInterface] = useState(
      false
   );

   const { loggedInUserID } = useMe();

   const { id, title, privacy, viewers, editors, author } = activeCollection;

   useEffect(() => {
      // We need this so that new subscription data can update the title
      setCollectionTitle(title);
   }, [title]);

   const [renameCollection] = useMutation(RENAME_COLLECTION_MUTATION);

   const router = useRouter();
   const [deleteCollection, { loading: deletingCollection }] = useMutation(
      DELETE_COLLECTION_MUTATION,
      {
         variables: {
            collectionID: id
         },
         onCompleted: data => {
            const destination = {
               pathname: '/collections'
            };

            if (data.deleteCollection.lastActiveCollection != null) {
               // If they have a new lastActiveCollection and we don't get routed to it automatically (which we would if they're viewing the current last active collection but not if they're viewing a specifically requested collection), we'll route to it manually
               destination.query = {
                  id: data.deleteCollection.lastActiveCollection.id
               };
               if (
                  router?.query.id != null &&
                  router?.query?.id !==
                     data.deleteCollection.lastActiveCollection.id
               ) {
                  router.push(destination);
               }
            } else {
               // If they don't have a new lastActiveCollection, we'll just take them back to the collections page
               router.push(destination);
            }
         }
      }
   );

   // Next we need to make the collections selector. We'll start by making an option element for each of the member's existing collections.
   const collectionsOptions = allCollections.map(collectionObj => (
      // The only tricky thing here is that for the collection that's currently being displayed, we want to use the collectionTitle state (which is updated with every change to it) instead of the title from its collectionObj (which is only updated after the mutation fires when the input blurs)
      <option value={collectionObj.id} key={collectionObj.id}>
         {collectionObj.id === id ? collectionTitle : collectionObj.title}
      </option>
   ));

   let collectionSelector;
   if (allCollections.length > 1) {
      collectionSelector = (
         <select
            value={id}
            onChange={e => {
               // Because we need to get the data for the new collection from the server, we're not going to bother with an optimistic response here. And because we are setting the lastActiveCollection, we don't need to route to the new colelction specifically, we can just route back to the collections page.
               setActiveCollection({
                  variables: {
                     collectionID: e.target.value
                  }
               });
               router.push({
                  pathname: '/collections',
                  query: {
                     id: e.target.value
                  }
               });
            }}
         >
            {collectionsOptions}
         </select>
      );
   }

   const deleteCollectionButton = (
      <div
         className="buttonWrapper"
         onClick={() => {
            if (deletingCollection) return;
            deleteCollection();
         }}
      >
         <TrashIcon className={deletingCollection ? 'deleting' : 'ready'} />
      </div>
   );

   const titleInput = (
      <input
         type="text"
         className="collectionTitle"
         value={collectionTitle}
         onChange={e => {
            setCollectionTitle(e.target.value);
         }}
         onKeyDown={e => {
            if (e.key === 'Enter') {
               e.target.blur();
            }
         }}
         onBlur={e => {
            if (e.target.value.trim() === '') {
               e.preventDefault();
               alert('Please enter a name for this collection');
               return;
            }
            renameCollection({
               variables: {
                  collectionID: id,
                  newTitle: e.target.value
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  renameCollection: {
                     __typename: 'Collection',
                     id,
                     title: e.target.value
                  }
               }
            });
         }}
      />
   );

   return (
      <StyledCollectionHeader>
         <div className="top">
            {!canEdit && <h3 className="collectionTitle">{collectionTitle}</h3>}
            {canEdit && titleInput}
            <HamburgerIcon
               className={showingOptions ? 'showing' : 'hidden'}
               onClick={() => setShowingOptions(!showingOptions)}
            />
         </div>
         <div
            className={
               showingOptions ? 'headerOptions showing' : 'headerOptions hidden'
            }
         >
            <div className="left">{collectionSelector}</div>
            <div className="headerButtons">
               <AddCollectionButton type="icon" />
               {canEdit && deleteCollectionButton}
               <div
                  className="buttonWrapper"
                  onClick={() => {
                     if (!canEdit) return;
                     if (author.id !== loggedInUserID) return;
                     setShowingPrivacyInterface(!showingPrivacyInterface);
                  }}
               >
                  <LockIcon privacy={privacy} />
               </div>
            </div>
         </div>
         {showingPrivacyInterface && showingOptions && (
            <div className="privacyInterfaceWrapper">
               <CollectionPrivacyInterface
                  collectionID={id}
                  initialPrivacy={privacy}
                  viewers={viewers}
                  editors={editors}
               />
            </div>
         )}
      </StyledCollectionHeader>
   );
};
export default CollectionsHeader;
