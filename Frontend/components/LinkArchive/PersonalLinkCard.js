import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRef, useState } from 'react';
import { fullPersonalLinkFields } from '../../lib/CardInterfaces';
import { getRandomString } from '../../lib/TextHandling';
import { successFlash } from '../../styles/functions';
import ExplodingLink from '../ExplodingLink';
import ContentIcon from '../Icons/ContentIcon';

const ADD_TAG_TO_PERSONAL_LINK_MUTATION = gql`
   mutation ADD_TAG_TO_PERSONAL_LINK_MUTATION($linkID: ID!, $tagToAdd: String!) {
      addTagToPersonalLink(linkID: $linkID, tagToAdd: $tagToAdd) {
         ${fullPersonalLinkFields}
      }
   }
`;

const EDIT_LINK_MUTATION = gql`
   mutation EDIT_LINK_MUTATION($linkID: ID!, $title: String, $description: String) {
      editPersonalLink(linkID: $linkID, title: $title, description: $description) {
         ${fullPersonalLinkFields}
      }
   }
`;

const PersonalLinkCard = ({ linkData }) => {
   const [tagInput, setTagInput] = useState('');
   const [showingDetails, setShowingDetails] = useState(
      linkData.title != null || linkData.description != null
   );

   const cardRef = useRef(null);

   const [addTagToLink] = useMutation(ADD_TAG_TO_PERSONAL_LINK_MUTATION, {
      onError: err => alert(err.message)
   });

   const [editPersonalLink] = useMutation(EDIT_LINK_MUTATION, {
      onError: err => alert(err.message),
      onCompleted: () => successFlash(cardRef.current)
   });

   const submitLinkChanges = e => {
      if (e.key != null && e.key !== 'Enter') return;

      if (e.key != null && e.key === 'Enter') {
         e.preventDefault();
      }

      e.target.blur();

      if (e.target.innerText === linkData[e.target.dataset.name]) return;

      editPersonalLink({
         variables: {
            linkID: linkData.id,
            [e.target.dataset.name]: e.target.innerText
         }
      });
   };

   const handleKeyDown = e => {
      if (e.key === 'Enter') {
         const newLinkData = JSON.parse(JSON.stringify(linkData));

         if (tagInput.includes(',')) {
            const tagsArray = tagInput.split(',');
            tagsArray.forEach(tag => {
               newLinkData.partOfTags.push({
                  __typename: 'LinkTag',
                  id: `temporary-${getRandomString(12)}`,
                  title: tag.trim()
               });
            });
         } else {
            newLinkData.partOfTags.push({
               __typename: 'LinkTag',
               id: `temporary-${getRandomString(12)}`,
               title: tagInput
            });
         }

         addTagToLink({
            variables: {
               linkID: linkData.id,
               tagToAdd: tagInput
            },
            optimisticResponse: {
               __typename: 'Mutation',
               addTagToPersonalLink: newLinkData
            }
         });
         setTagInput('');
      }
   };

   let tagString = '';
   if (linkData.partOfTags != null && linkData.partOfTags.length > 0) {
      linkData.partOfTags.forEach((tagObj, index) => {
         if (index + 1 === linkData.partOfTags.length) {
            tagString += tagObj.title;
         } else {
            tagString += `${tagObj.title}, `;
         }
      });
   }

   return (
      <div className="personalLinkCard" ref={cardRef}>
         <div className="personalLinkWrapper">
            <ExplodingLink url={linkData.url} hideCardShortlink />
         </div>
         {showingDetails && (
            <h3
               className="personalLinkTitle"
               contentEditable
               onBlur={submitLinkChanges}
               onKeyDown={submitLinkChanges}
               data-name="title"
            >
               {linkData.title != null ? linkData.title : 'Untitled Link'}
            </h3>
         )}
         {showingDetails && (
            <div
               className="description"
               contentEditable
               onBlur={submitLinkChanges}
               onKeyDown={submitLinkChanges}
               data-name="description"
            >
               {linkData.description != null
                  ? linkData.description
                  : 'Add description'}
            </div>
         )}
         <div className="inputsWrapper">
            <input
               type="text"
               className="addTag"
               placeholder="#add tag"
               value={tagInput}
               onChange={e => setTagInput(e.target.value)}
               onKeyDown={handleKeyDown}
            />
            <ContentIcon
               className={showingDetails ? 'showing' : 'hidden'}
               onClick={() => setShowingDetails(!showingDetails)}
            />
         </div>
         {tagString !== '' && (
            <div className="tagList">
               <span className="tagMarker">#</span>
               {tagString}
            </div>
         )}
      </div>
   );
};

export default PersonalLinkCard;
