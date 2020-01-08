import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import TitleBar from './TitleBar';
import ExplodingLink from '../ExplodingLink';
import { setAlpha } from '../../styles/functions';
import { isVideo, isExplodingLink } from '../../lib/UrlHandling';

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
      }
   }
`;

const StyledFeaturedImage = styled.div`
   min-height: 18rem;
   position: relative;
   line-height: 0;
   width: 100%;
   img,
   video {
      width: 100%;
      max-height: 1440px;
      object-fit: cover;
      z-index: 0;
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
   }
   &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
   }
   &.image {
      .titleBarContainer {
         z-index: 1;
         position: absolute;
         bottom: 0;
         left: 0;
         width: 100%;
         padding: 12rem 0 0.25rem;
         margin: 0;
         text-shadow: 0px 0px 2px black;
         background: black;
         background: -moz-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* FF3.6-15 */
         background: -webkit-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* Chrome10-25,Safari5.1-6 */
         background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         );
         filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 );
      }
   }
`;

const FeaturedImage = props => {
   const { context } = props;
   const { featuredImage, id, __typename: type } = useContext(context);

   const [featuredImageInput, setFeaturedImageInput] = useState(
      featuredImage == null ? '' : featuredImage
   );
   const [showInput, setShowInput] = useState(featuredImage == null);

   const [setFeaturedImage, { data: fimgdata }] = useMutation(
      SET_FEATURED_IMAGE_MUTATION
   );

   const sendNewFeaturedImage = () => {
      if (!isExplodingLink(featuredImageInput)) {
         window.alert("That's not a valid featured image, sorry");
         return;
      }
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
         className={isVideo(featuredImage) ? 'video' : 'image'}
      >
         {featuredImage && <ExplodingLink url={featuredImage} alt="Featured" />}
         <TitleBar context={context} />
         {showInput && (
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
         )}
         <img
            src={showInput ? '/red-x.png' : '/edit-this.png'}
            className="editThis"
            alt="edit featured"
            onClick={showInputHandler}
         />
      </StyledFeaturedImage>
   );
};

export default FeaturedImage;
