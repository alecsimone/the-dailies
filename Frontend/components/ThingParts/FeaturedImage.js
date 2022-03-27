import Head from 'next/head';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { disabledCodewords } from '../../lib/ThingHandling';
import { isExplodingLink, isVideo } from '../../lib/UrlHandling';
import ExplodingLink from '../ExplodingLink';
import EditThis from '../Icons/EditThis';
import { home } from '../../config';

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
         ... on Stack {
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

const useFlexibleFeaturedImageData = (thingID, type) =>
   useSelector(state => state.stuff[`${type}:${thingID}`].featuredImage);

const StyledFlexibleFeaturedImage = styled.div`
   width: 100%;
   text-align: center;
   .featuredImageWrapper {
      position: relative;
      &.featuredTweet {
         padding-bottom: 1rem;
      }
      svg.editThis {
         position: absolute;
         right: 1rem;
         bottom: 2rem;
         height: ${props => props.theme.bigText};
         cursor: pointer;
         opacity: 0.4;
         &:hover {
            opacity: 0.8;
         }
      }
      a {
         line-height: 0;
      }
      img,
      video {
         width: 100%;
         height: 100%;
         object-fit: cover;
         z-index: 0;
      }
   }
   input {
      width: 50rem;
      max-width: 100%;
      position: relative;
      margin: 2rem auto;
      font-size: ${props => props.theme.smallText};
      text-align: center;
   }
`;

const FlexibleFeaturedImage = ({ canEdit, id, type }) => {
   const featuredImage = useFlexibleFeaturedImageData(id, type);
   const [editingUrl, setEditingUrl] = useState(
      featuredImage == null ||
         disabledCodewords.includes(featuredImage.toLowerCase()) ||
         featuredImage === ''
   );
   const [newUrl, setNewUrl] = useState(
      featuredImage != null ? featuredImage : ''
   );

   const [setFeaturedImage, { data: fimgdata }] = useMutation(
      SET_FEATURED_IMAGE_MUTATION,
      {
         onError: err => alert(err.message)
      }
   );

   const sendNewFeaturedImage = () => {
      if (
         !isExplodingLink(newUrl) &&
         !disabledCodewords.includes(newUrl.toLowerCase()) &&
         newUrl !== ''
      ) {
         window.alert("That's not a valid featured image, sorry");
         return;
      }
      setFeaturedImage({
         variables: {
            featuredImage: newUrl,
            id,
            type: 'Thing'
         }
      });
      if (!disabledCodewords.includes(newUrl.toLowerCase())) {
         setEditingUrl(false);
      }
   };

   return (
      <StyledFlexibleFeaturedImage className="featuredImage">
         <Head>
            <meta
               property={isVideo(featuredImage) ? 'og:video' : 'og:image'}
               content={
                  featuredImage != null ? featuredImage : `${home}/logo.png`
               }
            />
         </Head>
         {featuredImage != null &&
            !disabledCodewords.includes(featuredImage.toLowerCase()) &&
            featuredImage !== '' && (
               <div
                  className={
                     featuredImage.includes('twitter.com/') &&
                     featuredImage.includes('/status/')
                        ? 'featuredImageWrapper featuredTweet'
                        : 'featuredImageWrapper'
                  }
               >
                  {
                     <ExplodingLink
                        url={featuredImage}
                        alt="Featured"
                        className="featured"
                     />
                  }
                  {canEdit && featuredImage != null && (
                     <EditThis onClick={() => setEditingUrl(!editingUrl)} />
                  )}
               </div>
            )}
         {editingUrl && (
            <input
               placeholder="add featured image"
               value={newUrl}
               onChange={e => setNewUrl(e.target.value)}
               onKeyDown={e => {
                  if (e.key === 'Escape') {
                     setEditingUrl(false);
                  }
                  if (e.key === 'Enter') {
                     sendNewFeaturedImage();
                  }
               }}
            />
         )}
      </StyledFlexibleFeaturedImage>
   );
};

export default React.memo(FlexibleFeaturedImage);
