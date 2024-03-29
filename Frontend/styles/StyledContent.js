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
   .addToStartWrapper {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-wrap: wrap;
      transition: background 0.1s;
      &.open {
         background: ${props => props.theme.midBlack};
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         border-radius: 0.5rem;
      }
      padding: 0 2rem;
      ${props => props.theme.mobileBreakpoint} {
         padding: 1rem 2rem;
      }
      ${props => props.theme.desktopBreakpoint} {
         padding: 1rem 3rem;
      }
      button.addToStartToggle {
         border: 1px solid ${props => props.theme.mainText};
         opacity: 0.6;
         margin-left: 3rem;
         &:hover {
            opacity: 1;
         }
      }
      .contentWrapper {
         flex-grow: 1;
         display: block;
         form {
            margin: 1.5rem auto 3rem;
         }
      }
   }
   .contentSectionWrapper {
      padding: 0;
      padding-bottom: 2rem;
      background: ${props => props.theme.midBlack};
      border-top: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      ${props => props.theme.mobileBreakpoint} {
         padding: 1rem;
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         border-radius: 0.5rem;
      }
      ${props => props.theme.midScreenBreakpoint} {
         padding: 0;
      }
      .contentBlock {
         position: relative;
         padding: 0;
         margin: 0;
         border-bottom: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         ${props => props.theme.mobileBreakpoint} {
            padding: 1rem;
         }
         ${props => props.theme.desktopBreakpoint} {
            display: flex;
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 0 3rem;
         }
         &.toplevel {
            border-bottom: none;
            ${props => props.theme.desktopBreakpoint} {
               display: block;
            }
         }
         &.highlighted {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         }
         &.clickToShowComments {
            .contentArea
               .contentPiece
               .overflowWrapper
               .contentAndCommentContainer {
               .commentsWrapper {
                  width: 100%;
               }
               .contentWrapper {
                  /* max-width: calc(50% - 0.5rem);
                  min-width: calc(50% - 0.5rem); */
                  border-right: none;
                  .theActualContent {
                     width: 100%;
                     margin: auto;
                  }
               }
            }
            .newcontentButtons {
               width: 100%;
               ${props => props.theme.mobileBreakpoint} {
                  width: calc(100% + 2rem);
                  margin-left: -1rem;
               }
               ${props => props.theme.desktopBreakpoint} {
                  width: calc(100% + 6rem);
                  margin-left: -3rem;
               }
               margin-right: -3rem;
               &.showingComments {
                  margin-left: 0; /* If we're showing comments inside of click to show comments, we don't need the negative margin to make up for the padding */
               }
               .buttonsContainer {
                  .buttonWrapper {
                     &:last-child {
                        border-right: none;
                     }
                  }
                  .votebar .middle {
                     border-right: none;
                  }
               }
            }
         }
         .contentArea {
            width: 100%;
            ${props => props.theme.midScreenBreakpoint} {
               padding-bottom: 0;
            }
            .contentPiece {
               margin: 0rem 0;
               flex-grow: 1;
               width: 100%;
               white-space: pre-wrap;
               padding: 0.5rem;
               ${props => props.theme.mobileBreakpoint} {
                  padding: 0 2rem;
               }
               ${props => props.theme.midScreenBreakpoint} {
                  height: 100%;
                  padding: 0;
               }
               .overflowWrapper {
                  width: 100%;
                  overflow: hidden;
                  margin: 0;
                  ${props => props.theme.midScreenBreakpoint} {
                     margin: 0;
                     overflow: hidden;
                  }
                  .contentAndCommentContainer {
                     &.cts {
                        /* width: calc(200% + 1rem); */
                        .commentsWrapper .commentsArea {
                           display: flex;
                           flex-wrap: wrap;
                           justify-content: center;
                           margin-top: 0;
                           form.richTextArea {
                              margin-top: 0;
                           }
                           .commentsControls {
                              width: 100%;
                           }
                        }
                     }
                     &.ncts {
                        width: 100%;
                        .contentWrapper {
                           max-width: min(60%, 1000px);
                           min-width: min(60%, 1000px);
                           .flexibleThingCard {
                              .contentBlock.clickToShowComments {
                                 .contentWrapper {
                                    max-width: 100%;
                                    border-right: none;
                                 }
                                 .commentsWrapper {
                                    width: 100%;
                                 }
                              }
                           }
                           border-right: 1px solid
                              ${props =>
                                 setAlpha(props.theme.lowContrastGrey, 0.2)};
                           padding-right: calc(
                              ${props => props.theme.smallText} + 2rem
                           );
                           margin-right: 0;
                        }
                        .commentsWrapper {
                           width: 40%;
                           &.noComments {
                              display: none;
                           }
                           .commentsArea {
                              width: 100%;
                              padding: 0 2rem;
                           }
                        }
                     }
                     display: flex;
                     ${props => props.theme.midScreenBreakpoint} {
                        width: 100%;
                        .flexibleThingCard {
                           .contentAndCommentContainer {
                              /* width: 200%; */
                           }
                        }
                     }
                     .givesSize {
                        height: auto;
                     }
                     .doesNotGiveSize {
                        height: 0;
                        /* ${props => props.theme.midScreenBreakpoint} {
                           height: auto;
                        } */
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
                     .regularThingCard {
                        border: 1px solid
                           ${props =>
                              setAlpha(props.theme.lowContrastGrey, 0.25)};
                     }
                     .tweet.threadStarter {
                        margin-bottom: 0;
                        .quoteTweetContainer {
                           margin-top: 0;
                           margin-bottom: 0;
                        }
                     }
                     svg.arrow.truncContArrow {
                        width: ${props => props.theme.bigText};
                        cursor: pointer;
                        margin: auto;
                        display: block;
                        rect {
                           fill: ${props =>
                              setLightness(props.theme.mainText, 70)};
                        }
                        &:hover {
                           rect {
                              fill: ${props => props.theme.mainText};
                           }
                        }
                     }
                     .contentSlider svg.arrow {
                        margin: 0; /* need this here because I'm not sure how to make the svg.arrow on ThingCards more specific from within them */
                     }
                  }
               }
               .contentWrapper,
                     .commentsWrapper {
                        display: inline-block;
                        width: 100%;
                        /* min-height: 15rem; */
                     }
                     .contentWrapper {
                        margin-right: 2rem;
                        z-index: 2;
                        .theActualContent {
                           width: 100%;
                           position: relative;
                           form {
                              margin: 0 auto;
                           }
                           img {
                              max-width: 100%;
                           }
                           article {
                              margin-bottom: 0;
                           }
                           padding: 1rem;
                           ${props => props.theme.midScreenBreakpoint} {
                              padding: 3rem 0;
                           }
                           .unsavedContent {
                              background: ${props =>
                                 setAlpha(props.theme.warning, 0.25)};
                              border: 1px solid
                                 ${props => props.theme.highContrastGrey};
                              border-radius: 3px;
                              margin-top: 2rem;
                              padding: 1rem;
                              h4 {
                                 text-align: center;
                                 margin: 0;
                                 line-height: 1;
                              }
                              div.visibilityInfo {
                                 text-align: center;
                                 font-size: ${props => props.theme.miniText};
                                 margin-bottom: 1rem;
                              }
                              .buttons {
                                 display: flex;
                                 flex-wrap: wrap;
                                 align-items: center;
                                 justify-content: space-around;
                                 max-width: 24rem;
                                 margin: auto;
                                 button.save {
                                    background: ${props =>
                                       setAlpha(
                                          props.theme.primaryAccent,
                                          0.75
                                       )};
                                 }
                              }
                           }
                           .flexibleThingCard {
                              ${props => props.theme.thingColors};
                              .contentSectionWrapper .contentBlock .contentArea .contentPiece .overflowWrapper .contentAndCommentContainer.cts {
                                 .contentWrapper {
                                    width: 100%;
                                 }
                                 .commentsWrapper {
                                    width: 100%;
                                 }
                              }
                           }
                        }
                     }
                     .commentsWrapper {
                        .commentsArea {
                           /* width: calc(100% - 4rem); */
                           margin-top: 2rem;
                           &.collapsed {
                              transition: opacity 0.25s ease-out;
                              &:hover {
                                 opacity: 1;
                              }
                           }
                           textarea {
                              padding: 1rem;
                              min-height: 6rem;
                           }
                        }
                        div.contentButtons {
                           ${props => props.theme.midScreenBreakpoint} {
                              display: none;
                           }
                        }
                     }
            }
            /* div.contentButtons {
               width: ${props => props.theme.smallText};
               position: absolute;
               bottom: 1rem;
               right: 0;
               display: flex;
               flex-direction: column;
               justify-content: space-between;
               &.allButtons {
                  min-height: 200px;
                  max-height: 240px;
               }
               &.someButtons {
                  min-height: 80px;
                  max-height: 140px;
               }
               ${props => props.theme.midScreenBreakpoint} {
                  right: 1rem;
               }
               .commentButtonWrapper {
                  margin-bottom: 0;
               }
               .addToContainer {
                  position: relative;
                  line-height: 0;
                  .addToInterface {
                     line-height: 1.6;
                  }
               }
               svg.buttons {
                  width: 100%;
                  &.trashIcon {
                     opacity: 0.8;
                  }
                  &.unlink {
                     opacity: 0.6;
                  }
                  &.addTo {
                     opacity: 0.4;
                     transform: rotate(45deg);
                     &.open {
                        transform: rotate(0deg);
                     }
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
            } */
            .otherLocations {
               font-size: ${props => props.theme.miniText};
               text-align: center;
               border-top: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
               max-width: 80%;
               margin: auto;
               padding: 1rem 0;
               ${props => props.theme.midScreenBreakpoint} {
                  padding: 1rem 0 0;
               }
               .basicInfo {
                  a {
                     cursor: pointer;
                  }
               }
            }
            .votebar {
               width: calc(100% - 4rem);
               margin: 0 0 1rem 0;
               max-width: 900px;
               &.mini {
                  margin: 0;
               }
            }
            .flexibleThingCard .votebar {
               margin-top: 2rem; // If we have a flexible thing card embedded in our content, we need the votebar to keep the margin-top. The selector above is for the votebar that is part of the content piece
               &.mini {
                  margin: 0; // However, if this is the mini votebar inside the flexible thing card buttons, we don't want a margin
               }
               width: 100%;
            }
         }
         .buttonsPlaceholder {
            position: relative;
            width: calc(60% + 3.5rem);
            height: 0px;
         }
         .newcontentButtons {
            margin-left: 0;
            width: 60%;
            position: relative;
            background: ${props => props.theme.midBlack};
            --votersHeight: 4rem;
            z-index: 2;
            ${props => props.theme.mobileBreakpoint} {
               margin-left: -1rem;
               width: calc(60% + 0.6rem)
            }
            ${props => props.theme.desktopBreakpoint} {
               --votersHeight: 5rem;
               width: calc(min(60%, 1000px) + 2.5rem);
               margin-left: -3rem; /* At this screen width, contentBlock has 3rem of padding, so we need to make up for that */
            }
            ${props => props.theme.midScreenBreakpoint} {
               width: calc(min(60%, 1000px) + 3rem);
            }
            &.withVoters {
               margin-top: var(--votersHeight, 4rem);
               .buttons .votebar .right {
                  border-left: none;
               }
            }
            .buttonsContainer {
               display: flex;
               justify-content: space-between;
               align-items: stretch;
               border-top: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
               ${props => props.theme.midScreenBreakpoint} {
                  width: 100%;
               }
               .buttonWrapper {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 1rem 0;
                  flex-grow: 1;
                  text-align: center;
                  border-right: 1px solid
                     ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
                  cursor: pointer;
                  &:hover {
                     background: ${props =>
                        setAlpha(props.theme.lowContrastGrey, 0.25)};
                  }
                  &.votebarWrapper {
                     justify-content: stretch;
                     .votebar {
                        width: 100%;
                     }
                  }
               }
               svg.buttons {
                  width: 100%;
                  max-width: ${props => props.theme.bigText};
                  height: auto;
                  &.trashIcon {
                     opacity: 0.8;
                  }
                  &.unlink {
                     opacity: 0.6;
                  }
                  &.addTo {
                     opacity: 0.4;
                     transform: rotate(45deg);
                     &.open {
                        transform: rotate(0deg);
                     }
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
               .commentButtonWrapper {
                  margin: auto;
                  margin-bottom: 0;
                  width: ${props => props.theme.bigText};
                  height: ${props => props.theme.bigText};
                  span.commentCount {
                     margin-bottom: 0.5rem;
                  }
               }
               .votebar {
                  margin: 0;
                  padding: 0;
                  justify-content: center;
                  border: none;
                  background: none;
                  --scoreWidth: 6rem;
                  ${props => props.theme.midScreenBreakpoint} {
                     --scoreWidth: 10rem;
                  }
                  &.mini {
                     .middle,
                     .right {
                        display: none;
                     }
                  }
                  .left {
                     padding: 0;
                     width: 100%;
                     img.voteButton {
                        max-width: ${props => props.theme.bigText};
                        height: auto;
                     }
                  }
                  .middle {
                     background: ${props => props.theme.midBlack};
                     position: absolute;
                     display: flex;
                     align-items: center;
                     bottom: 100%;
                     padding: 0 0 0 1rem;
                     ${props => props.theme.midScreenBreakpoint} {
                        padding-left: 2rem;
                     }
                     left: var(--scoreWidth, 6rem);
                     width: calc(100% - var(--scoreWidth, 6rem));
                     height: var(--votersHeight, 4rem);
                     border-top: 1px solid
                        ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
                     border-left: none;
                     border-right: 1px solid
                        ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
                     text-align: left;
                  }
                  .right {
                     background: ${props => props.theme.midBlack};
                     position: absolute;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     bottom: 100%;
                     left: 0;
                     width: var(--scoreWidth, 6rem);
                     padding: 0;
                     line-height: 1;
                     height: var(--votersHeight, 4rem);
                     border: 1px solid
                        ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
                     border-bottom: none;
                     ${props => props.theme.midScreenBreakpoint} {
                        border-left: none;
                     }
                  }
               }
               .addToContainer {
                  line-height: 0;
                  .addToInterface {
                     line-height: 1.6;
                  }
               }
               .privacyInterfaceWrapper {
                  position: absolute;
                  width: 100%;
                  top: 100%;
                  left: 0;
                  background: ${props => props.theme.deepBlack};
                  border: 1px solid ${props =>
                     setAlpha(props.theme.lowContrastGrey, 0.2)};
                  .privacyInterface {
                     margin: 0;
                     padding: 1rem;
                  }
               }
            }
         }
      }
      .sliderAndShowFormWrapper {
         .contentSlider {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 1rem;
            --arrow-width: ${props => props.theme.bigText};
            svg.arrow {
               width: var(--arrow-width);
               margin: 0;
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
            span.sliderText {
               &.noLeft {
                  margin-left: var(--arrow-width);
               }
               &.noRight {
                  margin-right: var(--arrow-width);
               }
            }
         }
      }
      .expansionControls {
         display: flex;
         align-items: center;
         justify-content: center;
         margin: 2rem auto;
         svg {
            opacity: 0.7;
            cursor: pointer;
            &:hover {
               opacity: 0.9;
            }
         }
         svg.arrow {
            width: ${props => props.theme.bigText};
            margin-left: 2rem;
            margin-right: -1rem; /* because the arrow icon doesn't fill up its container, this helps everything look properly centered */
         }
         svg.x {
            width: ${props => props.theme.smallText};
            transform: rotate(45deg);
            &.collapse {
               transform: rotate(0);
            }
         }
      }
      button.reorder {
         display: block;
         position: relative;
         z-index: 0;
         margin: 2rem auto;
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
         border: 2px solid
            ${props => setAlpha(props.theme.highContrastGrey, 0.6)};
         user-select: none;
      }
   }
   form {
      display: flex;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 3rem auto 0;
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
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
