import { useApolloClient, useMutation } from '@apollo/react-hooks';
import React, { useRef, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { getRandomString } from '../../lib/TextHandling';
import useMe from '../Account/useMe';
import ExplodingLink from '../ExplodingLink';
import X from '../Icons/X';
import RichTextArea from '../RichTextArea';
import RichText from '../RichText';
import {
   ADD_LINK_TO_GROUP_MUTATION,
   DELETE_NOTE_MUTATION,
   EDIT_NOTE_MUTATION,
   REMOVE_LINK_FROM_COLLECTION_GROUP
} from './queriesAndMutations';
import { StyledCard, StyledNote } from './styles';
import EditThis from '../Icons/EditThis';
import CopyCardInterface from './CopyCardInterface';
import { collectionGroupFields } from '../../lib/CardInterfaces';

const StyledButton = styled.button`
   font-size: ${props => props.theme.smallText};
   border: none;
   text-decoration: underline;
   color: ${props => props.theme.majorColor};
   &:hover {
      background: none;
   }
`;

const isTouchEnabled = () =>
   process.browser &&
   ('ontouchstart' in window ||
      navigator.matchTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0);
export { isTouchEnabled };

const CollectionsCard = ({ data, index, collectionID, groupID, canEdit }) => {
   const { loggedInUserID } = useMe();

   const noteRef = useRef(null);
   const [editingNote, setEditingNote] = useState(false);

   const client = useApolloClient();

   const [removeLinkFromGroup] = useMutation(
      REMOVE_LINK_FROM_COLLECTION_GROUP,
      {
         onError: err => alert(err.message)
      }
   );

   const [addLinkToGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [deleteNote] = useMutation(DELETE_NOTE_MUTATION, {
      onError: err => alert(err.message)
   });

   const [editNote] = useMutation(EDIT_NOTE_MUTATION, {
      onError: err => alert(err.message)
   });

   if (data == null) return null;

   if (data.__typename === 'Note') {
      const noteID = data.id;

      const rawUpdateText = () => {
         if (noteRef.current == null) return;

         editNote({
            variables: {
               noteID,
               newContent: noteRef.current.value
            }
         });
      };

      const postText = () => {
         rawUpdateText();
         setEditingNote(false);
      };

      const secondMiddleOrRightClickListener = e => {
         if (editingNote) return; // rich text areas have this functionality already, so we don't need to do anything if we're editing the note
         if (e.button === 1 || e.button === 2) {
            setEditingNote(!editingNote);
         }
      };

      return (
         <Draggable
            draggableId={`${groupID}-note-${noteID}`}
            isDragDisabled={!canEdit || isTouchEnabled()}
            index={index}
            key={`${groupID}-${noteID}`}
         >
            {provided => (
               <StyledCard
                  className="noteWrapper"
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  onMouseDown={e => {
                     if (editingNote) return; // rich text areas have this functionality already, so we don't need to do anything if we're editing the note
                     if (e.button === 1 || e.button === 2) {
                        e.stopPropagation();

                        const card = noteRef.current.closest('.noteWrapper');

                        window.setTimeout(
                           () =>
                              card.addEventListener(
                                 'mousedown',
                                 secondMiddleOrRightClickListener
                              ),
                           1
                        );
                        window.setTimeout(() => {
                           if (card != null) {
                              card.removeEventListener(
                                 'mousedown',
                                 secondMiddleOrRightClickListener
                              );
                           }
                        }, 500);
                     }
                  }}
               >
                  {editingNote && (
                     <RichTextArea
                        text={data.content}
                        postText={postText}
                        setEditable={setEditingNote}
                        rawUpdateText={rawUpdateText}
                        unsavedChangesHandler={rawUpdateText}
                        placeholder="Add note"
                        buttonText="save"
                        inputRef={noteRef}
                     />
                  )}
                  {!editingNote && (
                     <div className="textWrapper" ref={noteRef}>
                        <RichText text={data.content} />
                     </div>
                  )}
                  {canEdit && (
                     <footer>
                        <div className="buttons">
                           {!editingNote && (
                              <EditThis
                                 titleText="Edit Note"
                                 onClick={() => setEditingNote(true)}
                              />
                           )}
                           <X
                              titleText="Delete Note"
                              onClick={() => {
                                 if (
                                    !confirm(
                                       'Are you sure you want to delete that note?'
                                    )
                                 )
                                    return;

                                 const thisGroup = client.readFragment({
                                    id: `CollectionGroup:${groupID}`,
                                    fragment: gql`
                                       fragment GroupForDeleteNote on CollectionGroup {
                                          __typename
                                          id
                                          notes {
                                             __typename
                                             id
                                             content
                                          }
                                       }
                                    `
                                 });

                                 const newGroupObj = JSON.parse(
                                    JSON.stringify(thisGroup)
                                 );

                                 newGroupObj.notes = newGroupObj.notes.filter(
                                    noteObj => noteObj.id !== noteID
                                 );
                                 newGroupObj.order = newGroupObj.order.filter(
                                    id => id !== noteID
                                 );

                                 deleteNote({
                                    variables: {
                                       noteID
                                    },
                                    optimisticResponse: {
                                       __typename: 'Mutation',
                                       deleteNote: newGroupObj
                                    }
                                 });
                              }}
                           />
                        </div>
                     </footer>
                  )}
               </StyledCard>
            )}
         </Draggable>
      );
   }

   const { id, url } = data;

   const UndoButton = ({ url, groupID }) => (
      <div>
         Link removed from group.{' '}
         <StyledButton
            onClick={() => {
               const thisGroup = client.readFragment({
                  id: `CollectionGroup:${groupID}`,
                  fragment: gql`
                  fragment GroupForAddLink on CollectionGroup {
                     ${collectionGroupFields}
                  }`
               });

               const thisGroupWithThisLink = JSON.parse(
                  JSON.stringify(thisGroup)
               );

               const now = new Date();
               thisGroupWithThisLink.includedLinks.push({
                  __typename: 'PersonalLink',
                  id: `temporary-${getRandomString(12)}`,
                  url,
                  owner: {
                     __typename: 'Member',
                     id: loggedInUserID
                  },
                  title: null,
                  description: null,
                  partOfTags: [],
                  createdAt: now.toISOString(),
                  updatedAt: now.toISOString()
               });

               addLinkToGroup({
                  variables: {
                     url,
                     groupID
                  },
                  optimisticResponse: {
                     __typename: 'Mutation',
                     addLinkToCollectionGroup: thisGroupWithThisLink
                  }
               });

               toast('Link added back to group', {
                  position: 'bottom-center',
                  autoClose: 3000
               });
            }}
         >
            Undo
         </StyledButton>
      </div>
   );

   return (
      <Draggable
         draggableId={`${groupID}-${id}`}
         isDragDisabled={!canEdit}
         index={index}
         key={`${groupID}-${id}`}
      >
         {provided => {
            console.log(provided);
            return (
               <StyledCard
                  className={canEdit ? 'cardWrapper' : 'cardWrapper noEdit'}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  key={`${groupID}-${id}`}
               >
                  <ExplodingLink
                     url={url}
                     hideCardShortlink
                     wholeCardLink={false}
                  />
                  {canEdit && (
                     <div className="cardManagementBar">
                        <CopyCardInterface
                           cardData={data}
                           collectionID={collectionID}
                        />
                        <X
                           titleText="Remove Link"
                           onClick={() => {
                              const thisGroup = client.readFragment({
                                 id: `CollectionGroup:${groupID}`,
                                 fragment: gql`
                  fragment GroupForRemoveLink on CollectionGroup {
                     ${collectionGroupFields}
                  }`
                              });

                              const thisGroupWithoutThisLink = JSON.parse(
                                 JSON.stringify(thisGroup)
                              );
                              thisGroupWithoutThisLink.includedLinks = thisGroupWithoutThisLink.includedLinks.filter(
                                 linkObj => linkObj.id !== id
                              );

                              removeLinkFromGroup({
                                 variables: {
                                    linkID: id,
                                    groupID
                                 },
                                 optimisticResponse: {
                                    __typename: 'Mutation',
                                    removeLinkFromCollectionGroup: thisGroupWithoutThisLink
                                 }
                              });

                              toast(
                                 <UndoButton url={url} groupID={groupID} />,
                                 {
                                    position: 'bottom-center',
                                    autoClose: 3000
                                 }
                              );
                           }}
                        />
                     </div>
                  )}
               </StyledCard>
            );
         }}
      </Draggable>
   );
};
export default React.memo(CollectionsCard);
