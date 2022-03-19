import { useMutation } from '@apollo/react-hooks';
import debounce from 'lodash.debounce';
import { useRef, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { getRandomString } from '../../lib/TextHandling';
import { dynamicallyResizeElement, successFlash } from '../../styles/functions';
import useMe from '../Account/useMe';
import ExplodingLink from '../ExplodingLink';
import X from '../Icons/X';
import RichTextArea from '../RichTextArea';
import RichText from '../RichText';
import {
   ADD_LINK_TO_GROUP_MUTATION,
   COPY_THING_TO_GROUP_MUTATION,
   DELETE_NOTE_MUTATION,
   EDIT_NOTE_MUTATION,
   HANDLE_CARD_EXPANSION_MUTATION,
   REMOVE_LINK_FROM_COLLECTION_GROUP
} from './queriesAndMutations';
import { StyledCard, StyledNote } from './styles';
import EditThis from '../Icons/EditThis';

const StyledButton = styled.button`
   font-size: ${props => props.theme.smallText};
   border: none;
   text-decoration: underline;
   color: ${props => props.theme.majorColor};
   &:hover {
      background: none;
   }
`;

const debouncedNoteChangesHandler = debounce((handler, e) => handler(e), 2000, {
   leading: false,
   trailing: true
});

const CollectionsCard = ({
   data,
   index,
   userGroups,
   hiddenGroups,
   groupType,
   collectionID,
   groupID,
   hideThingHandler,
   isExpanded,
   canEdit
}) => {
   const {
      loggedInUserID,
      memberFields: { role }
   } = useMe('CollectionsCard', 'role');

   const [showingCopyTargets, setShowingCopyTargets] = useState(false);

   const noteRef = useRef(null);
   const [editingNote, setEditingNote] = useState(false);

   const [removeLinkFromGroup] = useMutation(
      REMOVE_LINK_FROM_COLLECTION_GROUP,
      {
         onError: err => alert(err.message)
      }
   );

   const [addLinkToGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [copyThingToCollectionGroup] = useMutation(
      COPY_THING_TO_GROUP_MUTATION
   );

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
            isDragDisabled={!canEdit}
            index={index}
            key={`${groupID}-${noteID}`}
         >
            {provided => (
               <StyledNote
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

                                 const [thisGroup] = userGroups.filter(
                                    groupObj => groupObj.id === groupID
                                 );

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
               </StyledNote>
            )}
         </Draggable>
      );
   }

   const { id, url } = data;

   // We need to make the options for the copy to group interface. You can't copy to a group that the thing is already in, so first we need to filter those groups out of the master groups list
   let filteredGroups = [];
   let groupsContainingThingCount = 0;
   if (groupType === 'manual' && userGroups != null && userGroups.length > 0) {
      filteredGroups = userGroups.filter(groupObj => {
         // First we remove any groups that are hidden
         let groupIsHidden = false;
         hiddenGroups.forEach(hiddenGroupObj => {
            if (hiddenGroupObj.id === groupObj.id) {
               groupIsHidden = true;
            }
         });
         if (groupIsHidden) return false;

         // Then we remove any groups that have this thing in them
         let groupHasThisThingAlready = false;
         groupObj.things.forEach(thing => {
            if (thing.id === id) {
               groupHasThisThingAlready = true;
               groupsContainingThingCount += 1;
            }
         });
         if (groupHasThisThingAlready) return false;

         return true;
      });
   }

   // Then we need to make an option element for each remaining group
   const copyToGroupOptions = filteredGroups.map(groupObj => (
      <option value={groupObj.id} key={groupObj.id}>
         {groupObj.title}
      </option>
   ));

   const copyInterface = (
      <div className="copyInterface">
         <button onClick={() => setShowingCopyTargets(!showingCopyTargets)}>
            {showingCopyTargets ? 'close' : 'copy'}
         </button>
         {showingCopyTargets && (
            <select
               value={null}
               onChange={e => {
                  if (e.target.value != null && e.target.value !== '') {
                     const newUserGroups = [...userGroups];
                     const targetGroupIndex = newUserGroups.findIndex(
                        targetGroupObj => targetGroupObj.id === e.target.value
                     );
                     newUserGroups[targetGroupIndex].things.push(data);

                     copyThingToCollectionGroup({
                        variables: {
                           collectionID,
                           thingID: id,
                           targetGroupID: e.target.value
                        },
                        optimisticResponse: {
                           __typename: 'Mutation',
                           copyThingToCollectionGroup: {
                              __typename: 'Collection',
                              id: collectionID,
                              userGroups: newUserGroups
                           }
                        }
                     });
                     setShowingCopyTargets(false);
                  }
               }}
            >
               <option value={null} />
               {copyToGroupOptions}
            </select>
         )}
      </div>
   );

   const UndoButton = ({ url, groupID }) => {
      console.log(url, groupID);
      return (
         <div>
            Link removed from group.{' '}
            <StyledButton
               onClick={() => {
                  const [thisGroup] = userGroups.filter(
                     groupObj => groupObj.id === groupID
                  );

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
   };

   return (
      <Draggable
         draggableId={`${groupID}-${id}`}
         isDragDisabled={!canEdit}
         index={index}
         key={`${groupID}-${id}`}
      >
         {provided => (
            <StyledCard
               className={canEdit ? 'cardWrapper' : 'cardWrapper noEdit'}
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               key={`${groupID}-${id}`}
            >
               <ExplodingLink url={url} hideCardShortlink />
               {canEdit && (
                  <div
                     className={
                        filteredGroups.length > 0
                           ? 'cardManagementBar'
                           : 'cardManagementBar noCopy'
                     }
                  >
                     {filteredGroups.length > 0 && copyInterface}
                     <X
                        titleText="Remove Link"
                        onClick={() => {
                           const [thisGroup] = userGroups.filter(
                              groupObj => groupObj.id === groupID
                           );

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

                           toast(<UndoButton url={url} groupID={groupID} />, {
                              position: 'bottom-center',
                              autoClose: 3000
                           });
                        }}
                     />
                  </div>
               )}
            </StyledCard>
         )}
      </Draggable>
   );
};
export default CollectionsCard;
