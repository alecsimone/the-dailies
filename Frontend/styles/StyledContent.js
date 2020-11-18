import styled from 'styled-components';
import { setAlpha, setLightness } from './functions';

const StyledContent = styled.section`
   margin: 0 0 3rem;
   padding-top: 0;
   ${props => props.theme.mobileBreakpoint} {
      margin: 5rem 0;
      padding: 1rem 2rem;
      padding-top: 0;
   }
   .contentExpansionToggleWrapper {
      text-align: center;
      margin: 3rem auto;
      .contentExpansionToggle {
         display: inline-flex;
         cursor: pointer;
         margin: auto;
         justify-content: center;
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         &:hover {
            .toggleOption {
               &.selected {
                  background: ${props => setAlpha(props.theme.midBlack, 0.4)};
               }
               &.unselected {
                  background: ;
               }
            }
         }
         .toggleOption {
            padding: 1rem;
            &:first-child {
               border-right: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
            }
            &.selected {
               background: ${props => props.theme.midBlack};
               &:hover {
                  background: ${props => props.theme.midBlack};
                  cursor: auto;
               }
            }
            &.unselected {
               &:hover {
                  background: ${props => props.theme.midBlack};
               }
            }
         }
      }
   }
   .contentSectionWrapper {
      padding: 1rem;
      background: ${props => props.theme.midBlack};
      border-top: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      ${props => props.theme.mobileBreakpoint} {
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         border-radius: 0.5rem;
      }
   }
   p,
   .graph {
      margin: 0;
   }
   p {
      max-width: 1000px;
      min-height: 1em;
   }
   a,
   a:visited {
      color: ${props => setLightness(props.theme.majorColor, 75)};
   }
   button.reorder {
      display: block;
      position: relative;
      z-index: 0;
      margin: 0 auto 1rem;
      opacity: 0.4;
      font-weight: 300;
      &:hover {
         opacity: 1;
      }
   }
   .reordering {
      background: ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
      cursor: pointer;
      border-radius: 3px;
   }
   .placeholder {
      background: ${props => props.theme.majorColor};
      color: ${props => props.theme.majorColor};
   }
   .dragged {
      background: ${props => props.theme.lowContrastGrey};
      border: 2px solid ${props => setAlpha(props.theme.highContrastGrey, 0.6)};
      user-select: none;
   }
   .contentBlock {
      position: relative;
      padding: 0;
      min-height: 15rem;
      margin: 0.6rem 0;
      border-bottom: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      ${props => props.theme.mobileBreakpoint} {
         padding: 1rem;
      }
      ${props => props.theme.desktopBreakpoint} {
         display: flex;
      }
      &.highlighted {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      }
      .overflowWrapper {
         width: 100%;
         overflow: hidden;
         .contentAndCommentContainer {
            width: 200%;
            display: flex;
            .contentWrapper {
               display: inline-block;
               width: 100%;
               margin-right: 4rem;
            }
            .commentsWrapper {
               display: inline-block;
               width: 100%;
            }
            .givesSize {
               height: auto;
            }
            .doesNotGiveSize {
               height: 0;
            }
         }
      }
      .contentArea {
         position: relative;
         flex-grow: 1;
         max-width: 100%;
         min-height: 15rem;
         ${props => props.theme.midScreenBreakpoint} {
            max-width: 60%;
            border-right: 1px solid
               ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
            padding-right: 1rem;
         }
         div.buttons {
            width: ${props => props.theme.smallText};
            position: absolute;
            bottom: 1rem;
            right: 0;
         }
         .commentButton {
            position: relative;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            width: ${props => props.theme.smallText};
            height: ${props => props.theme.smallText};
            margin-bottom: 1rem;
            span.commentCount {
               position: relative;
               font-size: ${props => props.theme.tinyText};
               font-weight: bold;
               z-index: 2;
               line-height: 1;
               margin-bottom: 0.4rem;
               ${props => props.theme.desktopBreakpoint} {
                  margin-bottom: 0.6rem;
               }
            }
            .commentIcon {
               position: absolute;
               left: 0;
               top: 0;
               width: 100%;
               height: 100%;
               z-index: 1;
            }
            &:hover {
               rect,
               polygon {
                  fill: ${props =>
                     setLightness(props.theme.lowContrastGrey, 40)};
               }
            }
         }
         img.buttons,
         svg.buttons {
            width: 100%;
            &.trashIcon {
               opacity: 0.8;
            }
            &.editThis {
               opacity: 0.4;
               cursor: pointer;
            }
            &.reorder {
               opacity: 0.4;
               &.reordering {
                  opacity: 1;
                  &:hover {
                     opacity: 0.4;
                  }
               }
            }
            &.directLink {
               opacity: 0.4;
            }
            &:hover {
               cursor: pointer;
               opacity: 1;
            }
         }
         button.miniReorder,
         form {
            max-width: 1040px;
            textarea {
               padding: 1rem;
               height: 4rem;
               position: relative;
               ${props => props.theme.scroll};
            }
         }
         button.miniReorder {
            margin: calc(0.8rem - 2px) calc(-1rem - 1px);
         }
         .contentPiece {
            margin: 0rem 0;
            flex-grow: 1;
            width: 100%;
            max-width: 900px;
            white-space: pre-wrap;
            padding: 2rem 4rem 2rem 1rem;
            ${props => props.theme.mobileBreakpoint} {
               padding: 2rem;
            }
            img,
            video,
            iframe {
               max-width: 100%;
            }
            iframe {
               width: 100%;
            }
            .smallThingCard {
               margin: 2rem 0;
            }
            .tweet.threadStarter {
               margin-bottom: 0;
               .quoteTweetContainer {
                  margin-top: 0;
                  margin-bottom: 0;
               }
            }
            .contentSummaryBox {
               &.expanded {
                  margin-top: 4rem;
               }
               span.summaryText {
                  color: white;
                  font-weight: bold;
               }
            }
            svg.arrow {
               width: ${props => props.theme.bigHead};
               cursor: pointer;
               margin: auto;
               display: block;
               rect {
                  fill: ${props => setLightness(props.theme.mainText, 70)};
               }
               &:hover {
                  rect {
                     fill: ${props => props.theme.mainText};
                  }
               }
            }
         }
      }
      .commentsArea {
         width: 100%;
         padding: 0;
         ${props => props.theme.midScreenBreakpoint} {
            padding: 0 2rem;
         }
         &.full {
            ${props => props.theme.midScreenBreakpoint} {
               width: 60%;
            }
         }
         &.collapsed,
         &.expanded {
            ${props => props.theme.midScreenBreakpoint} {
               width: 40%;
            }
         }
         &.expanded,
         &.full {
            .commentsContainer {
               max-height: 40rem;
               overflow: hidden;
               ${props => props.theme.scroll};
            }
         }
         .commentsContainer {
            .comment {
               max-width: 900px;
            }
            &.collapsed {
               opacity: 0.75;
               transition: opacity 0.25s ease-out;
               &:hover {
                  opacity: 1;
               }
               .commentMeta,
               .buttons,
               .replyContainer,
               .newCommentArea {
                  display: none;
               }
               .newCommentArea.noComments {
                  display: block;
                  form.richTextArea {
                     margin-top: 0;
                  }
               }
               .comment {
                  position: relative;
                  padding: 1rem;
                  margin: 1rem 0;
                  cursor: pointer;
                  max-height: 10rem;
                  overflow: hidden;
                  transition: all 0.2s;
                  .commentAndAuthorContainer {
                     margin-top: -1rem;
                     padding-right: 0;
                  }
                  img.avatar {
                     width: ${props => props.theme.smallText};
                     min-width: ${props => props.theme.smallText};
                     height: ${props => props.theme.smallText};
                  }
                  &:hover {
                     background: ${props => props.theme.lightBlack};
                     &:before {
                        background: linear-gradient(
                           transparent 7rem,
                           ${props => props.theme.lightBlack} 9.25rem
                        );
                     }
                  }
                  &:before {
                     content: '';
                     width: 100%;
                     height: 100%;
                     position: absolute;
                     left: 0;
                     top: 0;
                     background: linear-gradient(
                        transparent 7rem,
                        ${props => props.theme.midBlack} 9.25rem
                     );
                     transition: all none;
                  }
               }
               .moreCommentsCount {
                  font-size: ${props => props.theme.miniText};
                  text-align: center;
                  line-height: 1;
                  cursor: pointer;
               }
            }
            &.expanded {
               .comment {
                  cursor: pointer;
                  .replyContainer {
                     text-align: center;
                     font-size: ${props => props.theme.tinyText};
                     line-height: 1;
                     padding-top: 1rem;
                     margin-bottom: -1rem;
                     .comment {
                        display: none;
                     }
                  }
                  &:hover {
                     background: ${props => props.theme.lightBlack};
                  }
               }
               .newCommentArea {
                  textarea {
                     min-height: 5.75rem;
                  }
               }
            }
            &.full {
               .replyCount,
               .newCommentArea {
                  display: none;
               }
            }
         }
         .commentsControls {
            display: flex;
            align-items: center;
            justify-content: space-around;
            .siblingSlider {
               display: flex;
               align-items: center;
               svg.siblingSliderArrow {
                  width: ${props => props.theme.bigText};
                  cursor: pointer;
                  rect {
                     fill: ${props => setLightness(props.theme.mainText, 70)};
                  }
                  &:hover {
                     rect {
                        fill: ${props => props.theme.mainText};
                     }
                  }
               }
            }
            svg.commentDisplayControlArrow {
               display: block;
               cursor: pointer;
               height: ${props => props.theme.bigHead};
               transition: all 0.2s;
               rect {
                  fill: ${props => setLightness(props.theme.mainText, 70)};
               }
               &:hover {
                  rect {
                     fill: ${props => props.theme.mainText};
                  }
               }
            }
         }
      }
   }
   form {
      display: flex;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 4rem auto 0;
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
         .styleGuideLink {
            opacity: 0.7;
            display: inline-block;
            font-size: ${props => props.theme.tinyText};
         }
      }
   }
   textarea {
      width: 100%;
      position: relative;
      height: calc(5rem + 4px);
   }
   button {
      margin: 1rem 0;
      padding: 0.6rem;
      font-size: ${props => props.theme.smallText};
      font-weight: 500;
      &.post {
         background: ${props => setAlpha(props.theme.majorColor, 0.8)};
         color: ${props => props.theme.mainText};
         &:hover {
            background: ${props => props.theme.majorColor};
            box-shadow: 0 0 6px
               ${props => setAlpha(props.theme.majorColor, 0.6)};
         }
      }
   }
`;

export default StyledContent;
