import { useMutation } from '@apollo/react-hooks';
import { useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Reorder from 'react-reorder';
import StyledContent from '../../styles/StyledContent';
import ContentPiece from './ContentPiece';
import RichTextArea from '../RichTextArea';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';
import {
   ADD_CONTENTPIECE_MUTATION,
   DELETE_CONTENTPIECE_MUTATION,
   EDIT_CONTENTPIECE_MUTATION,
   REORDER_CONTENT_MUTATION,
   stickifier,
   orderContent
} from '../../lib/ContentHandling';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { SINGLE_TAX_QUERY } from '../../pages/tag';
import { MemberContext } from '../Account/MemberProvider';
import { dynamicallyResizeElement } from '../../styles/functions';

const Content = ({ context, canEdit, linkedPiece }) => {
   // First we'll pull in all our data from context
   const {
      content = [],
      contentOrder,
      copiedInContent,
      id,
      __typename: type = 'Thing'
   } = useContext(context);

   // Then we'll pull in the member data so we can get default expansion from it
   const { me } = useContext(MemberContext);
   let defaultExpansion = false;
   if (me != null) {
      defaultExpansion = me.defaultExpansion;
   }

   // Then we'll set up our mutation hooks
   const [addContentPiece] = useMutation(ADD_CONTENTPIECE_MUTATION, {
      onCompleted: data =>
         checkForNewThingRedirect(id, 'addContentPiece', data),
      onError: err => alert(err.message)
   });

   const [deleteContentPiece] = useMutation(DELETE_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message)
   });

   const [editContentPiece] = useMutation(EDIT_CONTENTPIECE_MUTATION, {
      onError: err => alert(err.message),
      onCompleted: data => {
         const thisThing = document.querySelector('article.fullThing');
         thisThing.classList.add('success');
         window.setTimeout(() => {
            const thisThing = document.querySelector('article.fullThing');
            thisThing.classList.remove('success');
         }, 200);
      }
   });

   const [reorderContent] = useMutation(REORDER_CONTENT_MUTATION, {
      onError: err => alert(err.message)
   });
   const [reordering, setReordering] = useState(false);

   // We need to make an object whose properties are the ids of all the content pieces on this thing, each of which starts out false
   const expandedContentObject = {};
   content.forEach(contentPiece => {
      expandedContentObject[contentPiece.id] = defaultExpansion;
   });
   const [contentExpansionObject, setContentExpansionObject] = useState(
      expandedContentObject
   );

   // Then we need a function to switch an individual value in that object
   const handleContentExpansion = (pieceID, state) => {
      setContentExpansionObject(prevState => ({
         ...prevState,
         [pieceID]: state
      }));
   };

   // And a function to set all values in that object to something
   const setAllExpansion = state => {
      const keys = Object.keys(contentExpansionObject);
      const newContentExpansionObject = {};
      keys.forEach(key => (newContentExpansionObject[key] = state));
      setContentExpansionObject(newContentExpansionObject);
   };

   // This ref will be passed down to the RichTextArea that sits at the bottom of content and allows members to add a new content piece, and we'll use it to get the value for our sendNewContentPiece mutation
   const inputRef = useRef(null);

   // This ref is going to hold all the data we need for making the edit buttons sticky. Things that don't change are populated in an effect that runs on the first render only, and everything else is populated in the stickifier function, which will be attached to a scroll listener by that same effect.
   const stickingData = useRef({
      blocksArray: []
   });

   const stickifierHandler = () => {
      // We need this little function so we can pass a parameter to stickifier when it's called by the scroll listener, and we can't just use an arrow function in the listener because then we can't remove it
      stickifier(stickingData);
   };

   // Add the stickifier listeners
   useEffect(() => {
      // mainSection does the scrolling on big screens, threeColumns on mobile, so we'll add listeners to them so we can move the buttons on scroll
      const mainSection = document.querySelector('.mainSection');
      mainSection.addEventListener('scroll', stickifierHandler);

      const threeColumns = document.querySelector('.threeColumns');
      threeColumns.addEventListener('scroll', stickifierHandler);

      // get all the content blocks. If there aren't any, no need for sticky buttons, so we return.
      const blocks = document.querySelectorAll('.contentBlock');
      if (blocks.length === 0) return;

      const firstBlock = blocks[0];

      const sidebar = firstBlock.closest('.sidebar');
      if (sidebar != null) {
         sidebar.addEventListener('scroll', stickifierHandler);
      }

      // Get the raw number of pixels of padding on the content block, and store it in stickingData. We'll have to cut the "px" off the end of the value we get back from getComputedStyle
      const blockPaddingTopString = window.getComputedStyle(firstBlock)
         .paddingTop;
      const blockPaddingTopRaw = blockPaddingTopString.substring(
         0,
         blockPaddingTopString.length - 2
      );
      const blockPaddingTop = parseInt(blockPaddingTopRaw);
      stickingData.current.blockPaddingTop = blockPaddingTop;

      const blockPaddingLeftString = window.getComputedStyle(firstBlock)
         .paddingLeft;
      const blockPaddingLeftRaw = blockPaddingLeftString.substring(
         0,
         blockPaddingLeftString.length - 2
      );
      const blockPaddingLeft = parseInt(blockPaddingLeftRaw);
      stickingData.current.blockPaddingLeft = blockPaddingLeft;

      // Do the same for the contentPiece
      const piece = firstBlock.querySelector('.contentPiece');
      const piecePaddingString = window.getComputedStyle(piece).paddingTop;
      const piecePaddingRaw = piecePaddingString.substring(
         0,
         piecePaddingString.length - 2
      );
      const piecePadding = parseInt(piecePaddingRaw);
      stickingData.current.piecePadding = piecePadding;

      const fullThing = firstBlock.offsetParent;
      // This only works because the full thing element is the closest ancestor to content blocks which is positioned. If we change this at some point, we'll have to add a check here to make sure we get the right element.
      const fullThingOffset = fullThing.offsetTop;
      stickingData.current.fullThingOffset = fullThingOffset;

      // Need to run it once here so that the edit buttons will be properly placed before the first scroll
      stickifier(stickingData);

      return () => {
         mainSection.removeEventListener('scroll', stickifierHandler);
         threeColumns.removeEventListener('scroll', stickifierHandler);
      };
   }, [stickifierHandler]);

   const sendNewContentPiece = async () => {
      const inputElement = inputRef.current;
      const newContentPiece = inputElement.value;
      if (newContentPiece.trim() === '') {
         alert(
            "You can't add a blank content piece. Please write something first."
         );
         return;
      }
      inputElement.value = '';
      content.push({
         __typename: 'ContentPiece',
         content: newContentPiece,
         id: 'temporaryID',
         comments: []
      });
      // setFullThingToLoading(id);
      dynamicallyResizeElement(inputRef.current);
      await addContentPiece({
         variables: {
            content: newContentPiece,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            addContentPiece: {
               __typename: type,
               id,
               content,
               comments: []
            }
         },
         update: (client, { data }) => {
            if (data.__typename == null) {
               // Our optimistic response includes a typename for the mutation, but the server's data doesn't
               let query;
               switch (data.addContentPiece.__typename) {
                  case 'Thing':
                     query = SINGLE_THING_QUERY;
                     break;
                  case 'Tag':
                     query = SINGLE_TAX_QUERY;
                     break;
                  case 'Stack':
                     query = SINGLE_TAX_QUERY;
                     break;
                  default:
                     console.log('Unknown stuff type');
                     return;
               }
               const oldData = client.readQuery({
                  query,
                  variables: { id }
               });
               oldData[data.addContentPiece.__typename.toLowerCase()].content =
                  data.addContentPiece.content;
               client.writeQuery({
                  query,
                  variables: { id },
                  data: oldData
               });
            }
         }
      }).catch(err => {
         alert(err.message);
      });
      inputElement.value = ''; // We need to clear the input after adding it
   };

   const deletePiece = async contentPieceID => {
      if (!confirm('Are you sure you want to delete that?')) {
         return;
      }
      const newContent = content.filter(
         contentPiece => contentPiece.id !== contentPieceID
      );
      await deleteContentPiece({
         variables: {
            contentPieceID,
            id,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            deleteContentPiece: {
               __typename: type,
               id,
               content: newContent
            }
         }
      }).catch(err => {
         alert(err.message);
      });
   };

   const editPiece = async (contentPieceID, newContent) => {
      const indexOfEditedContentPiece = fullContent.findIndex(
         contentPiece => contentPiece.id === contentPieceID
      );

      if (fullContent[indexOfEditedContentPiece] == null) {
         console.log('Something has gone terribly wrong. Please try again.');
      }

      const thisPiece = fullContent[indexOfEditedContentPiece];

      fullContent[indexOfEditedContentPiece].content = newContent;

      await editContentPiece({
         variables: {
            contentPieceID,
            content: newContent,
            id: thisPiece.onThing.id, // The piece might be copied from another thing, so we can't assume it has the id of the thing we're viewing,
            type
         },
         optimisticResponse: {
            __typename: 'Mutation',
            editContentPiece: {
               __typename: type,
               id,
               content: fullContent
            }
         }
      }).catch(err => {
         alert(err.message);
      });

      handleContentExpansion(contentPieceID, true);
   };

   if ((content == null || content.length === 0) && !canEdit) return null;

   let contentElements;
   let orderedContent;
   let fullContent;
   if (content) {
      if (copiedInContent != null && copiedInContent.length > 0) {
         fullContent = content.concat(copiedInContent);
      } else {
         fullContent = content;
      }
      orderedContent = orderContent(fullContent, contentOrder);
      contentElements = orderedContent.map((contentPiece, index) => {
         const [originalContentCheck] = content.filter(
            piece => piece.id === contentPiece.id
         );
         const isOriginalContent = originalContentCheck != null;
         return (
            <div
               key={contentPiece.id}
               className={reordering ? 'reordering' : 'locked'}
            >
               <ContentPiece
                  id={contentPiece.id}
                  thingID={id}
                  canEdit={canEdit}
                  rawContentString={contentPiece.content}
                  comments={contentPiece.comments}
                  expanded={contentExpansionObject[contentPiece.id]}
                  setExpanded={handleContentExpansion}
                  deleteContentPiece={deletePiece}
                  editContentPiece={editPiece}
                  setReordering={setReordering}
                  reordering={reordering}
                  highlighted={linkedPiece === contentPiece.id}
                  stickifier={stickifier}
                  stickifierData={stickingData}
                  isCopied={!isOriginalContent}
                  context={context}
                  onThing={contentPiece.onThing}
                  copiedToThings={contentPiece.copiedToThings}
                  votes={contentPiece.votes}
                  key={contentPiece.id}
                  zIndex={orderedContent.length - index} // We need to reverse the stacking context order so that each content piece is below the one before it, otherwise the next content piece will cover up the addToInterface, or anything else we might have pop out of the buttons
               />
            </div>
         );
      });
   }

   if (process.browser && canEdit && reordering) {
      contentElements = (
         <Reorder
            reorderId={id}
            touchHoldTime={250}
            placeholderClassName="placeholder"
            draggedClassName="dragged"
            onReorder={async (e, oldPosition, newPosition, reorderId, f) => {
               let order;
               if (contentOrder != null) {
                  order = [];
                  contentOrder.forEach(id => {
                     const [piece] = content.filter(
                        contentPiece => contentPiece.id === id
                     );
                     if (piece != null) {
                        order.push(id);
                     }
                  });
                  content.forEach(contentPiece => {
                     if (contentOrder.includes(contentPiece.id)) {
                        return;
                     }
                     order.push(contentPiece.id);
                  });
               } else {
                  order = content.map(content => content.id);
               }
               order.splice(newPosition, 0, order.splice(oldPosition, 1)[0]);
               await reorderContent({
                  variables: {
                     id,
                     type,
                     oldPosition,
                     newPosition
                  },
                  optimisticResponse: {
                     reorderContent: {
                        __typename: type,
                        id,
                        content,
                        contentOrder: order
                     }
                  }
               }).catch(err => {
                  alert(err.message);
               });
            }}
         >
            {contentElements}
         </Reorder>
      );
   }

   return (
      <StyledContent className="content">
         <div className="contentSectionWrapper">
            {contentElements}
            {canEdit && (
               <RichTextArea
                  text=""
                  postText={sendNewContentPiece}
                  placeholder="Add content"
                  buttonText="add"
                  id={`${id}-content`}
                  inputRef={inputRef}
               />
            )}
            {canEdit && (
               <button
                  type="button"
                  className="reorder"
                  onClick={() => setReordering(!reordering)}
               >
                  {reordering ? 'Lock Content' : 'Reorder Content'}
               </button>
            )}
         </div>
      </StyledContent>
   );
};
Content.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired,
   canEdit: PropTypes.bool,
   linkedPiece: PropTypes.string // this is a query parameter that can be passed through the url to highlight a specific content piece on a thing
};

export default Content;
