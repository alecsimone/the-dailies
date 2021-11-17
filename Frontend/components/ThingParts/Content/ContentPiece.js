import { useMutation } from '@apollo/react-hooks';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { minimumTranslationDistance } from '../../../config';
import {
   changeContentButKeepInFrame,
   CLEAR_UNSAVED_CONTENT_PIECE_MUTATION,
   editContentButKeepInFrame,
   STORE_UNSAVED_CONTENT_PIECE_MUTATION
} from '../../../lib/ContentHandling';
import { SINGLE_THING_QUERY } from '../../../pages/thing';
import {
   dynamicallyResizeElement,
   getOneRem,
   successFlash
} from '../../../styles/functions';
import { ModalContext } from '../../ModalProvider';
import RichText from '../../RichText';
import RichTextArea from '../../RichTextArea';
import { ADD_COMMENT_MUTATION } from '../Comments';
import ContentPieceComment from '../ContentPieceComments';
import { VOTE_MUTATION } from '../VoteBar';
import Login from '../../Account/Login';
import ContentPieceButtons from '../ContentPieceButtons';
import TruncCont from '../TruncCont';
import useStickifier, {
   getScrollingParent
} from '../../../Stickifier/useStickifier';
import { stickifyBlock } from '../../../Stickifier/stickifier';
import useMe from '../../Account/useMe';
import { basicMemberFields } from '../../../lib/CardInterfaces';
import Swiper from '../Swiper';

