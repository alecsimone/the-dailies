import styled, { ThemeContext } from 'styled-components';
import React, { useContext, useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TitleBar from '../ThingParts/TitleBar';
import { ThingsContext } from '../ThingsDataProvider';
import AuthorLink from '../ThingParts/AuthorLink';
import { setAlpha, setLightness } from '../../styles/functions';
import TimeAgo from '../TimeAgo';
import TagIcon from '../Icons/Tag';
import CommentsButton from '../ThingParts/CommentsButton';
import Content from '../ThingParts/Content';
import TaxBox from '../ThingParts/TaxBox';
import Comments from '../ThingParts/Comments';
import PrivacyInterface from '../ThingParts/PrivacyInterface';
import ArrowIcon from '../Icons/Arrow';
import TrashIcon from '../Icons/Trash';
import ColorSelector from '../ThingParts/ColorSelector';
import VoteBar from '../ThingParts/VoteBar';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import { ALL_THINGS_QUERY, disabledCodewords } from '../../lib/ThingHandling';
import { PUBLIC_THINGS_QUERY } from '../Archives/PublicThings';
import FlexibleFeaturedImage from '../ThingParts/FlexibleFeaturedImage';
import { isVideo } from '../../lib/UrlHandling';
import ContentIcon from '../Icons/Content';
import ImageIcon from '../Icons/ImageIcon';
import LockIcon from '../Icons/Lock';
import SingleContentSlider from '../ThingParts/SingleContentSlider';

const DELETE_THING_MUTATION = gql`
   mutation DELETE_THING_MUTATION($id: ID!) {
      deleteThing(id: $id) {
         ${smallThingCardFields}
      }
   }
`;

const StyledFlexibleThingCard = styled.article`
   width: 100%;
   ${props => props.theme.thingColors};
   padding: 0;
   ${props => props.theme.mobileBreakpoint} {
      padding: 1rem 2rem 1.5rem;
   }
   border-radius: 3px 3px 0.5rem 0.5rem;
   &.small {
      border-radius: 0;
      header.flexibleThingHeader {
         background: ${props => props.theme.midBlack};
         .headerTop .headerRight {
            .titleWrapper {
               h3, textarea, a, a:visited {
                  font-size: ${props => props.theme.smallText};
                  color: ${props => setLightness(props.theme.mainText, 70)};
                  &:hover {
                     color: ${props => setLightness(props.theme.mainText, 90)};
                  }
               }
            }
            .toolbar {
               margin-top: -1.25rem;
               flex-wrap: wrap;
               .buttons {
                  height: ${props => props.theme.miniText};
                  button.colors {
                     width: ${props => props.theme.miniText};
                  }
               }
            }
         }
      }
   }
   header.flexibleThingHeader {
      background: ${props => props.theme.midBlack};
      padding: 1rem;
      margin: 0;
      ${props => props.theme.mobileBreakpoint} {
         padding: 1rem 2rem 1.5rem;
         margin: -1rem -2rem -1.5rem;
      }
      max-width: calc(100% + 2rem); /* I believe what's happening here is that we need to add 2rem to make up for the negative margin on this element?  */
      ${props => props.theme.mobileBreakpoint} {
         max-width: calc(100% + 4rem);
      }
      .headerTop {
         display: flex;
         align-items: center;
         .thumbWrapper {
            width: 7.5rem;
            height: 8.5rem;
            padding-top: 1rem;
            img.thumb {
               width: 100%;
               height: 100%;
               object-fit: contain;
               ${props => props.theme.mobileBreakpoint} {
                  object-fit: cover;
               }
            }
         }
         .headerRight {
            &.withThumb {
               margin-left: 2rem;
            }
            flex-grow: 1;
            .titleWrapper {
               h3, textarea, a, a:visited {
                  font-size: ${props => props.theme.smallHead};
                  font-weight: 600;
                  color: ${props => setAlpha(props.theme.mainText, 1)};
                  padding: 0;
                  margin: 0;
                  line-height: 1.4;
                  width: 100%;
                  border: none;
               }
               .titleBarContainer {
                  margin-bottom: 1rem;
                  ${props => props.theme.mobileBreakpoint} {
                     margin-bottom: 0.75rem;
                  }
                  padding: 0;

               }
            }
            .toolbar {
               display: flex;
               justify-content: space-between;
               align-items: center;
               flex-wrap: wrap;
               ${props => props.theme.mobileBreakpoint} {
                  flex-wrap: nowrap;
               }
               margin-top: -2rem;
               > * {
                  margin-top: 2rem;
               }
               a,
               a:visited {
                  color: ${props =>
                     setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
                  &:hover {
                     color: ${props =>
                        setLightness(props.theme.majorColor, 50)};
                     text-decoration: none;
                  }
               }
               .info {
                  display: flex;
                  align-items: center;
                  font-size: ${props => props.theme.tinyText};
                  color: ${props =>
                     setLightness(props.theme.lowContrastGrey, 60)};
                  font-weight: 300;
                  a {
                     line-height: 0; /* we need this to keep the link from throwing off the align-items: center */
                  }
                  .authorBlock {
                     display: inline-flex;
                     align-items: center;
                     margin-right: 0.5rem;
                     cursor: pointer;
                     .authorLink {
                        margin-bottom: 2px;
                     }
                     .authorImg {
                        width: 2rem;
                        height: 2rem;
                        border-radius: 100%;
                        margin-right: 0.5rem;
                     }
                  }
               }
               .buttons {
                  flex-grow: 1;
                  max-width: min(65%, 360px);
                  min-width: 240px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  height: ${props => props.theme.smallText};
                  svg {
                     height: 100%;
                     cursor: pointer;
                     margin: 0;
                     &.tagIcon {
                        margin: 0;
                     }
                     &.arrow {
                        width: ${props => props.theme.bigText};
                        height: auto;
                        opacity: 0.4;
                        &:hover {
                           opacity: 0.75;
                        }
                        rect {
                           /* fill: ${props => props.theme.lowContrastGrey}; */
                        }
                     }
                     &:last-child {
                        margin-right: 0;
                     }
                  }
                  .commentButtonWrapper {
                     margin: 0 0 -0.3rem;
                     .commentButton {
                        svg {
                           margin: 0;
                        }
                        span.commentCount {
                           margin-bottom: 0.4rem;
                        }
                     }
                  }
                  .trash {
                     &.deleting {
                        ${props => props.theme.twist};
                     }
                  }
                  button {
                     margin: 0;
                     font-weight: 600;
                     border: 3px solid ${props => props.theme.lowContrastGrey};
                     color: ${props => props.theme.lowContrastGrey};
                     padding: 4px 0.5rem;
                     &.colors {
                        width: ${props => props.theme.smallText};
                        height: 100%;
                        border-radius: 50%;
                        border: none;
                     }
                  }
               }
            }
         }
      }
      .votebar {
         width: 100%;
         margin-top: 2rem;
      }
   }
   .body {
      margin-top: 3rem;
      .featuredImage {
         height: auto;
         width: 100%;
         margin: -3rem 0 0;
         ${props => props.theme.mobileBreakpoint} {
            margin: -3rem -2rem 0;
            width: calc(100% + 4rem);
         }
      }
      .taxboxContainer {
         margin-top: -1rem;
      }
      .content {
         margin-top: 3rem;
         margin-bottom: 1rem;
         padding: 0;
      }
      .commentsSection {
         margin-top: 3rem;
      }
      .privacyInterface {
         margin: 3rem 0;
      }
      .colorSelector {
         position: relative;
         max-width: 34rem;
         margin: 4rem 0 2rem;
         .colorDisplay {
            position: absolute;
            left: 0.5rem;
            bottom: 0.75rem;
            width: 2rem;
            height: 2rem;
            border-radius: 3px;
            border: 1px solid ${props => props.theme.lowContrastGrey};
         }
      }
   }
`;

const FlexibleThingCard = ({
   thingData,
   expanded = false,
   contentType = 'full',
   canEdit,
   linkedPiece,
   linkedComment,
   titleLink,
   borderSide = 'top'
}) => {
   const {
      id,
      author,
      createdAt,
      color,
      title,
      content = [],
      copiedInContent = [],
      contentOrder,
      unsavedNewContent,
      comments,
      partOfTags: tags,
      partOfStacks: stacks,
      featuredImage,
      votes,
      privacy,
      individualViewPermissions
   } = thingData;

   const { addThingID, removeThingID } = useContext(ThingsContext);

   /* eslint-disable react-hooks/exhaustive-deps */
   useEffect(() => {
      addThingID(id);
      return () => {
         removeThingID(id);
      };
   }, []);
   /* eslint-enable */

   // Setting the toggle expansion arrow to the opposite of the expanded value would be confusing if we got a thing which is intended to be expanded, but has no fields with data, e.g. if we are looking at a new thing that doesn't have any content, etc yet. So we check for that here.
   let initialToggleDirection = 'down';
   if (expanded) {
      if (
         content.length > 0 ||
         copiedInContent.length > 0 ||
         tags.length > 0 ||
         comments.length > 0 ||
         (featuredImage != null &&
            !disabledCodewords.includes(featuredImage.toLowerCase()))
      ) {
         initialToggleDirection = 'up';
      }
   }

   const [expansion, setExpansion] = useState({
      content: expanded && (content.length > 0 || copiedInContent.length > 0),
      taxes: expanded && tags.length > 0,
      comments: expanded && comments.length > 0,
      privacy: false,
      colors: false,
      featuredImage:
         expanded &&
         featuredImage != null &&
         !disabledCodewords.includes(featuredImage.toLowerCase()),
      votebar: expanded,
      toggleDirection: initialToggleDirection
   });

   const expansionHandler = (property, value) => {
      if (property === 'toggleDirection') {
         // Toggle direction directly represents the direction the toggle expansion arrow points, which tells the user what it is going to do. So if the toggle direction is up, we want to collapse all the other values, i.e. set them to false, and if it's down we want to set them to true. Then we set toggle direction to its opposite
         const newValue = value === 'down';
         const newExpansionObject = {
            content: newValue,
            taxes: newValue,
            comments: newValue,
            featuredImage: newValue,
            privacy: expansion.privacy,
            colors: expansion.colors,
            toggleDirection: value === 'up' ? 'down' : 'up'
         };

         // We also do not want to expand the privacy and color selector sections with an expand command, but we do want to collapse them with a collapse command. So if the value is up, we do set them to false, otherwise we ignore them.
         if (value === 'up') {
            newExpansionObject.privacy = false;
            newExpansionObject.colors = false;
         }
         setExpansion(newExpansionObject);
      } else {
         // If this change would cause more than two sections to be opposed to the toggle expansion arrow (ie, if more than two things are expanded while the arrow points down), we want to flip the direction of the arrow.
         // Note that this shouldn't include the privacy and colors sections when the arrow is pointing up
         const arrowValue = expansion.toggleDirection === 'up'; // If something is expanded, it would have a value of true and be opposed to the arrow when the arrow is pointing down, because the down arrow would expand it, and it's already expanded. So if the arrow is pointing up, it is opposed to things with a value of false. Thus we want arrowValue to be true when it's pointing up and false when it's pointing down.
         let opposedSectionsCount = 0;
         const sections = Object.keys(expansion);
         sections.forEach(section => {
            if (expansion[section] !== arrowValue) {
               // eg, if the section is expanded (true), but the arrow is pointing down (false)
               if (
                  expansion.toggleDirection !== 'up' ||
                  (section !== 'privacy' && section !== 'colors')
               )
                  // We don't want to count privacy or colors when the arrow is pointing up, so this just filters out those instances
                  opposedSectionsCount += 1;
            }
         });
         let newArrowValue = expansion.toggleDirection;
         if (opposedSectionsCount > 2) {
            newArrowValue = expansion.toggleDirection === 'up' ? 'down' : 'up';
         }

         setExpansion({
            ...expansion,
            [property]: value,
            toggleDirection: newArrowValue
         });
      }
   };

   const [deleteThing, { loading: deleting }] = useMutation(
      DELETE_THING_MUTATION,
      {
         onCompleted: data => {
            Router.push({
               pathname: '/'
            });
         },
         refetchQueries: [
            { query: ALL_THINGS_QUERY },
            { query: PUBLIC_THINGS_QUERY }
         ],
         onError: err => alert(err.message)
      }
   );

   const { lowContrastGrey } = useContext(ThemeContext);

   const highlightColor = color != null ? color : lowContrastGrey;

   let isTweet = false;
   if (featuredImage) {
      const tweetMatches = featuredImage.match(/twitter\.com\/\w+\/status/i);
      if (tweetMatches) {
         isTweet = true;
      }
   }

   const showingThumb = !(
      expansion.featuredImage ||
      featuredImage == null ||
      isVideo(featuredImage) ||
      disabledCodewords.includes(featuredImage.toLowerCase()) ||
      isTweet ||
      featuredImage.includes('instagram.com/p/')
   );

   const styleObj = { borderTop: `0.5rem solid ${highlightColor}` };
   if (borderSide === 'left') {
      styleObj.borderLeft = `0.5rem solid ${highlightColor}`;
      styleObj.borderTop = 'none';
   }

   return (
      <StyledFlexibleThingCard
         style={styleObj}
         className={`flexibleThingCard ${expanded ? 'big' : 'small'}`}
      >
         <header className="flexibleThingHeader">
            <div className="headerTop">
               {showingThumb && (
                  <div className="thumbWrapper">
                     <img
                        className="thumb"
                        src={featuredImage}
                        alt="thumbnail"
                     />
                  </div>
               )}
               <div
                  className={`headerRight${showingThumb ? ' withThumb' : ''}`}
               >
                  <div className="titleWrapper">
                     {!titleLink && (
                        <TitleBar
                           key={`title-${id}`}
                           type="Thing"
                           title={title}
                           id={id}
                        />
                     )}
                     {titleLink && (
                        <a href={`/thing?id=${id}`}>
                           {title.length > 60
                              ? `${title.substring(0, 60).trim()}...`
                              : title}
                        </a>
                     )}
                  </div>
                  <div className="toolbar">
                     <div className="info">
                        <AuthorLink author={author} key={`author-${id}`} />
                        <div className="ago">
                           <TimeAgo time={createdAt} key={`ago-${id}`} />
                        </div>
                     </div>
                     <div className="buttons">
                        <ArrowIcon
                           pointing={expansion.toggleDirection}
                           onClick={() =>
                              expansionHandler(
                                 'toggleDirection',
                                 expansion.toggleDirection
                              )
                           }
                        />
                        <ImageIcon
                           onClick={() =>
                              expansionHandler(
                                 'featuredImage',
                                 !expansion.featuredImage
                              )
                           }
                        />
                        <TagIcon
                           onClick={() =>
                              expansionHandler('taxes', !expansion.taxes)
                           }
                        />
                        <ContentIcon
                           onClick={() =>
                              expansionHandler('content', !expansion.content)
                           }
                        />
                        <CommentsButton
                           onClick={() =>
                              expansionHandler('comments', !expansion.comments)
                           }
                           count={comments == null ? 0 : comments.length}
                           key={`comments-button-${id}`}
                        />
                        <LockIcon
                           onClick={() =>
                              expansionHandler('privacy', !expansion.privacy)
                           }
                           privacy={privacy}
                        />
                        <button
                           className="colors"
                           style={{ background: highlightColor }}
                           onClick={() =>
                              expansionHandler('colors', !expansion.colors)
                           }
                        />
                        <TrashIcon
                           classname={deleting ? 'trash deleting' : 'trash'}
                           onClick={() => {
                              if (
                                 confirm(
                                    `Are you sure you want to delete the thing ${title}?`
                                 )
                              ) {
                                 deleteThing({
                                    variables: {
                                       id
                                    }
                                 });
                              }
                           }}
                        />
                     </div>
                  </div>
               </div>
            </div>
            {expansion.votebar && (
               <VoteBar votes={votes} id={id} type="Thing" />
            )}
         </header>
         {(expansion.taxes ||
            expansion.content ||
            expansion.comments ||
            expansion.privacy ||
            expansion.colors ||
            expansion.featuredImage) && (
            <div className="body">
               {expansion.featuredImage && (
                  <FlexibleFeaturedImage
                     canEdit={canEdit}
                     featuredImage={featuredImage}
                     id={id}
                     key={`featured-image-${id}`}
                  />
               )}
               {expansion.colors && (
                  <ColorSelector
                     initialColor={color}
                     type="Thing"
                     id={id}
                     key={`color-${id}`}
                  />
               )}
               {expansion.privacy && (
                  <PrivacyInterface
                     canEdit={canEdit}
                     id={id}
                     privacy={privacy}
                     individualViewPermissions={individualViewPermissions}
                     key={`privacy-${id}`}
                  />
               )}
               {expansion.taxes && (
                  <TaxBox
                     canEdit={canEdit}
                     personal={false}
                     id={id}
                     tags={tags}
                     stacks={stacks}
                     key={`taxes-${id}`}
                  />
               )}
               {expansion.content && contentType === 'full' && (
                  <Content
                     id={id}
                     fullThingData={thingData}
                     contentOrder={contentOrder}
                     copiedInContent={copiedInContent}
                     unsavedNewContent={unsavedNewContent}
                     type="Thing"
                     canEdit={canEdit}
                     linkedPiece={linkedPiece}
                     key={`content-${id}`}
                  />
               )}
               {expansion.content && contentType === 'single' && (
                  <SingleContentSlider
                     canEdit={canEdit}
                     expanded={expanded}
                     thingID={id}
                     content={content}
                     copiedInContent={copiedInContent}
                     contentOrder={contentOrder}
                     unsavedNewContent={unsavedNewContent}
                  />
               )}
               {expansion.comments && (
                  <Comments
                     id={id}
                     comments={comments}
                     type="Thing"
                     linkedComment={linkedComment}
                     key={`comments-${id}`}
                  />
               )}
            </div>
         )}
      </StyledFlexibleThingCard>
   );
};

export default FlexibleThingCard;
