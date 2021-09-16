import styled, { ThemeContext } from 'styled-components';
import { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TitleBar from '../ThingParts/TitleBar';
import { ThingContext } from '../../pages/thing';
import AuthorLink from '../ThingParts/AuthorLink';
import { setAlpha, setLightness } from '../../styles/functions';
import TimeAgo from '../TimeAgo';
import TagIcon from '../Icons/Tag';
import CommentsButton from '../ThingParts/CommentsButton';
import Content from '../ThingParts/Content';
import TaxBox from '../ThingParts/TaxBox';
import Comments from '../ThingParts/Comments';
import PrivacyInterface from '../ThingParts/PrivacyInterface';
import TrashIcon from '../Icons/Trash';
import ColorSelector from '../ThingParts/ColorSelector';
import VoteBar from '../ThingParts/VoteBar';
import { smallThingCardFields } from '../../lib/CardInterfaces';
import { ALL_THINGS_QUERY, disabledCodewords } from '../../lib/ThingHandling';
import { PUBLIC_THINGS_QUERY } from '../Archives/PublicThings';
import FlexibleFeaturedImage from '../ThingParts/FlexibleFeaturedImage';
import { isVideo } from '../../lib/UrlHandling';

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
   padding: 1rem 2rem 1.5rem;
   border-radius: 3px 3px 0.5rem 0.5rem;
   header.flexibleThingHeader {
      background: ${props => props.theme.midBlack};
      padding: 1rem 2rem 1.5rem;
      margin: -1rem -2rem -1.5rem;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .thumbWrapper {
         width: 7.5rem;
         height: 8.5rem;
         padding-top: 1rem;
         img.thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
         }
      }
      .headerRight {
         margin-left: 2rem;
         flex-grow: 1;
         .titleBarContainer {
            margin-bottom: 0.5rem;
            height: calc(
               4rem * 1.4
            ); /* The titlebar has a font-size of 4rem and a line-height of 1.4. It's dynamically sized as we type in it (and should be automatically sized initially as well), but this is just to set a default size */
            form {
               max-height: 100%;
               textarea {
                  max-height: 100%;
               }
            }
         }
         .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            a,
            a:visited {
               color: ${props =>
                  setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
               &:hover {
                  color: ${props => setLightness(props.theme.majorColor, 50)};
                  text-decoration: none;
               }
            }
            .info {
               display: flex;
               align-items: center;
               font-size: ${props => props.theme.tinyText};
               color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
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
               max-width: min(50%, 28rem);
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
      .votebar {
         width: 100%;
         margin-top: 2rem;
      }
   }
   .body {
      margin-top: 3rem;
      .featuredImage {
         height: auto;
         margin: -3rem -2rem 0;
         width: calc(100% + 4rem);
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
   expanded,
   canEdit,
   linkedPiece,
   linkedComment
}) => {
   const {
      id,
      author,
      createdAt,
      color,
      title,
      content = [],
      copiedInContent = [],
      comments,
      partOfTags: tags,
      featuredImage,
      votes
   } = useContext(ThingContext);

   const [showingContent, setShowingContent] = useState(
      expanded && (content.length > 0 || copiedInContent.length > 0)
   );
   const [showingTaxes, setShowingTaxes] = useState(
      expanded && tags.length > 0
   );
   const [showingComments, setShowingComments] = useState(
      expanded && comments.length > 0
   );
   const [showingPrivacy, setShowingPrivacy] = useState(false);
   const [showingColors, setShowingColors] = useState(false);
   const [showingFeaturedImage, setShowingFeaturedImage] = useState(
      expanded &&
         featuredImage != null &&
         !disabledCodewords.includes(featuredImage)
   );

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

   return (
      <StyledFlexibleThingCard
         style={{ borderTop: `0.5rem solid ${highlightColor}` }}
      >
         <header className="flexibleThingHeader">
            {!(
               showingFeaturedImage ||
               featuredImage == null ||
               isVideo(featuredImage) ||
               disabledCodewords.includes(featuredImage.toLowerCase()) ||
               isTweet ||
               featuredImage.includes('instagram.com/p/')
            ) && (
               <div className="thumbWrapper">
                  <img className="thumb" src={featuredImage} alt="thumbnail" />
               </div>
            )}
            <div className="headerRight">
               <TitleBar context={ThingContext} key={`title-${id}`} />
               <div className="toolbar">
                  <div className="info">
                     <AuthorLink author={author} key={`author-${id}`} />
                     <div className="ago">
                        <TimeAgo time={createdAt} key={`ago-${id}`} />
                     </div>
                  </div>
                  <div className="buttons">
                     <button
                        onClick={() =>
                           setShowingFeaturedImage(!showingFeaturedImage)
                        }
                     >
                        I
                     </button>
                     <TagIcon onClick={() => setShowingTaxes(!showingTaxes)} />
                     <button onClick={() => setShowingContent(!showingContent)}>
                        C
                     </button>
                     <CommentsButton
                        onClick={() => setShowingComments(!showingComments)}
                        count={comments.length}
                        key={`comments-button-${id}`}
                     />
                     <button onClick={() => setShowingPrivacy(!showingPrivacy)}>
                        P
                     </button>
                     <button
                        className="colors"
                        style={{ background: highlightColor }}
                        onClick={() => setShowingColors(!showingColors)}
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
            <VoteBar votes={votes} id={id} type="Thing" />
         </header>
         {(showingTaxes ||
            showingContent ||
            showingComments ||
            showingPrivacy ||
            showingColors ||
            showingFeaturedImage) && (
            <div className="body">
               {showingFeaturedImage && (
                  <FlexibleFeaturedImage
                     canEdit={canEdit}
                     context={ThingContext}
                     key={`featured-image-${id}`}
                  />
               )}
               {showingColors && (
                  <ColorSelector
                     initialColor={color}
                     type="Thing"
                     id={id}
                     key={`color-${id}`}
                  />
               )}
               {showingPrivacy && (
                  <PrivacyInterface
                     canEdit={canEdit}
                     context={ThingContext}
                     key={`privacy-${id}`}
                  />
               )}
               {showingTaxes && (
                  <TaxBox
                     canEdit={canEdit}
                     personal={false}
                     key={`taxes-${id}`}
                  />
               )}
               {showingContent && (
                  <Content
                     context={ThingContext}
                     canEdit={canEdit}
                     linkedPiece={linkedPiece}
                     key={`content-${id}`}
                  />
               )}
               {showingComments && (
                  <Comments
                     context={ThingContext}
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