const ContentPiece = ({
   contentType,
   clickToShowComments,
   canEdit,
   pieceID,
   stuffID,
   stuffType,
   votes,
   unsavedContent,
   comments = [],
   rawContentString,
   onThing,
   isCopied,
   copiedToThings,
   editContentPiece,
   deleteContentPiece,
   reordering,
   setReordering,
   highlighted,
   zIndex,
   truncContExpanded,
   setTruncContExpanded
}) => {
   const { loggedInUserID, memberFields } = useMe(
      'ContentPiece',
      basicMemberFields
   );

   const [editable, setEditable] = useState(false);
   const editContentInputRef = useRef(null); // This ref will be passed down to the RichTextArea that allows us to edit the content piece, and we'll use it to get the value for our editContentPiece mutation

   const commentInputRef = useRef(null); // This ref will be passed down to the RichTextArea that allows us to comment on the content piece, and we'll use it to get the value for our editContentPiece mutation

   const [showingOtherPlaces, setShowingOtherPlaces] = useState(false); // Will handle showing the info on how many other places the content piece appears in if it's been copied to other things

   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   const [unsavedNewContent, setUnsavedNewContent] = useState(unsavedContent);

   const [showingComments, setShowingComments] = useState(false);
   const [hasShownComments, setHasShownComments] = useState(false);
   const contentWrapperRef = useRef(null);
   const setEditableHandler = value => {
      editContentButKeepInFrame(setEditable, value, contentWrapperRef.current);
   };

   const { setHeartPosition, setFullHeart, setContent } = useContext(
      ModalContext
   ); // These are for showing a little heart icon where you tapped when you double tap a content piece

   const contentContainerRef = useRef(null);

   useStickifier();

   const postContent = async () => {
      const inputRef = editContentInputRef.current;
      const editedContent = inputRef.value;

      if (editedContent.trim() === '') {
         alert(
            "You can't make a content piece blank. Please delete it if you want to get rid of it."
         );
         return;
      }

      setEditableHandler(false);
      await editContentPiece(pieceID, editedContent);
      successFlash(contentContainerRef.current);
   };

   const [storeUnsavedContentPieceChanges] = useMutation(
      STORE_UNSAVED_CONTENT_PIECE_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const [clearUnsavedContentPieceChanges] = useMutation(
      CLEAR_UNSAVED_CONTENT_PIECE_MUTATION,
      {
         variables: {
            pieceId: pieceID,
            thingId: stuffID
         },
         onError: err => alert(err.message)
      }
   );

   const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      onError: err => alert(err.message)
   });

   const [voters, setVoters] = useState(votes || []);

   let meVotedCheck = false;
   let computedScoreCheck = 0; // We're going to figure out the current score of the content piece by tallying up all its votes
   voters.forEach(({ voter: { id: voterID }, value }) => {
      if (loggedInUserID && voterID === loggedInUserID) {
         meVotedCheck = true;
      }
      computedScoreCheck += value;
   });

   const [meVoted, setMeVoted] = useState(meVotedCheck);
   const [computedScore, setComputedScore] = useState(computedScoreCheck);

   const [vote] = useMutation(VOTE_MUTATION, {
      variables: {
         id: pieceID,
         type: 'ContentPiece',
         isFreshVote: !meVoted
      },
      onError: err => alert(err.message),
      context: {
         debounceKey: pieceID
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
            avatar: memberFields.avatar,
            displayName: memberFields.displayName,
            id: loggedInUserID,
            rep: memberFields.rep
         },
         comment: commentText,
         createdAt: now.toISOString(),
         id: 'temporaryID',
         votes: [],
         updatedAt: now.toISOString()
      };

      const commentsCopy = JSON.parse(JSON.stringify(comments));
      commentsCopy.push(newComment);

      inputElement.value = '';
      await addComment({
         variables: {
            comment: commentText,
            id: pieceID,
            type: 'ContentPiece'
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addComment: {
               __typename: 'ContentPiece',
               id: pieceID,
               comments: commentsCopy
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't. So once we get the actual id of the new comment back from the server, we update the cache to add it.
               const query = SINGLE_THING_QUERY;
               const oldData = client.readQuery({
                  query,
                  variables: { id: stuffID }
               });
               const thisContentPieceIndex = oldData.thing.content.findIndex(
                  piece => piece.id === data.addComment.id
               );
               oldData.thing.content[thisContentPieceIndex].comments =
                  data.addComment.comments;
               client.writeQuery({
                  query,
                  variables: { id: stuffID },
                  data: oldData
               });
            }
         }
      }).catch(err => {
         alert(err.message);
      });

      window.setTimeout(() => dynamicallyResizeElement(inputElement), 1);
   };

   const unsavedChangesHandler = async e => {
      let originalThingId = stuffID;
      if (onThing != null && onThing.id != null) {
         originalThingId = onThing.id;
      }
      await storeUnsavedContentPieceChanges({
         variables: {
            thingId: originalThingId,
            pieceId: pieceID,
            unsavedContent: e.target.value
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   useEffect(() => {
      // Every time the content piece re-renders, we want to stickify it again, just in case it needs an adjustment, and to make sure it gets stickified on its first render

      // However, if it's a thing within a thing within a thing, we don't want to do anything, cause that's just too much, man
      if (
         contentContainerRef.current
            .closest('.flexibleThingCard')
            ?.parentElement?.closest('.flexibleThingCard')
            ?.parentElement?.closest('.flexibleThingCard') != null
      )
         return;

      const thisBlock = contentContainerRef.current;
      stickifyBlock(thisBlock);
   });

   let contentElement;
   if (!editable) {
      contentElement =
         contentType === 'single' ? (
            <TruncCont
               limit={280}
               cont={rawContentString}
               truncContExpanded={truncContExpanded}
               setTruncContExpanded={setTruncContExpanded}
            />
         ) : (
            <RichText text={rawContentString} key={pieceID} />
         );
   } else {
      contentElement = (
         <RichTextArea
            text={rawContentString}
            postText={postContent}
            rawUpdateText={async () => {
               await editContentPiece(
                  pieceID,
                  editContentInputRef.current.value
               );
               successFlash(contentContainerRef.current);
            }}
            setEditable={setEditableHandler}
            placeholder="Add content"
            buttonText="save edit"
            id={pieceID}
            key={pieceID}
            inputRef={editContentInputRef}
            unsavedChangesHandler={unsavedChangesHandler}
         />
      );
   }

   const commentsElement = (
      <ContentPieceComment
         defaultView={clickToShowComments ? 'expanded' : 'collapsed'}
         comments={comments}
         id={pieceID}
         key={pieceID}
         input={
            <RichTextArea
               text=""
               postText={sendNewComment}
               placeholder="Add comment"
               buttonText="comment"
               id={pieceID}
               inputRef={commentInputRef}
            />
         }
      />
   );

   let otherLocations = false;
   let copiedFrom;
   let alsoFoundIn;
   if (isCopied && onThing != null && onThing.id !== stuffID) {
      copiedFrom = (
         <div>
            Copied from{' '}
            <Link
               href={{
                  pathname: '/thing',
                  query: { id: onThing.id, piece: pieceID }
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
         thing => thing.id !== stuffID
      );
      if (otherThingsArray.length > 0) {
         const otherPlaces = otherThingsArray.map(thing => (
            <div>
               <Link
                  href={{
                     pathname: '/thing',
                     query: { id: thing.id, piece: pieceID }
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

   const fullContentElement = (
      <div className="contentWrapper" ref={contentWrapperRef}>
         <div className="theActualContent">
            {contentElement}
            {canEdit &&
               unsavedNewContent != null &&
               unsavedNewContent !== '' &&
               unsavedNewContent !== rawContentString && (
                  <div className="unsavedContent">
                     <h4>Unsaved Changes</h4>
                     <div className="visibilityInfo">(visible only to you)</div>
                     {unsavedNewContent}
                     <button
                        onClick={() => {
                           if (!confirm('Discard these unsaved changes?'))
                              return;
                           clearUnsavedContentPieceChanges();
                           setUnsavedNewContent(null);
                        }}
                     >
                        discard
                     </button>
                  </div>
               )}
         </div>
         {otherLocations}
      </div>
   );

   const fullCommentsElement = (
      <div
         className={`commentsWrapper${
            (comments.length > 0 && !hasShownComments) || showingComments
               ? ' withComments'
               : ' noComments'
         }`}
      >
         {commentsElement}
      </div>
   );

   let contentArea;
   if (contentType === 'full' && clickToShowComments) {
      contentArea = (
         <Swiper
            elementsArray={[fullContentElement, fullCommentsElement]}
            hideNavigator
            overridePosition={showingComments ? 1 : 0}
         />
      );
   } else {
      contentArea = (
         <div className="overflowWrapper">
            <div
               className={`contentAndCommentContainer ${
                  clickToShowComments ? 'cts' : 'ncts'
               }`}
            >
               {(!clickToShowComments || !showingComments) &&
                  fullContentElement}
               {(!clickToShowComments || showingComments) &&
                  fullCommentsElement}
            </div>
         </div>
      );
   }

   const secondMiddleOrRightClickListener = e => {
      if (e.button === 1 || e.button === 2) {
         setEditableHandler(true);
      }
   };

   const doubleClickListener = e => {
      if (e.button === 0) {
         if (loggedInUserID == null) {
            setContent(<Login redirect={false} />);
            return;
         }

         e.preventDefault();

         let newVotes;
         let newScore;
         if (meVoted) {
            newVotes = voters.filter(
               voteData => voteData.voter.id !== loggedInUserID
            );
            newScore = computedScore - memberFields.rep;
         } else {
            newVotes = [
               ...voters,
               {
                  __typename: 'Vote',
                  id: 'newVote',
                  value: memberFields.rep,
                  voter: memberFields
               }
            ];
            newScore = computedScore + memberFields.rep;
         }

         setHeartPosition([e.clientX, e.clientY]);
         setFullHeart(!meVoted);

         vote({
            optimisticResponse: {
               __typename: 'Mutation',
               vote: {
                  __typename: 'ContentPiece',
                  id: pieceID,
                  votes: newVotes
               }
            }
         });
         setVoters(newVotes);
         setComputedScore(newScore);
         setMeVoted(!meVoted);
      }
   };

   const handleMouseDown = e => {
      if (editable || reordering) return;
      if (e.target.closest('.buttons') != null) return;
      if (e.target.closest('.votebar') != null) return;

      if (e.button === 0 && loggedInUserID != null) {
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
         e.stopPropagation();
         window.setTimeout(
            () =>
               contentContainerRef.current.addEventListener(
                  'mousedown',
                  secondMiddleOrRightClickListener
               ),
            1
         );
         window.setTimeout(() => {
            if (contentContainerRef.current != null) {
               contentContainerRef.current.removeEventListener(
                  'mousedown',
                  secondMiddleOrRightClickListener
               );
            }
         }, 500);
      }
   };

   return (
      <div
         className={`contentBlock${highlighted ? ' highlighted' : ''}${
            clickToShowComments ? ' clickToShowComments' : ''
         }`}
         key={pieceID}
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
               setHasShownComments(true);
            }
            setTouchStart(0);
            setTouchEnd(0);
         }}
         style={{ zIndex }} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
         ref={contentContainerRef}
      >
         <div className="contentArea" onMouseDown={handleMouseDown}>
            <div
               className={canEdit ? 'contentPiece editable' : 'contentPiece'}
               key={[pieceID]}
            >
               {contentArea}
            </div>
         </div>
         <div className="buttonsPlaceholder" />
         <div
            className={`newcontentButtons ${
               votes != null && votes.length > 0 ? 'withVoters' : 'noVoters'
            } ${showingComments ? 'showingComments' : 'showingContent'}`}
         >
            <ContentPieceButtons
               canEdit={canEdit}
               editable={editable}
               hasShownComments={hasShownComments}
               setHasShownComments={setHasShownComments}
               commentCount={comments.length}
               clickToShowComments={clickToShowComments}
               showingComments={showingComments}
               setShowingComments={setShowingComments}
               stuffID={stuffID}
               stuffType={stuffType}
               pieceID={pieceID}
               voters={voters}
               isCopied={isCopied}
               deleteContentPiece={deleteContentPiece}
               reordering={reordering}
               setReordering={setReordering}
               rawContentString={rawContentString}
               editContentInputRef={editContentInputRef}
               clearUnsavedContentPieceChanges={clearUnsavedContentPieceChanges}
               setUnsavedNewContent={setUnsavedNewContent}
               setEditableHandler={setEditableHandler}
               contentContainerRef={contentContainerRef}
               postContent={postContent}
            />
         </div>
      </div>
   );
};

export default React.memo(ContentPiece, (prev, next) => {
   if (prev.clickToShowComments !== next.clickToShowComments) {
      return false;
   }
   if (prev.rawContentString !== next.rawContentString) {
      return false;
   }
   if (prev.truncContExpanded !== next.truncContExpanded) {
      return false;
   }
   if (
      prev.comments &&
      next.comments &&
      prev.comments.length !== next.comments.length
   ) {
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
