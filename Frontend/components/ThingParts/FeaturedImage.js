import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TitleBar from './TitleBar';
import ExplodingLink from '../ExplodingLink';
import { setAlpha } from '../../styles/functions';
import { isVideo, isExplodingLink } from '../../lib/UrlHandling';
import {
   disabledCodewords,
   checkForNewThingRedirect
} from '../../lib/ThingHandling';
import { setFullThingToLoading } from './FullThing';

const SET_FEATURED_IMAGE_MUTATION = gql`
   mutation SET_FEATURED_IMAGE_MUTATION(
      $featuredImage: String!
      $id: ID!
      $type: String!
   ) {
      setFeaturedImage(featuredImage: $featuredImage, id: $id, type: $type) {
         ... on Tag {
            __typename
            id
            featuredImage
         }
         ... on Thing {
            __typename
            id
            featuredImage
         }
         ... on Category {
            __typename
            id
            featuredImage
         }
      }
   }
`;

const StyledFeaturedImage = styled.div`
   position: relative;
   line-height: 0;
   width: 100%;
   z-index: 1;
   img,
   video {
      width: 100%;
      object-fit: cover;
      z-index: 0;
   }
   .formWrapper {
      position: relative;
      min-height: 6rem;
   }
   form#featuredImageForm {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      &.empty {
         position: relative;
         display: flex;
         align-items: center;
         justify-content: center;
      }
      &.full {
         background: ${props => setAlpha(props.theme.background, 0.8)};
      }
      input#featuredImageInput {
         font-size: ${props => props.theme.smallText};
         width: 100%;
         max-width: 50rem;
         margin-bottom: 3rem;
         text-align: center;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
      }
   }
   img.editThis {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: ${props => props.theme.smallText};
      cursor: pointer;
      z-index: 3;
      opacity: 0.4;
      &:hover {
         opacity: 0.8;
      }
   }
   .tweet {
      line-height: 1.6;
      margin: 0;
      &:first-child {
         margin-top: 0;
      }
      a {
         line-height: 0;
      }
      .quoteTweetContainer {
         margin: 0;
      }
   }
`;

const FeaturedImage = props => {
   const { canEdit } = props;
   const { context, titleLimit } = props;

   const { featuredImage, id, __typename: type = 'Thing' } = useContext(
      context
   );

   const [featuredImageInput, setFeaturedImageInput] = useState(
      featuredImage == null ? '' : featuredImage
   );
   const [showInput, setShowInput] = useState(featuredImage == null);

   const [setFeaturedImage, { data: fimgdata }] = useMutation(
      SET_FEATURED_IMAGE_MUTATION,
      {
         onCompleted: data =>
            checkForNewThingRedirect(id, 'setFeaturedImage', data)
      }
   );

   const sendNewFeaturedImage = () => {
      if (
         !isExplodingLink(featuredImageInput) &&
         !disabledCodewords.includes(featuredImageInput)
      ) {
         window.alert("That's not a valid featured image, sorry");
         return;
      }
      setFullThingToLoading(id);
      setFeaturedImage({
         variables: {
            featuredImage: featuredImageInput,
            id,
            type
         }
      });
      setShowInput(false);
   };

   const hideInput = e => {
      if (e.key === 'Escape') {
         setShowInput(false);
         removeEventListener('keydown', hideInput);
      }
   };
   const showInputHandler = () => {
      setShowInput(!showInput);
      if (showInput) {
         removeEventListener('keydown', hideInput);
      } else {
         addEventListener('keydown', hideInput);
      }
   };

   return (
      <StyledFeaturedImage
         className={
            isVideo(featuredImage)
               ? 'featuredImage video'
               : 'featuredImage image'
         }
      >
         {featuredImage && !disabledCodewords.includes(featuredImage) && (
            <ExplodingLink
               url={featuredImage}
               alt="Featured"
               className="featured"
            />
         )}
         {canEdit && showInput && (
            <div className="formWrapper">
               <form
                  id="featuredImageForm"
                  className={featuredImage == null ? 'empty' : 'full'}
                  onSubmit={e => {
                     e.preventDefault();
                     sendNewFeaturedImage();
                  }}
               >
                  <input
                     type="text"
                     name="featuredImageInput"
                     id="featuredImageInput"
                     placeholder="add featured image"
                     value={featuredImageInput}
                     onChange={e => setFeaturedImageInput(e.target.value)}
                  />
               </form>
            </div>
         )}
         <TitleBar context={context} limit={titleLimit} canEdit={canEdit} />
         {canEdit && (
            <img
               src="/edit-this.png"
               className="editThis"
               alt="edit featured"
               onClick={showInputHandler}
            />
         )}
      </StyledFeaturedImage>
   );
};
FeaturedImage.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }),
   titleLimit: PropTypes.number,
   canEdit: PropTypes.bool
};

export default FeaturedImage;
