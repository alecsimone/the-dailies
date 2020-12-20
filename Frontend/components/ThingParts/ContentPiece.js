import gql from 'graphql-tag';
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import ContentSummary from './ContentSummary';
import EditThis from '../Icons/EditThis';
import CommentIcon from '../Icons/CommentIcon';
import TrashIcon from '../Icons/Trash';
import LinkIcon from '../Icons/Link';
import ContentPieceComments from './ContentPieceComments';
import CommentsButton from './CommentsButton';
import { home } from '../../config';
import { ADD_COMMENT_MUTATION } from './Comments';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import ReorderIcon from '../Icons/Reorder';
import ArrowIcon from '../Icons/Arrow';
import X from '../Icons/X';
import { stickifier } from '../../lib/ContentHandling';
import CopyContentInterface from './CopyContentInterface';
import { fullThingFields } from '../../lib/CardInterfaces';

const UNLINK_CONTENTPIECE_MUTATION = gql`
   mutation UNLINK_CONTENTPIECE_MUTATION(
      $contentPieceID: ID!
      $thingID: ID!
   ) {
      unlinkContentPiece(
         contentPieceID: $contentPieceID
         thingID: $thingID
      ) {
         ${fullThingFields}
      }
   }
`;

const ContentPiece = ({
   id,
   thingID,
   rawContentString,
   summary,
   expanded,
   setExpanded,
   comments,
   deleteContentPiece,
   editContentPiece,
   canEdit,
   setReordering,
   reordering,
   highlighted,
   stickifier,
   isCopied,
   context,
   onThing,
   copiedToThings,
   stickifierData
}) => {
   const { me } = useContext(MemberContext);
   const { midScreenBPWidthRaw } = useContext(ThemeContext);
   const fullThingData = useContext(context);

   const [editable, setEditable] = useState(false);
   const [editedContent, setEditedContent] = useState(rawContentString);
   const [editedSummary, setEditedSummary] = useState(summary);
   const [commentText, setCommentText] = useState('');

   const [showingAddToBox, setShowingAddToBox] = useState(false);
   const [showingOtherPlaces, setShowingOtherPlaces] = useState(false);

   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);
   const [copied, setCopied] = useState(false);

   const isSmallScreen =
      process.browser && window.outerWidth <= midScreenBPWidthRaw;

   const [showingComments, setShowingComments] = useState(
      !isSmallScreen && comments.length > 0 && process.browser
   ); // We need that process.browser to prevent the server side rendering from messing up the client side render. Please don't ask me why.

   const postContent = () => {
      editContentPiece(id, editedContent, editedSummary);
      setEditable(false);
   };

   const [addComment] = useMutation(ADD_COMMENT_MUTATION);

   const [unlinkContentPiece] = useMutation(UNLINK_CONTENTPIECE_MUTATION);

   const sendNewComment = async () => {
      const now = new Date();
      const newComment = {
         __typename: 'Comment',
         author: {
            __typename: 'Member',
            avatar: me.avatar,
            displayName: me.displayName,
            id: me.id,
            rep: me.rep
         },
         comment: commentText,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         votes: [],
         updatedAt: now.toISOString()
      };
      comments.push(newComment);

      setCommentText('');
      await addComment({
         variables: {
            comment: commentText,
            id,
            type: 'ContentPiece'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addComment: {
               __typename: 'ContentPiece',
               id,
               comments
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't. So once we get the actual id of the new comment back from the server, we update the cache to add it.
               const query = SINGLE_THING_QUERY;
               const oldData = client.readQuery({
                  query,
                  variables: { id: thingID }
               });
               const thisContentPieceIndex = oldData.thing.content.findIndex(
                  piece => piece.id === data.addComment.id
               );
               oldData.thing.content[thisContentPieceIndex].comments =
                  data.addComment.comments;
               client.writeQuery({
                  query,
                  variables: { id: thingID },
                  data: oldData
               });
            }
         }
      });
   };

   let contentElement;
   if (!editable) {
      contentElement = (
         <div>
            {(summary == null || summary === '' || expanded) && (
               <RichText text={rawContentString} key={id} />
            )}
            {(summary != null || summary !== '' || canEdit) && (
               <div
                  className={`contentSummaryBox${
                     expanded ? ' expanded' : ' collapsed'
                  }`}
               >
                  <ContentSummary
                     key={id}
                     summary={editedSummary}
                     setSummary={setEditedSummary}
                     postText={postContent}
                     setEditable={setEditable}
                     id={id}
                     thingID={thingID}
                     editable={editable}
                  />
               </div>
            )}
         </div>
      );
   } else {
      contentElement = (
         <div>
            <RichTextArea
               text={editedContent}
               setText={setEditedContent}
               postText={postContent}
               setEditable={setEditable}
               placeholder="Add content"
               buttonText="save edit"
               id={id}
               key={id}
            />
            {(summary != null || summary !== '' || canEdit) && (
               <div className="contentSummaryBox">
                  <ContentSummary
                     key={id}
                     summary={editedSummary}
                     setSummary={setEditedSummary}
                     postText={postContent}
                     setEditable={setEditable}
                     id={id}
                     thingID={thingID}
                     editable={editable}
                  />
               </div>
            )}
         </div>
      );
   }

   const commentsElement = (
      <ContentPieceComments
         comments={comments}
         id={id}
         key={id}
         input={
            <RichTextArea
               text={commentText}
               setText={setCommentText}
               postText={sendNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={id}
            />
         }
      />
   );

   let translation = touchEnd - touchStart;
   if (!showingComments && translation > -25) {
      translation = 0;
   }
   if (showingComments && translation < 25) {
      translation = 0;
   }

   let contentArea;
   if (isSmallScreen || !process.browser) {
      // We need the "|| !process.browser" to keep the server side render from messing everything up on the client side render. Please don't ask me why.
      // If we're on a small screen, we need to put the comments and the content together into an element that can slide from side to side, hiding whatever is overflowing its container
      contentArea = (
         <div className="overflowWrapper">
            <div className="contentAndCommentContainer">
               <div
                  className={`contentWrapper${
                     translation === 0 && showingComments
                        ? ' doesNotGiveSize'
                        : ' givesSize'
                  }`}
                  style={{
                     transform: `translateX(calc(${translation}px - ${
                        showingComments ? '100' : '0'
                     }% - ${showingComments ? '4' : '0'}rem))`
                     // We need the 4rem to deal with the margin on contentWrapper
                  }}
               >
                  {contentElement}
               </div>
               <div
                  className={`commentsWrapper${
                     translation === 0 && !showingComments
                        ? ' doesNotGiveSize'
                        : ' givesSize'
                  }`}
                  style={{
                     transform: `translateX(calc(${translation}px - ${
                        showingComments ? '100' : '0'
                     }% - ${showingComments ? '4' : '0'}rem))`
                     // We need the 4rem to deal with the margin on contentWrapper
                  }}
               >
                  {commentsElement}
               </div>
            </div>
         </div>
      );
   } else {
      contentArea = contentElement;
   }

   let otherLocations = false;
   let copiedFrom;
   let alsoFoundIn;
   if (isCopied && onThing != null && onThing.id !== thingID) {
      copiedFrom = (
         <div>
            Copied from{' '}
            <Link
               href={{
                  pathname: '/thing',
                  query: { id: onThing.id, piece: id }
               }}
            >
               <a>{onThing.title}</a>
            </Link>
         </div>
      );
      otherLocations = true;
   }
   if (copiedToThings != null && copiedToThings.length > 0) {
      const otherThingsArray = copiedToThings.filter(
         thing => thing.id != thingID
      );
      if (otherThingsArray.length > 0) {
         const otherPlaces = otherThingsArray.map(thing => (
            <div>
               <Link
                  href={{
                     pathname: '/thing',
                     query: { id: thing.id, piece: id }
                  }}
               >
                  <a>{thing.title}</a>
               </Link>
            </div>
         ));
         alsoFoundIn = (
            <div>
               <div className="basicInfo">
                  Used in{' '}
                  <a onClick={() => setShowingOtherPlaces(!showingOtherPlaces)}>
                     {' '}
                     {otherThingsArray.length} other thing
                     {otherThingsArray.length > 1 ? 's' : ''}
                  </a>
               </div>
               {showingOtherPlaces && <div>{otherPlaces}</div>}
            </div>
         );
         otherLocations = true;
      }
   }
   if (otherLocations) {
      otherLocations = (
         <div className="otherLocations">
            {copiedFrom}
            {alsoFoundIn}
         </div>
      );
   } else {
      otherLocations = null;
   }

   return (
      <div
         className={highlighted ? 'contentBlock highlighted' : 'contentBlock'}
         key={id}
         onTouchStart={e => {
            setTouchStart(e.touches[0].clientX);
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchMove={e => setTouchEnd(e.touches[0].clientX)}
         onTouchEnd={e => {
            if (touchEnd - touchStart < -100) {
               setShowingComments(true);
            }
            if (touchEnd - touchStart > 100) {
               setShowingComments(false);
            }
            setTouchStart(0);
            setTouchEnd(0);
         }}
      >
         <div className="contentArea">
            <div
               className={canEdit ? 'contentPiece editable' : 'contentPiece'}
               key={id}
               onMouseUp={e => {
                  if (!canEdit || reordering || isSmallScreen) return;

                  // If it's a right click, we don't want to switch to editing
                  if (e.button !== 0) return;

                  // If they clicked a link, we don't want to switch to editing
                  if (e.target.closest('a') != null) return;
                  // same for a thingCard
                  if (e.target.closest('.thingCard') != null) return;
                  // or any of the buttons
                  if (e.target.closest('.buttons') != null) return;
                  // or the expand/collapse arrow
                  if (e.target.closest('.arrow') != null) return;

                  const selection = window.getSelection();
                  if (selection.type === 'Caret' && !editable) {
                     setEditable(true);
                  }
               }}
            >
               {contentArea}
               {!editable && summary !== null && summary != '' && (
                  <ArrowIcon
                     pointing={expanded ? 'up' : 'down'}
                     onClick={() => setExpanded(id, !expanded)}
                  />
               )}
            </div>
            <div className="buttons buttonsContainer">
               <div className="commentButton">
                  <CommentsButton
                     count={comments.length < 100 ? comments.length : '+'}
                     onClick={() => {
                        setShowingComments(!showingComments);
                        window.setTimeout(() => stickifier(stickifierData), 1);
                     }}
                  />
               </div>
               {canEdit && (
                  <EditThis
                     className="edit buttons"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => {
                        if (!editable) {
                           setEditable(true);
                           return;
                        }
                        if (rawContentString !== editedContent) {
                           if (!confirm('Discard changes?')) {
                              return;
                           }
                        }
                        setEditable(!editable);
                     }}
                  />
               )}
               {editable && !isCopied && (
                  <TrashIcon
                     className="delete buttons"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => deleteContentPiece(id)}
                  />
               )}
               {editable && isCopied && (
                  <X
                     className="delete buttons unlink"
                     onMouseDown={e => e.stopPropagation()}
                     onClick={() => {
                        if (
                           confirm(
                              'This content piece was copied from a different thing, so this action will only unlink it from this thing, not delete it. It will still exist in its original location, as well as any other places it might have been copied to.'
                           )
                        ) {
                           const unlinkParameterObject = {
                              variables: {
                                 contentPieceID: id,
                                 thingID
                              }
                           };
                           if (fullThingData.__typename === 'Thing') {
                              const oldCopiedContent =
                                 fullThingData.copiedInContent;
                              const newCopiedContent = oldCopiedContent.filter(
                                 piece => piece.id !== id
                              );
                              const newThingData = {
                                 ...fullThingData,
                                 copiedInContent: newCopiedContent
                              };
                              unlinkParameterObject.optimisticResponse = {
                                 __typename: 'Mutation',
                                 unlinkContentPiece: newThingData
                              };
                           }
                           unlinkContentPiece(unlinkParameterObject);
                        }
                     }}
                  />
               )}
               {editable && (
                  <div className="addToContainer">
                     <X
                        color="mainText"
                        className={`addTo buttons${
                           showingAddToBox ? ' open' : ''
                        }`}
                        onClick={() => {
                           setShowingAddToBox(!showingAddToBox);
                           if (!showingAddToBox) {
                              window.setTimeout(() => {
                                 const thisAddToInterface = document.querySelector(
                                    `#addToInterface_${id}`
                                 );
                                 const thisInput = thisAddToInterface.querySelector(
                                    'input.searchBox'
                                 );
                                 thisInput.focus();
                              }, 1);
                           }
                        }}
                     />
                     {showingAddToBox && (
                        <CopyContentInterface
                           id={id}
                           setShowingAddToBox={setShowingAddToBox}
                        />
                     )}
                  </div>
               )}
               {editable && (
                  <ReorderIcon
                     className={`reorder buttons${
                        reordering ? ' reordering' : ''
                     }`}
                     onClick={e => {
                        e.preventDefault();
                        if (
                           reordering ||
                           confirm(
                              'Are you sure you want to reorder the content? Any unsaved changes will be lost.'
                           )
                        ) {
                           setReordering(!reordering);
                        }
                     }}
                  />
               )}
               {copied ? (
                  'copied'
               ) : (
                  <LinkIcon
                     className="directLink buttons"
                     onClick={async () => {
                        await navigator.clipboard.writeText(
                           `${home}/thing?id=${thingID}&piece=${id}`
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                     }}
                  />
               )}
            </div>
            {otherLocations}
         </div>
         {showingComments && !isSmallScreen && commentsElement}
      </div>
   );
};
ContentPiece.propTypes = {
   id: PropTypes.string.isRequired,
   canEdit: PropTypes.bool,
   rawContentString: PropTypes.string.isRequired,
   deleteContentPiece: PropTypes.func.isRequired,
   editContentPiece: PropTypes.func.isRequired
};

export default React.memo(ContentPiece, (prev, next) => {
   if (prev.rawContentString !== next.rawContentString) {
      return false;
   }
   if (prev.expanded !== next.expanded) {
      return false;
   }
   if (prev.summary !== next.summary) {
      return false;
   }
   if (prev.comments.length !== next.comments.length) {
      return false;
   }
   return true;
});
