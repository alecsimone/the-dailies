import gql from 'graphql-tag';
import React, { useState, useContext, useRef } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import RichText from '../RichText';
import RichTextArea from '../RichTextArea';
import EditThis from '../Icons/EditThis';
import CommentIcon from '../Icons/CommentIcon';
import TrashIcon from '../Icons/Trash';
import LinkIcon from '../Icons/Link';
import ContentPieceComments from './ContentPieceComments';
import CommentsButton from './CommentsButton';
import { home, minimumTranslationDistance } from '../../config';
import { ADD_COMMENT_MUTATION } from './Comments';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import ReorderIcon from '../Icons/Reorder';
import X from '../Icons/X';
import {
   UNLINK_CONTENTPIECE_MUTATION,
   useScrollFixer,
   changeContentButKeepInFrame,
   editContentButKeepInFrame
} from '../../lib/ContentHandling';
import { getOneRem } from '../../styles/functions';
import CopyContentInterface from './CopyContentInterface';
import VoteBar, { VOTE_MUTATION } from './VoteBar';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';

const ContentPiece = ({
   id,
   thingID,
   rawContentString,
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
   votes,
   stickifierData,
   zIndex
}) => {
   const { me } = useContext(MemberContext);
   const { midScreenBPWidthRaw } = useContext(ThemeContext);
   const fullThingData = useContext(context);

   const [editable, setEditable] = useState(false);
   const editContentInputRef = useRef(null); // This ref will be passed down to the RichTextArea that allows us to edit the content piece, and we'll use it to get the value for our editContentPiece mutation

   const commentInputRef = useRef(null); // This ref will be passed down to the RichTextArea that allows us to comment on the content piece, and we'll use it to get the value for our editContentPiece mutation

   const [showingAddToBox, setShowingAddToBox] = useState(false);
   const [showingOtherPlaces, setShowingOtherPlaces] = useState(false);

   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);
   const [copied, setCopied] = useState(false);

   const [showingComments, setShowingComments] = useState(false);
   const [hasShownComments, setHasShownComments] = useState(false);
   const contentWrapperRef = useRef(null);
   const setEditableHandler = value => {
      editContentButKeepInFrame(setEditable, value, contentWrapperRef.current);
      window.setTimeout(() => stickifier(stickifierData), 1);
   };

   const { setHeartPosition, setFullHeart, setContent } = useContext(
      ModalContext
   );

   const contentContainerRef = useRef(null);

   const postContent = () => {
      const inputRef = editContentInputRef.current;
      const editedContent = inputRef.value;

      if (editedContent.trim() === '') {
         alert(
            "You can't make a content piece blank. Please delete it if you want to get rid of it."
         );
         return;
      }

      editContentPiece(id, editedContent);
      setEditableHandler(false);
   };

   const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      onError: err => alert(err.message)
   });

   const [unlinkContentPiece] = useMutation(UNLINK_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const [voters, setVoters] = useState(votes || []);

   let meVotedCheck = false;
   let computedScoreCheck = 0;
   voters.forEach(({ voter: { id: voterID }, value }) => {
      if (me && voterID === me.id) {
         meVotedCheck = true;
      }
      computedScoreCheck += value;
   });

   const [meVoted, setMeVoted] = useState(meVotedCheck);
   const [computedScore, setComputedScore] = useState(computedScoreCheck);

   const [vote] = useMutation(VOTE_MUTATION, {
      variables: {
         id,
         type: 'ContentPiece',
         isFreshVote: !meVoted
      },
      refetchQueries: [{ query: ALL_THINGS_QUERY }],
      onError: err => alert(err.message),
      context: {
         debounceKey: id
      }
   });

   const sendNewComment = async () => {
      const inputElement = commentInputRef.current;
      const commentText = inputElement.value;

      if (commentText.trim() === '') {
         alert("You can't post a blank comment, please write something first.");
         return;
      }

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

      inputElement.value = '';
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
      }).catch(err => {
         alert(err.message);
      });
   };

   let contentElement;
   if (!editable) {
      contentElement = <RichText text={rawContentString} key={id} />;
   } else {
      contentElement = (
         <RichTextArea
            text={rawContentString}
            postText={postContent}
            setEditable={setEditableHandler}
            placeholder="Add content"
            buttonText="save edit"
            id={id}
            key={id}
            inputRef={editContentInputRef}
         />
      );
   }

   const commentsElement = (
      <ContentPieceComments
         comments={comments}
         id={id}
         key={id}
         input={
            <RichTextArea
               text=""
               postText={sendNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={id}
               inputRef={commentInputRef}
            />
         }
      />
   );

   let translation = touchEnd - touchStart;
   if (!showingComments && translation > minimumTranslationDistance * -1) {
      translation = 0;
   }
   if (showingComments && translation < minimumTranslationDistance) {
      translation = 0;
   }

   let finalTranslation = '0';
   if (
      process.browser &&
      window.innerWidth < midScreenBPWidthRaw &&
      contentWrapperRef != null &&
      contentWrapperRef.current != null
   ) {
      const oneRem = getOneRem();

      const container = contentWrapperRef.current.parentNode;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const calculatedTranslation = showingComments
         ? translation - containerWidth / 2 - oneRem + 1
         : translation;
      finalTranslation = `${calculatedTranslation}px`;
   }

   const buttons = (
      <div
         className={`buttons buttonsContainer contentButtons ${
            editable ? 'allButtons' : 'someButtons'
         }`}
      >
         <div
            className="buttonWrapper"
            onClick={async () => {
               await navigator.clipboard
                  .writeText(`${home}/thing?id=${thingID}&piece=${id}`)
                  .catch(err => {
                     alert(err.message);
                  });
               setCopied(true);
               setTimeout(() => setCopied(false), 3000);
            }}
         >
            {copied ? 'copied' : <LinkIcon className="directLink buttons" />}
         </div>
         <div
            className="buttonWrapper"
            onClick={() => {
               setHasShownComments(true);
               let scrollingContainer;
               if (
                  comments.length > 0 &&
                  process.browser &&
                  window.innerWidth > midScreenBPWidthRaw &&
                  fullThingData.__typename !== 'Tag' &&
                  !hasShownComments
               ) {
                  if (!hasShownComments) {
                     // If we're on a big screen and this piece has comments, they're already going to be showing the first time we click this button, but showingComments will be false. So we're just going to setHasShownComments to true, which will make false the condition that shows them by default. showingComments will already be false, so we don't need to change it.
                     return;
                  }
                  // On big screens, the scrollingContainer is .content
                  scrollingContainer = document.querySelector('.content');
               } else {
                  // On small screens, the scrollingContainer is .threeColumns
                  scrollingContainer = document.querySelector('.threeColumns');
               }
               changeContentButKeepInFrame(
                  contentContainerRef.current,
                  scrollingContainer,
                  () => setShowingComments(!showingComments)
               );
               window.setTimeout(() => stickifier(stickifierData), 1);
            }}
         >
            <div className="commentButton">
               <CommentsButton
                  count={comments.length < 100 ? comments.length : '+'}
               />
            </div>
         </div>
         <div className="buttonWrapper votebarWrapper">
            <VoteBar
               id={id}
               votes={voters}
               key={`votebar-${id}`}
               type="ContentPiece"
               mini
            />
         </div>
         {editable && !isCopied && (
            <div
               className="buttonWrapper"
               onClick={() => deleteContentPiece(id)}
            >
               <TrashIcon
                  className="delete buttons"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
         {editable && isCopied && (
            <div
               className="buttonWrapper"
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
                        const oldCopiedContent = fullThingData.copiedInContent;
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
            >
               <X
                  className="delete buttons unlink"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
         {editable && (
            <div
               className="buttonWrapper"
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
            >
               <div className="addToContainer">
                  <X
                     color="mainText"
                     className={`addTo buttons${
                        showingAddToBox ? ' open' : ''
                     }`}
                  />
                  {showingAddToBox && (
                     <CopyContentInterface
                        id={id}
                        thingID={thingID}
                        setShowingAddToBox={setShowingAddToBox}
                     />
                  )}
               </div>
            </div>
         )}
         {editable && (
            <div
               className="buttonWrapper"
               onClick={e => {
                  e.preventDefault();
                  if (
                     reordering ||
                     rawContentString === editContentInputRef.current.value ||
                     confirm(
                        'Are you sure you want to reorder the content? Any unsaved changes will be lost.'
                     )
                  ) {
                     setReordering(!reordering);
                  }
               }}
            >
               <ReorderIcon
                  className={`reorder buttons${
                     reordering ? ' reordering' : ''
                  }`}
               />
            </div>
         )}
         {canEdit && (
            <div
               className="buttonWrapper"
               onClick={() => {
                  if (!editable) {
                     setEditableHandler(true);
                     return;
                  }
                  if (rawContentString !== editContentInputRef.current.value) {
                     if (!confirm('Discard changes?')) {
                        return;
                     }
                  }
                  setEditableHandler(!editable);
               }}
            >
               <EditThis
                  className="edit buttons"
                  onMouseDown={e => e.stopPropagation()}
               />
            </div>
         )}
      </div>
   );

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

   const contentArea = (
      <div className="overflowWrapper">
         <div className="contentAndCommentContainer">
            <div
               className={`contentWrapper${
                  translation === 0 && showingComments
                     ? ' doesNotGiveSize'
                     : ' givesSize'
               }`}
               style={{
                  transform: `translateX(${finalTranslation})`
               }}
               ref={contentWrapperRef}
            >
               <div className="theActualContent">{contentElement}</div>
               {otherLocations}
            </div>
            <div
               className={`commentsWrapper${
                  translation === 0 && !showingComments
                     ? ' doesNotGiveSize'
                     : ' givesSize'
               }${
                  (comments.length > 0 &&
                     !hasShownComments &&
                     fullThingData.__typename !== 'Tag') ||
                  showingComments
                     ? ' withComments'
                     : ' noComments'
               }`}
               style={{
                  transform: `translateX(${finalTranslation})`
               }}
            >
               {commentsElement}
            </div>
         </div>
      </div>
   );

   const handleMouseDown = e => {
      if (editable || reordering) return;
      if (e.target.closest('.buttons') != null) return;
      if (e.target.closest('.votebar') != null) return;

      if (e.button === 0 && me != null) {
         window.setTimeout(
            () =>
               contentContainerRef.current.addEventListener(
                  'mousedown',
                  doubleClickListener
               ),
            1
         );

         window.setTimeout(
            () =>
               contentContainerRef.current.removeEventListener(
                  'mousedown',
                  doubleClickListener
               ),
            500
         );
      }

      if (!canEdit) return;

      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
         window.setTimeout(() => setEditableHandler(true), 100); // If we set this to anything less than 100, it seems to trigger the opposite function in RichTextArea too
         return;
      }

      if (e.button === 1 || e.button === 2) {
         window.setTimeout(
            () =>
               contentContainerRef.current.addEventListener(
                  'mousedown',
                  secondMiddleOrRightClickListener
               ),
            1
         );
         window.setTimeout(
            () =>
               contentContainerRef.current.removeEventListener(
                  'mousedown',
                  secondMiddleOrRightClickListener
               ),
            500
         );
      }
   };

   const secondMiddleOrRightClickListener = e => {
      if (e.button === 1 || e.button === 2) {
         setEditableHandler(true);
      }
   };

   const doubleClickListener = e => {
      if (e.button === 0) {
         if (me == null) {
            setContent(<Login redirect={false} />);
            return;
         }

         e.preventDefault();

         let newVotes;
         let newScore;
         if (meVoted) {
            newVotes = voters.filter(voteData => voteData.voter.id !== me.id);
            newScore = computedScore - me.rep;
         } else {
            newVotes = [
               ...voters,
               {
                  __typename: 'Vote',
                  id: 'newVote',
                  value: me.rep,
                  voter: me
               }
            ];
            newScore = computedScore + me.rep;
         }

         setHeartPosition([e.clientX, e.clientY]);
         setFullHeart(!meVoted);

         vote({
            optimisticResponse: {
               __typename: 'Mutation',
               vote: {
                  __typename: 'ContentPiece',
                  id,
                  votes: newVotes
               }
            }
         });
         setVoters(newVotes);
         setComputedScore(newScore);
         setMeVoted(!meVoted);
      }
   };

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
               const scrollingContainer = document.querySelector(
                  '.threeColumns'
               );
               changeContentButKeepInFrame(
                  contentContainerRef.current,
                  scrollingContainer,
                  () => setShowingComments(true)
               );
               // setShowingComments(true);
               setHasShownComments(true);
            }
            if (touchEnd - touchStart > 100) {
               const scrollingContainer = document.querySelector(
                  '.threeColumns'
               );
               changeContentButKeepInFrame(
                  contentContainerRef.current,
                  scrollingContainer,
                  () => setShowingComments(false)
               );
               // setShowingComments(false);
               setHasShownComments(true);
            }
            setTouchStart(0);
            setTouchEnd(0);
         }}
         style={{ zIndex }} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
         ref={contentContainerRef}
      >
         <div className="contentArea">
            <div
               className={canEdit ? 'contentPiece editable' : 'contentPiece'}
               key={id}
               onMouseDown={handleMouseDown}
            >
               {contentArea}
            </div>
         </div>
         <div className="buttonsPlaceholder" />
         <div
            className={`newcontentButtons ${
               votes != null && votes.length > 0 ? 'withVoters' : 'noVoters'
            }`}
         >
            {buttons}
         </div>
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

// export default ContentPiece;
export default React.memo(ContentPiece, (prev, next) => {
   if (prev.rawContentString !== next.rawContentString) {
      return false;
   }
   if (prev.expanded !== next.expanded) {
      return false;
   }
   if (prev.comments.length !== next.comments.length) {
      return false;
   }
   if (JSON.stringify(prev.comments) !== JSON.stringify(next.comments)) {
      return false;
   }
   if (
      (prev.votes && next.votes && prev.votes.length !== next.votes.length) ||
      prev.score !== next.score
   ) {
      return false;
   }
   if (prev.copiedToThings || next.copiedToThings) {
      if (prev.copiedToThings !== next.copiedToThings) {
         return false;
      }
      if (
         prev.copiedToThings &&
         next.copiedToThings &&
         prev.copiedToThings.length !== next.copiedToThings.length
      ) {
         return false;
      }
   }
   return true;
});
