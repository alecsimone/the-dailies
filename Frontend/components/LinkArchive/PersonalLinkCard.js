import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState } from 'react';
import { fullPersonalLinkFields } from '../../lib/CardInterfaces';
import { getRandomString } from '../../lib/TextHandling';
import ExplodingLink from '../ExplodingLink';

const ADD_TAG_TO_PERSONAL_LINK_MUTATION = gql`
   mutation ADD_TAG_TO_PERSONAL_LINK_MUTATION($linkID: ID!, $tagToAdd: String!) {
      addTagToPersonalLink(linkID: $linkID, tagToAdd: $tagToAdd) {
         ${fullPersonalLinkFields}
      }
   }
`;

const PersonalLinkCard = ({ linkData }) => {
   const [tagInput, setTagInput] = useState('');

   const [addTagToLink] = useMutation(ADD_TAG_TO_PERSONAL_LINK_MUTATION, {
      onError: err => alert(err.message)
   });

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
      <div className="personalLinkCard">
         {linkData.title != null && (
            <h3 className="personalLinkTitle" contentEditable>
               {linkData.title}
            </h3>
         )}
         {linkData.description != null && (
            <div className="description" contentEditable>
               {linkData.description}
            </div>
         )}
         <div className="personalLinkWrapper">
            <ExplodingLink url={linkData.url} />
         </div>
         <input
            type="text"
            className="addTag"
            placeholder="#add tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
         />
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
